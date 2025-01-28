import { Dimensions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import React, { useCallback, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import DatePicker from 'react-native-date-picker';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { getBottomSpace } from 'react-native-iphone-screen-helper';
import dayjs from 'dayjs';
import { theme } from 'styles/theme';

import { isAos } from 'utils/device';
import { TodoMode } from 'components/common/icons/TodoMode';
import { DowithMode } from 'components/common/icons/DowithMode';
import { QuestionCircle } from 'components/common/icons/QuestionCircle';

type TaskMode = 'TODO' | 'DOWITH';

const Form = () => {
  const { control, watch, setValue, handleSubmit } = useFormContext();

  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);
  const [taskMode, setTaskMode] = useState<TaskMode | null>(null);

  const title = watch('title');
  const startDateTime = watch('startDateTime');

  const isButtonDisabled = !title || !startDateTime;

  const toggleDatePicker = useCallback((isOpen: boolean) => () => setDatePickerOpen(isOpen), []);

  const handleDateChange = useCallback(
    (date: Date) => {
      setValue('startDateTime', dayjs(date).format('HH:mm'));
      setDatePickerOpen(false);
    },
    [setValue],
  );

  const handleTaskMode = useCallback(
    (mode: TaskMode) => () => {
      setTaskMode(mode);
    },
    [],
  );

  const onSubmit = useCallback<any>((values: FormData) => {
    console.log(values);
  }, []);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.modeLabelWrap}>
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
              <Text style={styles.labelTitle}>제목</Text>
              <Text>{title.length}/40</Text>
            </View>
            <Controller
              name="title"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{ borderBottomWidth: 1, paddingBottom: 8, borderColor: theme.COLORS.GRAY_SCALE.GRAY_90 }}
                  placeholder="해야할 일을 등록해보세요."
                  onChangeText={value => {
                    onChange(value);
                  }}
                  value={value}
                  maxLength={40}
                />
              )}
            />
          </View>
          {/*<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>*/}
          <Pressable
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 }}
            onPress={toggleDatePicker(true)}
          >
            <Text style={styles.labelTitle}>시작 시간</Text>
            <Text style={startDateTime ? styles.value : styles.emptyValue}>{startDateTime || '미등록'}</Text>
          </Pressable>
          {/*</View>*/}
          <Pressable
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 }}
            onPress={() => console.log('카테고리 선택')}
          >
            <View style={styles.optionalLabelWrap}>
              <Text style={styles.labelTitle}>카테고리</Text>
              <Text style={styles.optionalLabel}>(선택)</Text>
            </View>
            <Text style={styles.emptyValue}>미등록</Text>
          </Pressable>
          <Pressable
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 }}
            onPress={() => console.log('루틴 선택')}
          >
            <View style={styles.optionalLabelWrap}>
              <Text style={styles.labelTitle}>루틴 설정</Text>
              <Text style={styles.optionalLabel}>(선택)</Text>
            </View>
            <Text style={styles.emptyValue}>미등록</Text>
          </Pressable>
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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    minHeight: isAos
      ? Dimensions.get('window').height - getStatusBarHeight() - 50
      : Dimensions.get('window').height - getStatusBarHeight() - getBottomSpace() - 20,
  },
  modeLabelWrap: { gap: 12 },
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
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_95,
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
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    height: 64,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_500,
  },
  buttonText: {
    fontSize: 18,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { Form };
