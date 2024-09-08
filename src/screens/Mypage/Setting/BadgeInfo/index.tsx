import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Divider } from 'react-native-paper';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop';

import { Badge } from 'components/Mypage/Badge';
import { theme } from 'styles/theme';
import { isAos } from 'utils/device';

type BadgeInfo = {
  uri: string;
  name: string;
  description: string;
  isRepresentative: boolean;
};

const mockData: BadgeInfo[] = Array(9)
  .fill(undefined)
  .map((_, index) =>
    index < 2
      ? {
          uri: 'https://media.bunjang.co.kr/images/crop/981758465_w320.jpg',
          name: `test 뱃지${index + 1}`,
          description:
            '3번 이상 두윗 모드를 이행하지 않거나\n상태가 (빨간불)인 사용자에게 부여되는 뱃지로특정 행위를 하기 전, 해지할 수 없습니다',
          isRepresentative: index === 1,
        }
      : {
          uri: '',
          name: `test 뱃지${index + 1}`,
          description: `test 뱃지${
            index + 1
          }는 어쩌구저쩌구\n얻기 위해서 어쩌구저쩌구 노력을해주세요.\n화이팅화이팅해주세요.`,
          isRepresentative: false,
        },
  );

const initialSnapPoints = isAos ? ['75%'] : ['52%'];

const BadgeInfo = () => {
  const bottomSheetContentRef = useRef<View>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const [snapPoints, setSnapPoints] = useState<string[]>(initialSnapPoints);
  const [isButtonVisible, setIsButtonVisible] = useState<boolean>(true);
  const [selectedBadgeInfo, setSelectedBadgeInfo] = useState<BadgeInfo | null>(null);

  const handlePresentModalPress = useCallback((badgeInfo: BadgeInfo) => {
    bottomSheetModalRef.current?.present();
    setSelectedBadgeInfo(badgeInfo);
    setIsButtonVisible(!!badgeInfo.uri && !badgeInfo.isRepresentative);

    if (!!badgeInfo.uri && !badgeInfo.isRepresentative) {
      setSnapPoints(initialSnapPoints);
      return;
    }

    setSnapPoints(isAos ? ['55%'] : ['40%']);
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => <BottomSheetBackdrop disappearsOnIndex={-1} appearsOnIndex={0} {...props} />,
    [],
  );

  const renderItemSeparatorComponent = useCallback(() => <View style={styles.flatListSeperator} />, []);

  const handleSubmit = useCallback(() => {
    // TODO: API 연동
    console.log('대표 뱃지 변경');
  }, []);

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>나의 대표 뱃지</Text>
          <Text style={styles.subTitle}>피드에 노출되는 대표 뱃지입니다.</Text>
        </View>
        <Badge uri={'https://media.bunjang.co.kr/images/crop/981758465_w320.jpg'} name="test 뱃지2" />
        <Divider style={styles.divider} />
        <Text>* 대표 뱃지 포함 최대 4개까지 노출할 수 있습니다.</Text>
        <FlatList
          contentContainerStyle={styles.flatListContentContainer}
          style={styles.flatListContainer}
          data={mockData}
          renderItem={({ item: { uri, name, description, isRepresentative } }) => (
            <Badge
              uri={uri}
              name={name}
              isRepresentative={isRepresentative}
              onPress={() => handlePresentModalPress({ uri, name, description, isRepresentative })}
            />
          )}
          keyExtractor={({ name }) => name}
          numColumns={3}
          ItemSeparatorComponent={renderItemSeparatorComponent}
          columnWrapperStyle={styles.flatListColumnWrapper}
        />
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          backdropComponent={renderBackdrop}
        >
          <BottomSheetView style={styles.modalContainer}>
            <View ref={bottomSheetContentRef}>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle}>{selectedBadgeInfo?.name}</Text>
              </View>
              <View style={styles.badgeImageWrap}>
                <Badge uri={selectedBadgeInfo?.uri || ''} />
              </View>
              <View style={styles.modalDescriptionWrap}>
                <Text style={styles.modalDescription}>{selectedBadgeInfo?.description}</Text>
              </View>
            </View>
            {isButtonVisible && (
              <Pressable
                style={[styles.button, !isButtonVisible && { backgroundColor: theme.COLORS.PRIMARY.RED_500 }]}
                onPress={handleSubmit}
              >
                <Text style={styles.buttonText}>대표 뱃지로 설정하기</Text>
              </Pressable>
            )}
          </BottomSheetView>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  titleWrap: {
    gap: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: theme.COLORS.DEFAULT.BLACK,
    fontSize: 20,
    fontWeight: 'bold',
  },
  subTitle: {
    color: theme.COLORS.GRAY_SCALE.GRAY_600,
  },
  divider: {
    width: '100%',
    marginVertical: 14,
    borderWidth: 0.5,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_300,
    borderStyle: 'dashed',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  modalTitleWrap: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.COLORS.DEFAULT.BLACK,
  },
  badgeImageWrap: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 22,
  },
  modalDescriptionWrap: {
    alignItems: 'center',
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.COLORS.GRAY_SCALE.GRAY_700,
  },
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 64,
    backgroundColor: theme.COLORS.PRIMARY.RED_500,
  },
  buttonText: {
    fontSize: 18,
    color: theme.COLORS.DEFAULT.WHITE,
  },
  flatListContentContainer: {
    paddingTop: 5,
  },
  flatListContainer: { width: '100%', marginTop: 27 },
  flatListSeperator: { marginTop: 32 },
  flatListColumnWrapper: { justifyContent: 'space-between', flexDirection: 'row' },
});

export { BadgeInfo };
