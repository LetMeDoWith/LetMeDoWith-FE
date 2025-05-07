import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useCallback, useRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import DatePicker from 'react-native-date-picker';
import { getBottomSpace } from 'react-native-iphone-screen-helper';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';
import dayjs from 'dayjs';

import { theme } from 'styles/theme';
import { isAos } from 'utils/device';
import { TodoMode } from 'components/common/icons/TodoMode';
import { DowithMode } from 'components/common/icons/DowithMode';
import { QuestionCircle } from 'components/common/icons/QuestionCircle';
import type { TaskFormStackScreenProps, TaskModeType } from 'types/shared';
import { CategoryBottomSheet } from 'components/Task/BottomSheet/CategoryBottomSheet';

// TODO: Task 카테고리 API 연동
const MOCK_CATEGORY_LIST = [
  { id: 1, name: '카테고리1' },
  { id: 2, name: '카테고리2' },
  { id: 3, name: '카테고리3' },
  { id: 4, name: '카테고리4' },
  { id: 5, name: '카테고리5' },
  { id: 6, name: '카테고리6' },
  { id: 7, name: '카테고리7' },
  { id: 8, name: '카테고리8' },
];

const Form = ({ navigation: { navigate } }: TaskFormStackScreenProps<'FORM'>) => {
  const { control, watch, setValue, handleSubmit } = useFormContext();
  const categoryBottomSheetMethodsRef = useRef<BottomSheetModalMethods>(null);

  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);
  const [taskMode, setTaskMode] = useState<TaskModeType | null>(null);

  const title = watch('title');
  const startDateTime = watch('startDateTime');
  const taskCategoryId = watch('taskCategoryId');

  const isFormDisabled = taskMode === null;
  const isButtonDisabled = !title || !startDateTime;
  const prevSelectedCategory = MOCK_CATEGORY_LIST.find(({ id }) => taskCategoryId === id);

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
      setValue('startDateTime', dayjs(date).format('HH:mm'));
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

    navigate('ROUTINE_FORM', { mode: taskMode });
  }, [navigate, taskMode, isFormDisabled]);

  const onSubmit = useCallback<any>((values: FormData) => {
    console.log(values);
  }, []);

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <View>
          <View style={styles.modeWrap}>
            <View style={styles.modeLabel}>
              <Text style={styles.labelTitle}>모드 선택</Text>
              <View style={styles.modeLabelAlertWrap}>
                <Text style={styles.modeLabelAlert}>사용 가능한 두윗 모드: 3개</Text>
                <QuestionCircle />
              </View>
            </View>
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
                  혼자 하는 투두 모드
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
                  혼자 하는 두윗 모드
                </Text>
              </Pressable>
            </View>
          </View>
          <View style={{ gap: 16, marginTop: 32 }}>
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={[styles.labelTitle, isFormDisabled && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }]}>
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
              <Text style={[styles.labelTitle, isFormDisabled && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }]}>
                시작 시간
              </Text>
              <Text style={startDateTime ? styles.value : styles.emptyValue}>{startDateTime || '미등록'}</Text>
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
                    <Text style={[styles.labelTitle, isFormDisabled && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }]}>
                      카테고리
                    </Text>
                    <Text style={styles.optionalLabel}>(선택)</Text>
                  </View>
                  <Text style={[styles.emptyValue, taskCategoryId && styles.value]}>
                    {prevSelectedCategory ? prevSelectedCategory.name : '미등록'}
                  </Text>
                </Pressable>
              )}
            />
            <Pressable
              style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 }}
              onPress={handleTaskRoutine}
            >
              <View style={styles.optionalLabelWrap}>
                <Text style={[styles.labelTitle, isFormDisabled && { color: theme.COLORS.GRAY_SCALE.GRAY_80 }]}>
                  루틴 설정
                </Text>
                <Text style={styles.optionalLabel}>(선택)</Text>
              </View>
              <Text style={styles.emptyValue}>미등록</Text>
            </Pressable>
          </View>
        </View>
        <Pressable
          style={[styles.button, !isButtonDisabled && { backgroundColor: theme.COLORS.PRIMARY.RED_60 }]}
          disabled={isButtonDisabled}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>저장하기</Text>
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
    </BottomSheetModalProvider>
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
  labelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.COLORS.DEFAULT.BLACK,
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
  optionalLabel: {
    color: theme.COLORS.GRAY_SCALE.GRAY_70,
    fontSize: 12,
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
