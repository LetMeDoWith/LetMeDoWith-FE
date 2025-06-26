import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useCallback, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import DatePicker from 'react-native-date-picker';
import { getBottomSpace } from 'react-native-iphone-screen-helper';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';
import dayjs from 'dayjs';

import { theme } from 'styles/theme';
import { isAos } from 'utils/device';
import { TodoMode } from 'components/common/icons/TodoMode';
import { DowithMode } from 'components/common/icons/DowithMode';
import { QuestionCircle } from 'components/common/icons/QuestionCircle';
import type { TaskModeType } from 'types/shared';
import { CategoryBottomSheet } from 'components/Task/BottomSheet/CategoryBottomSheet';
import { RoutineBottomSheet } from 'components/Task/BottomSheet/RoutineBottomSheet';
import { useFetchTaskCategoryList } from 'hooks/queries/task/useFetchTaskCategoryList';
import { ExclamationMarkCircle } from 'components/common/icons/ExclamationMarkCircle';
import { useAddTodoTask } from 'hooks/queries/task/useAddTodoTask';
import type { addTodoTaskRequestSchemeType } from 'types/task/scheme/api';

const Form = () => {
  const { control, watch, setValue, handleSubmit } = useFormContext();
  const categoryBottomSheetMethodsRef = useRef<BottomSheetModalMethods>(null);
  const routineBottomSheetMethodsRef = useRef<BottomSheetModalMethods>(null);

  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);
  const [taskMode, setTaskMode] = useState<TaskModeType | null>(null);
  const { data: taskCategoryList } = useFetchTaskCategoryList();
  const { mutate: addTodoTaskMutate, isPending: isAddTodoTaskMutateLoading } = useAddTodoTask();

  const title = watch('title');
  const startTime = watch('startTime');
  const taskCategoryId = watch('taskCategoryId');
  const routineConditionCycle = watch('routineCondition.cycle');

  const isTodoMode = taskMode === 'TODO';
  const isFormDisabled = taskMode === null;
  const isButtonDisabled = isTodoMode ? !title || isAddTodoTaskMutateLoading : !title || !startTime;
  const prevSelectedCategory = taskCategoryList?.find(({ id }) => taskCategoryId === id);

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
      setValue('startTime', dayjs(date).format('HH:mm'));
      setDatePickerOpen(false);
    },
    [setValue],
  );

  const handleTaskMode = useCallback(
    (mode: TaskModeType) => () => {
      setTaskMode(mode);
    },
    [],
  );

  const handleTaskRoutine = useCallback(() => {
    if (isFormDisabled) {
      return;
    }

    routineBottomSheetMethodsRef.current?.present();
  }, [isFormDisabled]);

  const onSubmit = useCallback((values: addTodoTaskRequestSchemeType) => {
    console.log(values);
    addTodoTaskMutate(values);
  }, []);

  return (
    <>
      <View style={styles.container}>
        <View>
          <View style={styles.modeWrap}>
            <View style={styles.modeLabel}>
              <Text style={theme.TYPOGRAPHY.SUB_TITLE}>모드 선택</Text>
              <View style={styles.modeLabelAlertWrap}>
                <Text style={styles.modeLabelAlert}>사용 가능한 두윗 모드: 3개</Text>
                <QuestionCircle />
              </View>
            </View>
            {/* TODO: 모드 변경 불가능하게 해야 함*/}
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
                <Text style={[styles.modeButtonText, taskMode === 'TODO' && { color: theme.COLORS.SECONDARY.BLUE_60 }]}>
                  혼자 하는 TO DO
                </Text>
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
                <Text style={[styles.modeButtonText, taskMode === 'DOWITH' && { color: theme.COLORS.PRIMARY.RED_60 }]}>
                  함께 하는 DO WITH
                </Text>
              </Pressable>
            </View>
          </View>
          <View style={{ gap: 16, marginTop: 32 }}>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text
                  style={[theme.TYPOGRAPHY.SUB_TITLE, isFormDisabled && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }]}
                >
                  제목
                </Text>
                <Text style={isFormDisabled && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }}>{title.length}/40</Text>
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
                    maxLength={40}
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
              <Text style={startTime ? styles.value : styles.emptyValue}>{startTime || '미등록'}</Text>
            </Pressable>
            <Controller
              name="taskCategoryId"
              control={control}
              render={() => (
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
                  <Text style={[styles.emptyValue, taskCategoryId && styles.value]}>
                    {prevSelectedCategory ? prevSelectedCategory.title : '미등록'}
                  </Text>
                </Pressable>
              )}
            />
            <Pressable
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 }}
              onPress={handleTaskRoutine}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ gap: 8 }}>
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
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <ExclamationMarkCircle />
                    <Text
                      style={[
                        theme.TYPOGRAPHY.CAPTION1_BASIC,
                        { color: isFormDisabled ? theme.COLORS.GRAY_SCALE.GRAY_80 : theme.COLORS.GRAY_SCALE.GRAY_50 },
                      ]}
                    >
                      모드를 변경하면 루틴이 초기화 돼요.
                    </Text>
                  </View>
                </View>
              </View>
              <Text
                style={[
                  theme.TYPOGRAPHY.BODY_2,
                  { color: routineConditionCycle ? theme.COLORS.DEFAULT.BLACK : theme.COLORS.GRAY_SCALE.GRAY_80 },
                ]}
              >
                {routineConditionCycle ? '사용자 지정' : '미등록'}
              </Text>
            </Pressable>
          </View>
        </View>
        <Pressable
          style={[styles.button, !isButtonDisabled && { backgroundColor: theme.COLORS.PRIMARY.RED_60 }]}
          disabled={isButtonDisabled}
          onPress={handleSubmit(onSubmit)}
        >
          <Text
            style={[
              styles.buttonText,
              isAddTodoTaskMutateLoading && { backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_80 },
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
        locale="ko-KR"
        date={dayjs().toDate()}
        minimumDate={dayjs().toDate()}
        onConfirm={handleDateChange}
        onCancel={toggleDatePicker(false)}
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
    paddingVertical: isAos ? 24 : getBottomSpace() + 24,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  modeWrap: { gap: 16 },
  modeLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modeLabelAlertWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modeLabelAlert: {
    fontSize: 13,
    color: theme.COLORS.GRAY_SCALE.GRAY_60,
  },
  modeButtonWrap: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_96,
    borderWidth: 1,
    borderRadius: 16,
  },
  modeButtonText: {
    color: theme.COLORS.DEFAULT.BLACK,
    fontSize: 13,
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
  buttonText: {
    fontSize: 18,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { Form };
