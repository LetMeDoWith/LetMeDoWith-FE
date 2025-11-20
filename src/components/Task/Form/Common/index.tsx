import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useCallback, useRef, useState } from 'react';
import { Controller, SubmitHandler, useFormContext } from 'react-hook-form';
import DatePicker from 'react-native-date-picker';
import { getBottomSpace } from 'react-native-iphone-screen-helper';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';
import dayjs from 'dayjs';

import { theme } from 'styles/theme';
import { isAos } from 'utils/device';
import { TodoMode } from 'components/common/icons/TodoMode';
import { DowithMode } from 'components/common/icons/DowithMode';
import type { TaskFormStackParamList, TaskModeType } from 'types/shared';
import { CategoryBottomSheet } from 'components/Task/BottomSheet/CategoryBottomSheet';
import { RoutineBottomSheet } from 'components/Task/BottomSheet/RoutineBottomSheet';
import { useFetchTaskCategoryList } from 'hooks/queries/task/useFetchTaskCategoryList';
import { useAddTodoTask } from 'hooks/queries/task/useAddTodoTask';
import type { addTaskRequestSchemeType } from 'types/task/scheme/api';
import { useAddDowithTask } from 'hooks/queries/task/useAddDowithTask';
import { isNil } from 'utils/index';
import { StackScreenProps } from '@react-navigation/stack';
import { useUpdateTask } from 'hooks/queries/task/useUpdateTask';
import { useDialog } from 'components/common/Dialog/Provider';
import { ArrowRight } from 'components/common/icons/ArrowIcon';

const Form = ({ route, navigation }: StackScreenProps<TaskFormStackParamList, 'COMMON'>) => {
  const { params } = route;
  const isEditMode = !!params.mode;
  const isRoutineTask = params.isRoutineTask;
  const { showDialog, hideDialog } = useDialog();
  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { dirtyFields },
  } = useFormContext<addTaskRequestSchemeType>();
  const categoryBottomSheetMethodsRef = useRef<BottomSheetModalMethods>(null);
  const routineBottomSheetMethodsRef = useRef<BottomSheetModalMethods>(null);

  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);
  const [taskMode, setTaskMode] = useState<TaskModeType | null>(params.mode ?? null);
  const isTodoMode = taskMode === 'TODO';

  const { data: taskCategoryList } = useFetchTaskCategoryList();
  const { mutate: addTodoTaskMutate, isPending: isAddTodoTaskMutateLoading } = useAddTodoTask();
  const { mutate: updateTaskMutate, isPending: isUpdateTaskMutateLoading } = useUpdateTask({
    type: 'EDIT',
    id: params.id,
    mode: isTodoMode ? 'TODO' : 'DOWITH',
  });
  const { mutate: addDowithTaskMutate, isPending: isAddDowithTaskMutateLoading } = useAddDowithTask();
  const isFieldChanged = Object.keys(dirtyFields).length > 0;

  const title = watch('title');
  const date = watch('date');
  const startTime = watch('startTime');
  const taskCategoryId = watch('taskCategoryId');
  const routineCondition = watch('routineCondition');

  const isFormDisabled = taskMode === null;
  const isButtonDisabled = isTodoMode
    ? !isFieldChanged || !title || isAddTodoTaskMutateLoading || isUpdateTaskMutateLoading
    : !isFieldChanged || !title || !startTime || isAddDowithTaskMutateLoading;
  const prevSelectedCategory = taskCategoryList?.find(({ id }) => taskCategoryId === id);

  /**
   * 루틴 설정 메뉴 노출 조건
   * 1. task 등록 스크린일 때
   * 2. 루틴 설정 안한 일반 task 수정 스크린일 때
   */
  const isRoutineMenuVisible = !isEditMode || !isRoutineTask;

  const renderTaskModeButtonView = () => {
    if (!isEditMode) {
      return (
        <>
          <Text style={theme.TYPOGRAPHY.SUB_TITLE}>모드 선택</Text>
          <View style={styles.modeButtonWrap}>
            <Pressable
              style={[
                styles.modeButton,
                taskMode === 'TODO' && {
                  backgroundColor: theme.COLORS.SECONDARY.BLUE_95,
                  borderColor: theme.COLORS.SECONDARY.BLUE_95,
                },
              ]}
              onPress={handleTaskMode('TODO')}
            >
              <TodoMode />
              <View style={styles.modeButtonTextWrap}>
                <Text
                  style={[
                    theme.TYPOGRAPHY.CAPTION1_BASIC,
                    { color: taskMode === 'TODO' ? theme.COLORS.SECONDARY.BLUE_60 : theme.COLORS.GRAY_SCALE.GRAY_50 },
                  ]}
                >
                  자유롭게 혼자하는
                </Text>
                <Text
                  style={[
                    theme.TYPOGRAPHY.SUB_TITLE,
                    { color: taskMode === 'TODO' ? theme.COLORS.SECONDARY.BLUE_60 : theme.COLORS.GRAY_SCALE.GRAY_10 },
                  ]}
                >
                  TO DO
                </Text>
              </View>
            </Pressable>
            <Pressable
              style={[
                styles.modeButton,
                taskMode === 'DOWITH' && {
                  backgroundColor: theme.COLORS.PRIMARY.RED_98,
                  borderColor: theme.COLORS.PRIMARY.RED_98,
                },
              ]}
              onPress={handleTaskMode('DOWITH')}
            >
              <DowithMode />
              <View style={styles.modeButtonTextWrap}>
                <Text
                  style={[
                    theme.TYPOGRAPHY.CAPTION1_BASIC,
                    { color: taskMode === 'DOWITH' ? theme.COLORS.PRIMARY.RED_60 : theme.COLORS.GRAY_SCALE.GRAY_50 },
                  ]}
                >
                  잔소리와 함께하는
                </Text>
                <Text
                  style={[
                    theme.TYPOGRAPHY.SUB_TITLE,
                    { color: taskMode === 'DOWITH' ? theme.COLORS.PRIMARY.RED_60 : theme.COLORS.GRAY_SCALE.GRAY_10 },
                  ]}
                >
                  DO WITH
                </Text>
              </View>
            </Pressable>
          </View>
        </>
      );
    }

    if (params.mode === 'TODO') {
      return (
        <View style={[styles.modeButtonWrap]}>
          <Pressable
            style={[
              styles.modeButton,
              {
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 4,
                paddingVertical: 10,
                backgroundColor: theme.COLORS.SECONDARY.BLUE_95,
                borderColor: theme.COLORS.SECONDARY.BLUE_95,
                borderRadius: 8,
              },
            ]}
          >
            <TodoMode width={20} height={20} />
            <Text style={[theme.TYPOGRAPHY.SUB_TITLE, { color: theme.COLORS.SECONDARY.BLUE_60 }]}>TO DO</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={[styles.modeButtonWrap]}>
        <Pressable
          style={[
            styles.modeButton,
            {
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 4,
              paddingVertical: 10,
              backgroundColor: theme.COLORS.PRIMARY.RED_98,
              borderColor: theme.COLORS.PRIMARY.RED_98,
              borderRadius: 8,
            },
          ]}
        >
          <DowithMode width={24} height={20} />
          <Text style={[theme.TYPOGRAPHY.SUB_TITLE, { color: theme.COLORS.PRIMARY.RED_60 }]}>DO WITH</Text>
        </Pressable>
      </View>
    );
  };

  const toggleDatePicker = useCallback(
    (isOpen: boolean) => () => {
      if (isFormDisabled) {
        return;
      }

      setDatePickerOpen(isOpen);
    },
    [isFormDisabled],
  );

  const handlePresentModalPress = useCallback(() => {
    if (isFormDisabled) {
      return;
    }

    categoryBottomSheetMethodsRef.current?.present();
  }, [isFormDisabled]);

  const handleDateChange = useCallback(
    (date: Date) => {
      setValue('startTime', dayjs(date).format('HH:mm') + ':00', {
        shouldDirty: true,
        shouldTouch: true,
      });
      setDatePickerOpen(false);
    },
    [setValue],
  );

  const handleTaskMode = useCallback(
    (mode: TaskModeType) => () => {
      // 지난 날짜에는 두윗 등록 불가
      const isInvalidAddDowithTask = mode === 'DOWITH' && dayjs(date).isBefore(dayjs(), 'day');
      if (isInvalidAddDowithTask) {
        showDialog({
          type: 'ALERT',
          title: '두윗 등록 불가',
          content:
            '지난 날짜에는 두윗을 등록할 수 없어요.\n\n다른 두윗들에게 잔소리를 받으려면\n미래 날짜에 두윗을 등록해 주세요!',
          handleAlertButton: hideDialog,
        });
        return;
      }
      setTaskMode(mode);
    },
    [date],
  );

  const handleTaskRoutine = useCallback(() => {
    if (isFormDisabled) {
      return;
    }

    routineBottomSheetMethodsRef.current?.present();
  }, [isFormDisabled]);

  const onSubmit: SubmitHandler<addTaskRequestSchemeType> = useCallback(
    values => {
      const payload = {
        ...values,
        ...(isNil(values.routineCondition?.startDate) && { routineCondition: null }),
      };

      const handleButton =
        ({ withRoutineTask }: { withRoutineTask: boolean }) =>
        () => {
          const result = withRoutineTask
            ? {
                title: payload.title,
                startTime: payload.startTime,
                taskCategoryId: payload.taskCategoryId,
              }
            : payload;

          updateTaskMutate({ payload: result, withRoutineTask });
          hideDialog();
        };

      console.log(payload);
      if (isEditMode) {
        // 루틴이 설정되어 있는 투두 Task 일 때
        if (isRoutineTask) {
          showDialog({
            title: `루틴 ${isTodoMode ? '투두' : '두윗'} 수정하기`,
            content: `루틴으로 수정한 앞으로의 ${isTodoMode ? '투두를' : '두윗을'}\n모두 수정하시겠어요?`,
            leftButtonText: '모두 수정하기',
            rightButtonText: '이번만 수정하기',
            handleLeftButton: handleButton({ withRoutineTask: true }),
            handleRightButton: handleButton({ withRoutineTask: false }),
          });
        }
        return;
      }

      if (isTodoMode) {
        addTodoTaskMutate(payload);
        return;
      }

      addDowithTaskMutate(payload);
    },
    [isTodoMode, isEditMode, isRoutineTask],
  );

  return (
    <>
      <View style={styles.container}>
        <View>
          <View style={styles.modeWrap}>{renderTaskModeButtonView()}</View>
          <View style={{ gap: 16, marginTop: 32 }}>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text
                  style={[theme.TYPOGRAPHY.SUB_TITLE, isFormDisabled && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }]}
                >
                  제목
                </Text>
                <Text style={isFormDisabled && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }}>{title.length}/20</Text>
              </View>
              <Controller
                name="title"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={{ borderBottomWidth: 1, paddingBottom: 8, borderColor: theme.COLORS.GRAY_SCALE.GRAY_92 }}
                    placeholder="해야할 일을 등록해보세요."
                    placeholderTextColor={
                      isFormDisabled ? theme.COLORS.GRAY_SCALE.GRAY_80 : theme.COLORS.GRAY_SCALE.GRAY_60
                    }
                    onChangeText={value => {
                      onChange(value);
                    }}
                    value={value}
                    maxLength={20}
                    editable={!isFormDisabled}
                  />
                )}
              />
            </View>
            <Pressable
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 }}
              onPress={toggleDatePicker(true)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text
                  style={[theme.TYPOGRAPHY.SUB_TITLE, isFormDisabled && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }]}
                >
                  시작 시간
                </Text>
                {taskMode === 'TODO' && (
                  <Text style={[theme.TYPOGRAPHY.CAPTION1_BASIC, { color: theme.COLORS.GRAY_SCALE.GRAY_70 }]}>
                    (선택)
                  </Text>
                )}
              </View>
              <Text style={startTime ? styles.value : styles.emptyValue}>
                {startTime ? dayjs(startTime, 'HH:mm:ss').format('HH:mm') : '미등록'}
              </Text>
            </Pressable>
            <Pressable
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 }}
              onPress={handlePresentModalPress}
            >
              <View style={styles.optionalLabelWrap}>
                <Text
                  style={[theme.TYPOGRAPHY.SUB_TITLE, isFormDisabled && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }]}
                >
                  카테고리
                </Text>
                <Text style={[theme.TYPOGRAPHY.CAPTION1_BASIC, { color: theme.COLORS.GRAY_SCALE.GRAY_70 }]}>
                  (선택)
                </Text>
              </View>
              <Text style={[styles.emptyValue, taskCategoryId !== null && styles.value]}>
                {prevSelectedCategory ? prevSelectedCategory.title : '미등록'}
              </Text>
            </Pressable>
            {isRoutineMenuVisible ? (
              <Pressable
                style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 }}
                onPress={handleTaskRoutine}
              >
                <View
                  style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text
                      style={[theme.TYPOGRAPHY.SUB_TITLE, isFormDisabled && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }]}
                    >
                      루틴 설정
                    </Text>
                    <Text style={[theme.TYPOGRAPHY.CAPTION1_BASIC, { color: theme.COLORS.GRAY_SCALE.GRAY_70 }]}>
                      (선택)
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text
                    style={[
                      theme.TYPOGRAPHY.BODY_2,
                      { color: routineCondition?.cycle ? theme.COLORS.DEFAULT.BLACK : theme.COLORS.GRAY_SCALE.GRAY_80 },
                    ]}
                  >
                    {routineCondition?.cycle ? '등록 완료' : '미등록'}
                  </Text>
                  {routineCondition?.cycle ? <ArrowRight fill={theme.COLORS.GRAY_SCALE.GRAY_40} /> : null}
                </View>
              </Pressable>
            ) : null}
          </View>
        </View>
        <Pressable
          style={[styles.button, !isButtonDisabled && { backgroundColor: theme.COLORS.PRIMARY.RED_60 }]}
          disabled={isButtonDisabled}
          onPress={handleSubmit(onSubmit)}
        >
          <Text
            style={[
              theme.TYPOGRAPHY.TITLE_2,
              { color: theme.COLORS.DEFAULT.WHITE },
              (isAddTodoTaskMutateLoading || isUpdateTaskMutateLoading || isAddDowithTaskMutateLoading) && {
                backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_80,
              },
            ]}
          >
            저장하기
          </Text>
        </Pressable>
      </View>
      <DatePicker
        modal
        open={datePickerOpen}
        mode="time"
        minimumDate={!isTodoMode ? new Date() : undefined}
        minuteInterval={5}
        locale="ko-KR"
        date={startTime ? dayjs(startTime, 'HH:mm:ss').toDate() : dayjs().toDate()}
        onConfirm={handleDateChange}
        onCancel={toggleDatePicker(false)}
      />
      <CategoryBottomSheet
        ref={categoryBottomSheetMethodsRef}
        taskCategoryId={taskCategoryId}
        prevSelectedCategory={prevSelectedCategory}
      />
      <RoutineBottomSheet ref={routineBottomSheetMethodsRef} taskMode={taskMode} navigation={navigation} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingBottom: isAos ? 24 : getBottomSpace() + 24,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  modeWrap: { gap: 16 },
  modeButtonWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_98,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_96,
    borderWidth: 1,
    borderRadius: 16,
  },
  modeButtonTextWrap: {
    alignItems: 'center',
    gap: 2,
  },
  optionalLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyValue: {
    color: theme.COLORS.GRAY_SCALE.GRAY_80,
  },
  value: {
    color: theme.COLORS.DEFAULT.BLACK,
  },
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 64,
    backgroundColor: theme.COLORS.PRIMARY.RED_95,
  },
});

export { Form };
