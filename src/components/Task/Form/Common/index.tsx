import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useCallback, useMemo, useRef } from 'react';
import { Controller, SubmitHandler, useFormContext } from 'react-hook-form';
import { getBottomSpace } from 'react-native-iphone-screen-helper';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';
import dayjs from 'dayjs';

import { theme } from 'styles/theme';
import { isAos } from 'utils/device';
import type { TaskFormStackParamList, TaskModeType } from 'types/shared';
import { CategoryBottomSheet } from 'components/Task/BottomSheet/CategoryBottomSheet';
import { RoutineBottomSheet } from 'components/Task/BottomSheet/RoutineBottomSheet';
import { useFetchTaskCategoryList } from 'hooks/queries/task/useFetchTaskCategoryList';
import { useFetchDowithTaskSamples } from 'hooks/queries/task/useFetchDowithTaskSamples';
import { useAddTodoTask } from 'hooks/queries/task/useAddTodoTask';
import type { addTaskRequestSchemeType } from 'types/task/scheme/api';
import { useAddDowithTask } from 'hooks/queries/task/useAddDowithTask';
import { isNil } from 'utils/index';
import { StackScreenProps } from '@react-navigation/stack';
import { useUpdateTask } from 'hooks/queries/task/useUpdateTask';
import { useDialog } from 'components/common/Dialog/Provider';
import { ArrowRight } from 'components/common/icons/ArrowIcon';
import { DateTimePicker } from 'components/common/DateTimePicker';

const REGISTER_BLOCKED_DIALOG = {
  type: 'ALERT' as const,
  title: '⚠️ 도리 등록 불가',
  content: '다른 도리러들에게 잡도리를 받으려면\n다가올 날에 등록해 주세요!',
  alertButtonText: '확인',
};

const Form = ({ route }: StackScreenProps<TaskFormStackParamList, 'COMMON'>) => {
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
  const dateTimePickerRef = useRef<BottomSheetModalMethods>(null);

  /* 수정 화면은 진입한 모드가 고정이라 상태로 들고 있지 않는다 */
  const taskMode: TaskModeType | null = params.mode ?? null;
  const isTodoMode = taskMode === 'TODO';

  const { data: taskCategoryList } = useFetchTaskCategoryList();
  const { data: dowithTaskSamples } = useFetchDowithTaskSamples();

  /*
   * 도리 모드를 실제로 선택했을 때만 서버가 내려준 샘플 중 하나를 제목 placeholder로 보여준다.
   * 모드 미선택(null) 상태는 제외한다 — 아직 도리를 고르지 않았는데 도리 샘플을 보여줄 이유가 없다.
   * 샘플은 마운트 시점에 한 번만 고른다. 렌더마다 고르면 입력하는 동안 문구가 계속 바뀐다.
   * 조회 전이거나 실패하면 기존 문구를 그대로 쓴다.
   */
  const titlePlaceholder = useMemo(() => {
    if (taskMode !== 'DOWITH' || !dowithTaskSamples?.length) {
      return '해야할 일을 등록해보세요.';
    }

    return dowithTaskSamples[Math.floor(Math.random() * dowithTaskSamples.length)];
  }, [taskMode, dowithTaskSamples]);
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
  // 오늘 날짜에 도리 등록할 때만 지난 시각 선택을 제한 (미래 날짜는 시간 제약 없음)
  const isDowithOnToday = !isTodoMode && dayjs(date).isSame(dayjs(), 'day');

  /**
   * 루틴 설정 메뉴 노출 조건
   * 1. task 등록 스크린일 때
   * 2. 루틴 설정 안한 일반 task 수정 스크린일 때
   */
  const isRoutineMenuVisible = !isEditMode || !isRoutineTask;

  /* 투두 수정에는 모드 표시 바가 없다 */
  const hasModeBadge = !isEditMode || params.mode !== 'TODO';

  const renderTaskModeButtonView = () => {
    /* 투두 수정은 모드 표시 없이 바로 필드부터 보여준다 */
    if (!hasModeBadge) {
      return null;
    }

    /* 수정 화면에서는 모드를 바꿀 수 없어 선택이 아니라 표시다 */
    return (
      <View style={styles.modeBadge}>
        <Text style={styles.modeBadgeText}>도리 모드</Text>
      </View>
    );
  };

  const handleDatePicker = useCallback(() => {
    if (isFormDisabled) {
      return;
    }

    dateTimePickerRef.current?.present();
  }, [isFormDisabled]);

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
      dateTimePickerRef.current?.dismiss();
    },
    [setValue],
  );

  const handleTaskRoutine = useCallback(() => {
    if (isFormDisabled) {
      return;
    }

    routineBottomSheetMethodsRef.current?.present();
  }, [isFormDisabled]);

  const onSubmit: SubmitHandler<addTaskRequestSchemeType> = useCallback(
    values => {
      // 루틴 값을 실제로 설정한 경우(startDate·endDate·cycle 모두 존재)에만 routineCondition을 포함시킨다.
      // 바텀 시트를 열었다 닫기만 하면 startDate만 채워지므로 이를 미설정으로 간주해 null 처리한다.
      const hasRoutineCondition =
        !isNil(values.routineCondition?.startDate) &&
        !isNil(values.routineCondition?.endDate) &&
        !isNil(values.routineCondition?.cycle);

      const payload = {
        ...values,
        ...(!hasRoutineCondition && { routineCondition: null }),
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
        // 루틴이 설정되어 있는 Task는 "모두/이번만 수정" 선택 다이얼로그를 띄운다
        if (isRoutineTask) {
          showDialog({
            title: `루틴 ${isTodoMode ? '투두' : '도리'} 수정하기`,
            content: `루틴으로 수정한 앞으로의 ${isTodoMode ? '투두를' : '도리를'}\n모두 수정하시겠어요?`,
            leftButtonText: '모두 수정하기',
            rightButtonText: '이번만 수정하기',
            handleLeftButton: handleButton({ withRoutineTask: true }),
            handleRightButton: handleButton({ withRoutineTask: false }),
          });
        } else {
          // 일반(비루틴) Task는 바로 수정 반영
          handleButton({ withRoutineTask: false })();
        }
        return;
      }

      if (isTodoMode) {
        addTodoTaskMutate(payload);
        return;
      }

      // 도리는 현재 시각 이후만 등록 가능 (지난 날짜/시각이면 등록 불가)
      if (dayjs(`${date} ${payload.startTime}`).isBefore(dayjs())) {
        showDialog({ ...REGISTER_BLOCKED_DIALOG, handleAlertButton: hideDialog });
        return;
      }

      addDowithTaskMutate(payload);
    },
    [isTodoMode, isEditMode, isRoutineTask, date],
  );

  return (
    <>
      <View style={styles.container}>
        <View>
          <View style={styles.modeWrap}>{renderTaskModeButtonView()}</View>
          {/* 모드 바가 없는 투두 수정에서는 컨테이너 상단 여백(24)만 남긴다 */}
          <View style={[styles.fields, !hasModeBadge && styles.fieldsWithoutModeBadge]}>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text
                  style={[theme.TYPOGRAPHY.SUB_TITLE, isFormDisabled && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }]}
                >
                  제목
                </Text>
                <Text
                  style={[
                    theme.TYPOGRAPHY.CAPTION1_BASIC,
                    isFormDisabled && { color: theme.COLORS.GRAY_SCALE.GRAY_80 },
                  ]}
                >
                  {title.length}/20
                </Text>
              </View>
              <Controller
                name="title"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={{ borderBottomWidth: 1, paddingBottom: 8, borderColor: theme.COLORS.GRAY_SCALE.GRAY_92 }}
                    placeholder={titlePlaceholder}
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
              onPress={handleDatePicker}
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
      <DateTimePicker
        ref={dateTimePickerRef}
        mode="time"
        title="시작 시간"
        description={isDowithOnToday ? '이미 지난 시간은 선택할 수 없어요.' : ''}
        minimumDate={isDowithOnToday ? dayjs().toDate() : undefined}
        minuteInterval={5}
        onConfirm={handleDateChange}
      />
      <CategoryBottomSheet
        ref={categoryBottomSheetMethodsRef}
        taskCategoryId={taskCategoryId}
        prevSelectedCategory={prevSelectedCategory}
      />
      <RoutineBottomSheet ref={routineBottomSheetMethodsRef} taskMode={taskMode} />
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
  fields: {
    gap: 16,
    marginTop: 32,
  },
  fieldsWithoutModeBadge: {
    marginTop: 0,
  },
  /* 도리 수정 화면 상단의 모드 표시 바 */
  modeBadge: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 100,
    backgroundColor: theme.COLORS.PRIMARY.RED_98,
  },
  modeBadgeText: {
    ...theme.TYPOGRAPHY.SUB_TITLE,
    color: theme.COLORS.PRIMARY.RED_60,
  },
  optionalLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyValue: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.GRAY_SCALE.GRAY_80,
  },
  value: {
    ...theme.TYPOGRAPHY.BODY_2,
    color: theme.COLORS.DEFAULT.BLACK,
  },
  button: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 64,
    backgroundColor: theme.COLORS.PRIMARY.RED_92,
  },
});

export { Form };
