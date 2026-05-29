import { useCallback, useMemo } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFetchNotifications } from 'hooks/queries/notification/useFetchNotifications';
import { formatNotificationDate } from 'utils/date';
import { theme } from 'styles/theme';
import type { notificationSchemeType } from 'types/notification/scheme/api';

const Tab = createMaterialTopTabNavigator();

interface NotificationItemProps extends notificationSchemeType {
  type: 'NORMAL' | 'EVENT';
}

const NotificationItem = ({ title, body, image, isConfirmed, createdAt, type }: NotificationItemProps) => (
  <View style={[styles.item, isConfirmed && styles.itemConfirmed]}>
    {type === 'NORMAL' &&
      (image ? <Image source={{ uri: image }} style={styles.itemImage} /> : <View style={styles.itemImage} />)}
    <View style={styles.itemContent}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemBody} numberOfLines={2}>
        {body}
      </Text>
      <Text style={styles.itemDate}>{formatNotificationDate(createdAt)}</Text>
    </View>
  </View>
);

const NotificationList = ({ type }: { type: 'NORMAL' | 'EVENT' }) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useFetchNotifications(type);

  const notifications = useMemo(() => data?.pages.flatMap(page => page.data.notifications) ?? [], [data]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({ item }: { item: notificationSchemeType }) => <NotificationItem {...item} type={type} />,
    [type],
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
const EventTab = () => <NotificationList type="EVENT" />;

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
  footerText: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    color: theme.COLORS.GRAY_SCALE.GRAY_70,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export { NotificationScreen };
