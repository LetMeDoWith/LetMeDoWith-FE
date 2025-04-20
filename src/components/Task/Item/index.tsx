import React, { useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { TaskSuccess } from 'components/common/icons/DoWithModeSuccess';
import { EtcDots } from 'components/common/icons/EtcDots';
import { theme } from 'styles/theme';
import type { TaskModeType } from 'types/shared';
import { BottomSheet } from 'components/common/BottomSheet';
import { TaskEdit } from 'components/common/icons/TaskEdit';
import { RoutineEdit } from 'components/common/icons/RoutineEdit';
import { TaskDelete } from 'components/common/icons/TaskDelete';

interface Props {
  mode: TaskModeType;
}

const Item = ({ mode }: Props) => {
  const taskManagementBottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleBottomSheet = () => {
    taskManagementBottomSheetModalRef.current?.present();
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          {/* TODO: task 상태에 맞는 아이콘 처리 */}
          <TaskSuccess mode={mode} />
          <View style={styles.leftContent}>
            <Text style={styles.title}>푸쉬업하기</Text>
            <View style={styles.option}>
              <Text>12:00</Text>
              <Text> • </Text>
              <Text>9:00</Text>
            </View>
          </View>
        </View>
        <View style={styles.rightContainer}>
          <View style={styles.rightContent}>
            {mode === 'DOWITH' && (
              <Image
                borderRadius={50}
                width={24}
                height={24}
                source={{
                  uri: 'https://media.bunjang.co.kr/images/crop/981758465_w320.jpg',
                }}
              />
            )}
            <Pressable onPress={handleBottomSheet}>
              {/* TODO: task 상태에 맞는 disabled 처리 */}
              <EtcDots />
            </Pressable>
          </View>
        </View>
      </View>
      <BottomSheet ref={taskManagementBottomSheetModalRef} title="투두 관리하기" snapPoints={['29%']}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContentRow}>
            <TaskEdit />
            <Text style={styles.modalContentText}>할 일 수정하기</Text>
          </View>
          <View style={styles.modalContentRow}>
            <RoutineEdit />
            <Text style={styles.modalContentText}>루틴 수정하기</Text>
          </View>
          <View style={styles.modalContentRow}>
            <TaskDelete />
            <Text style={styles.modalContentText}>삭제하기</Text>
          </View>
        </View>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  rightContainer: {
    alignItems: 'flex-start',
  },
  leftContent: {
    gap: 4,
  },
  rightContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    color: theme.COLORS.GRAY_SCALE.GRAY_20,
  },
  option: {
    flexDirection: 'row',
  },
  modalContainer: {
    paddingVertical: 24,
    gap: 20,
  },
  modalContentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalContentText: theme.TYPOGRAPHY.BODY_1,
});

export { Item };
