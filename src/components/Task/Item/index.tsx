import React, { useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { TaskSuccess } from 'components/common/icons/TaskSuccess';
import { EtcDots } from 'components/common/icons/EtcDots';
import { theme } from 'styles/theme';
import type { RootStackParamList, TaskModeType } from 'types/shared';
import { BottomSheet } from 'components/common/BottomSheet';
import { TaskEdit } from 'components/common/icons/TaskEdit';
import { RoutineEdit } from 'components/common/icons/RoutineEdit';
import { TaskDelete } from 'components/common/icons/TaskDelete';
import { TaskStatusEnumType } from 'types/task/scheme/enum';
import dayjs from 'dayjs';
import { TASK_STATUS_ENUM } from 'schemes/task/enum';
import { TaskWait } from 'components/common/icons/TaskWait';
import { FeedBackIcon } from 'components/common/icons/FeedBackIcon';
import { TaskFail } from 'components/common/icons/TaskFail';
import { UploadImage } from 'components/common/icons/UploadImage';
import { isNil } from 'utils/index';
import { useUpdateTodoTaskStatus } from 'hooks/queries/task/useUpdateTodoTaskStatus';
import { isAos } from 'utils/device';
import { useFetchTodoTask } from 'hooks/queries/task/useFetchTodoTask';
import { useFetchDowithTask } from 'hooks/queries/task/useFetchDowithTask';

dayjs.extend(customParseFormat);

interface Props {
  id: number;
  mode: TaskModeType;
  title: string;
  status: TaskStatusEnumType;
  taskCategoryName: string | null;
  startTime: string | null;
  year: number;
  month: number;
  selectedDate: string;
  confirmedImageUrl?: string | null;
  feedBackCount?: number | null;
}

const Item = ({
  id,
  mode,
  title,
  status,
  taskCategoryName,
  startTime,
  year,
  month,
  selectedDate,
  confirmedImageUrl,
  feedBackCount,
}: Props) => {
  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>();
  const taskManagementBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const isDisabled = status === TASK_STATUS_ENUM.enum.FAIL;

  const { mutate: completeTodoTaskStatusMutate } = useUpdateTodoTaskStatus({ year, month });
  const { data: todoTaskData } = useFetchTodoTask({ todoTaskId: id }, { enabled: mode === 'TODO' && id !== -1 });
  const { data: dowithTaskData } = useFetchDowithTask(
    { dowithTaskId: id },
    { enabled: mode === 'DOWITH' && id !== -1 },
  );

  const data = id && mode ? todoTaskData ?? dowithTaskData : null;
  const isRoutineTask = !isNil(data?.routineCondition);

  const getSnapPoints = () => {
    if (!isRoutineTask) {
      return [isAos ? '25%' : '23%'];
    }

    return [isAos ? '31%' : '29%'];
  };

  const handleBottomSheet = () => {
    taskManagementBottomSheetModalRef.current?.present();
  };

  const renderTaskStatusIcon = (mode: TaskModeType, status: TaskStatusEnumType) => {
    switch (status) {
      case TASK_STATUS_ENUM.enum.WAIT:
        if (mode === 'DOWITH') {
          return <UploadImage />;
        }

        return <TaskWait mode={mode} />;

      case TASK_STATUS_ENUM.enum.SUCCESS:
        return <TaskSuccess mode={mode} />;

      case TASK_STATUS_ENUM.enum.FAIL:
        return <TaskFail />;

      default:
        return null;
    }
  };

  const handleTodoTaskStatus = (mode: TaskModeType, id: number, status: TaskStatusEnumType) => () => {
    // task가 아니거나 상태가 실패면 무시
    if (mode === 'DOWITH' || status === 'FAIL') {
      return;
    }

    completeTodoTaskStatusMutate({ id, status });
  };

  const handleEditTask = () => {
    navigate('TASK_FORM', { date: selectedDate, id, mode });
    taskManagementBottomSheetModalRef.current?.dismiss();
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.leftContainer}>
          <Pressable onPress={handleTodoTaskStatus(mode, id, status)}>{renderTaskStatusIcon(mode, status)}</Pressable>
          <View style={styles.leftContent}>
            <Text style={[styles.title, isDisabled && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }]}>{title}</Text>
            {(startTime || taskCategoryName) && (
              <View style={styles.option}>
                {startTime && (
                  <Text
                    style={[
                      styles.optionText,
                      { color: isDisabled ? theme.COLORS.GRAY_SCALE.GRAY_80 : theme.COLORS.GRAY_SCALE.GRAY_60 },
                    ]}
                  >
                    {dayjs(startTime, 'HH:mm:ss').format('HH:mm')}
                  </Text>
                )}
                {startTime && taskCategoryName && (
                  <Text
                    style={[
                      styles.optionText,
                      { color: isDisabled ? theme.COLORS.GRAY_SCALE.GRAY_80 : theme.COLORS.GRAY_SCALE.GRAY_60 },
                    ]}
                  >
                    •
                  </Text>
                )}
                {taskCategoryName && (
                  <Text
                    style={[
                      styles.optionText,
                      { color: isDisabled ? theme.COLORS.GRAY_SCALE.GRAY_80 : theme.COLORS.GRAY_SCALE.GRAY_60 },
                    ]}
                  >
                    {taskCategoryName}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
        <View style={styles.rightContainer}>
          <View style={styles.rightContent}>
            {confirmedImageUrl && (
              <Image
                borderRadius={50}
                width={24}
                height={24}
                source={{
                  uri: confirmedImageUrl,
                }}
              />
            )}
            {!confirmedImageUrl && !isNil(feedBackCount) && (
              <FeedBackIcon count={feedBackCount as number} status={status} />
            )}
            <Pressable onPress={handleBottomSheet} disabled={isDisabled}>
              <EtcDots disabled={isDisabled} />
            </Pressable>
          </View>
        </View>
      </View>
      <BottomSheet ref={taskManagementBottomSheetModalRef} title="투두 관리하기" snapPoints={getSnapPoints()}>
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalContentRow} onPress={handleEditTask}>
            <TaskEdit />
            <Text style={styles.modalContentText}>할 일 수정하기</Text>
          </Pressable>
          {isRoutineTask ? (
            <View style={styles.modalContentRow}>
              <RoutineEdit />
              <Text style={styles.modalContentText}>루틴 수정하기</Text>
            </View>
          ) : null}
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
  title: theme.TYPOGRAPHY.BODY_2,
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  optionText: theme.TYPOGRAPHY.CAPTION1_BASIC,
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
