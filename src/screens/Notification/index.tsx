import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import dayjs from 'dayjs';

import { useDialog } from 'components/common/Dialog/Provider';
import { useFetchNotifications } from 'hooks/queries/notification/useFetchNotifications';
import { useConfirmNotification } from 'hooks/queries/notification/useConfirmNotification';
import { useFetchMyDowithInfo } from 'hooks/queries/member/useFetchMyDowithInfo';
import { useNotificationSettings } from 'hooks/queries/member/useNotificationSettings';
import { useAppState } from 'hooks/shared/useAppState';
import { useStore } from 'stores/index';
import { checkSystemPermission } from 'utils/notification';
import { formatNotificationDate } from 'utils/date';
import { theme } from 'styles/theme';
import type { notificationSchemeType } from 'types/notification/scheme/api';

const Tab = createMaterialTopTabNavigator();

interface NotificationItemProps extends notificationSchemeType {
  type: 'NORMAL' | 'EVENT';
  onPress: (id: number) => void;
}

const NotificationItem = ({
  notificationId,
  title,
  body,
  image,
  isConfirmed,
  createdAt,
  type,
  onPress,
}: NotificationItemProps) => (
  <Pressable style={[styles.item, isConfirmed && styles.itemConfirmed]} onPress={() => onPress(notificationId)}>
    {type === 'NORMAL' &&
      (image ? <Image source={{ uri: image }} style={styles.itemImage} /> : <View style={styles.itemImage} />)}
    <View style={styles.itemContent}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemBody} numberOfLines={2}>
        {body}
      </Text>
      <Text style={styles.itemDate}>{formatNotificationDate(createdAt)}</Text>
    </View>
  </Pressable>
);

const NotificationList = ({ type }: { type: 'NORMAL' | 'EVENT' }) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchNotifications(type);
  const { mutate: confirmNotification } = useConfirmNotification();

  const notifications = useMemo(() => data?.pages.flatMap(page => page.data.notifications) ?? [], [data]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handlePress = useCallback(
    (notificationId: number) => {
      confirmNotification(notificationId);
    },
    [confirmNotification],
  );

  const renderItem = useCallback(
    ({ item }: { item: notificationSchemeType }) => <NotificationItem {...item} type={type} onPress={handlePress} />,
    [type, handlePress],
  );

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.notificationId.toString()}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const NotificationTab = () => <NotificationList type="NORMAL" />;

const EventTab = () => {
  const { showDialog, hideDialog } = useDialog();
  const { data: myDowithInfo } = useFetchMyDowithInfo();
  const { mutate: mutateNotificationSettings } = useNotificationSettings();
  const { marketing, updateNotificationSettings } = useStore(
    ({ notificationSettings: { marketing }, notificationActions: { updateNotificationSettings } }) => ({
      marketing,
      updateNotificationSettings,
    }),
  );

  const pendingMarketingRef = useRef(false);
  const [isSystemNotificationEnabled, setIsSystemNotificationEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    checkSystemPermission().then(setIsSystemNotificationEnabled);
  }, []);

  const enableMarketing = (withServerSync = true) => {
    updateNotificationSettings({ marketing: true });
    if (withServerSync) {
      const { notificationSettings } = useStore.getState();
      mutateNotificationSettings({
        baseAlarmYn: notificationSettings.base,
        todoBotYn: notificationSettings.todoBot,
        feedbackYn: notificationSettings.feedback,
        marketingYn: true,
      });
    }
  };

  const showMarketingDialog = (withServerSync = true) => {
    const nickname = myDowithInfo?.nickname ?? '';
    const today = dayjs().format('YYYY년 MM월 DD일');

    enableMarketing(withServerSync);
    showDialog({
      type: 'ALERT',
      title: '광고성 정보 수신동의 처리',
      content: `작성자 : ${nickname}\n일시 : ${today}\n상태 : 광고성 정보 수신 동의\n\n광고성 수신 정보 동의는\n설정 > 마케팅 · 혜택 알림에서 변경가능합니다.`,
      handleAlertButton: hideDialog,
    });
  };

  useAppState(state => {
    if (state === 'active') {
      checkSystemPermission().then(isGranted => {
        setIsSystemNotificationEnabled(isGranted);
        if (pendingMarketingRef.current && isGranted) {
          pendingMarketingRef.current = false;
          showMarketingDialog(false);
        }
      });
    }
  });

  const handleEnableMarketing = async () => {
    const isGranted = await checkSystemPermission();

    if (!isGranted) {
      pendingMarketingRef.current = true;
      Linking.openSettings();
      return;
    }

    showMarketingDialog();
  };

  if (isSystemNotificationEnabled === null) {
    return null;
  }

  const showList = isSystemNotificationEnabled && marketing;

  if (!showList) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>더 많은 혜택과 이벤트 내용을 받으시려면</Text>
        <Text style={styles.emptyText}>아래 버튼을 눌러 알림을 켜주세요!</Text>
        <Pressable style={styles.enableButton} onPress={handleEnableMarketing}>
          <Text style={styles.enableButtonText}>알림 켜기</Text>
        </Pressable>
      </View>
    );
  }

  return <NotificationList type="EVENT" />;
};

const NotificationScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screenContainer}>
      <Tab.Navigator
        sceneContainerStyle={{ backgroundColor: theme.COLORS.DEFAULT.WHITE }}
        screenOptions={{
          tabBarLabelStyle: {
            fontWeight: theme.TYPOGRAPHY.TITLE_3.fontWeight,
            fontSize: theme.TYPOGRAPHY.TITLE_3.fontSize,
          },
          tabBarActiveTintColor: theme.COLORS.DEFAULT.BLACK,
          tabBarInactiveTintColor: theme.COLORS.GRAY_SCALE.GRAY_60,
          tabBarIndicatorStyle: { backgroundColor: theme.COLORS.DEFAULT.BLACK },
        }}
      >
        <Tab.Screen name="NOTIFICATION" component={NotificationTab} options={{ tabBarLabel: '알림' }} />
        <Tab.Screen name="EVENT" component={EventTab} options={{ tabBarLabel: '혜택/이벤트' }} />
      </Tab.Navigator>
      <Text style={[styles.footerText, { paddingBottom: insets.bottom + 20 }]}>
        최근 30일 동안의 알림만 확인할 수 있어요.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  item: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.GRAY_SCALE.GRAY_96,
  },
  itemConfirmed: {
    opacity: 0.3,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    ...theme.TYPOGRAPHY.BODY_1,
  },
  itemBody: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_40,
    marginTop: 4,
  },
  itemDate: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_70,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  emptyText: {
    ...theme.TYPOGRAPHY.BODY_1,
    color: theme.COLORS.GRAY_SCALE.GRAY_50,
  },
  enableButton: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96,
  },
  enableButtonText: {
    ...theme.TYPOGRAPHY.BODY_1,
  },
  footerText: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_70,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export { NotificationScreen };
