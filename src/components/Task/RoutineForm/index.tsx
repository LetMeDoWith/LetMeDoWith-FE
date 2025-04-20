import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import type { TaskFormStackScreenProps } from 'types/shared';
import { isAos } from 'utils/device';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { getBottomSpace } from 'react-native-iphone-screen-helper';
import { theme } from 'styles/theme';
import { TodoMode } from 'components/common/icons/TodoMode';
import { DowithMode } from 'components/common/icons/DowithMode';
import { useFormContext } from 'react-hook-form';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { ExclamationMarkCircle } from 'components/common/icons/ExclamationMarkCircle';
import DatePicker from 'react-native-date-picker';
import { Switch } from 'react-native-paper';

dayjs.extend(customParseFormat);

const RoutineForm = ({ route: { params } }: TaskFormStackScreenProps<'ROUTINE_FORM'>) => {
  const { watch, setValue, handleSubmit } = useFormContext();
  const { mode } = params;

  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);
  const [isSwitchOn, setIsSwitchOn] = React.useState(false);
  const [selecedtDateLabelName, setSelectedDateLabelName] = useState<
    'routineStartDateTime' | 'routineEndDateTime' | null
  >(null);

  const isTodoMode = mode === 'TODO';
  const routineStartDateTime = watch('routineStartDateTime');
  const routineEndDateTime = watch('routineEndDateTime');
  const isButtonDisabled = !routineStartDateTime || !routineEndDateTime;

  const onToggleSwitch = useCallback(() => setIsSwitchOn(!isSwitchOn), [isSwitchOn]);

  const handleDateLabelName = useCallback(
    (name: 'routineStartDateTime' | 'routineEndDateTime') => () => {
      if (!name) {
        return;
      }

      setSelectedDateLabelName(name);
      setDatePickerOpen(true);
    },
    [],
  );

  const toggleDatePicker = useCallback((isOpen: boolean) => () => setDatePickerOpen(isOpen), []);
  const handleDateChange = useCallback(
    (name: string, date: Date) => {
      setValue(name, dayjs(date).format('YYYY. MM. DD'));
      setDatePickerOpen(false);
    },
    [setValue],
  );

  const handleDuplicatePattern = useCallback(() => {
    console.log('반복 패턴 설정');
  }, []);

  const onSubmit = useCallback<any>((values: FormData) => {
    console.log(values);
  }, []);

  useEffect(() => {
    setValue('routineStartDateTime', dayjs().format('YYYY. MM. DD'));
  }, [setValue]);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.modeWrap}>
          <Text style={styles.label}>선택한 모드</Text>
          <View
            style={[
              styles.modeImageWrap,
              { backgroundColor: isTodoMode ? theme.COLORS.SECONDARY.BLUE_95 : theme.COLORS.PRIMARY.RED_98 },
            ]}
          >
            {isTodoMode ? <TodoMode /> : <DowithMode />}
            <Text style={{ color: isTodoMode ? theme.COLORS.SECONDARY.BLUE_60 : theme.COLORS.PRIMARY.RED_60 }}>
              {isTodoMode ? '혼자 하는 투두 모드' : '함께 하는 두윗 모드'}
            </Text>
          </View>
          {isTodoMode ? (
            <View style={[styles.adviceTextWrap, { marginTop: -4 }]}>
              <ExclamationMarkCircle />
              <Text style={styles.adviceText}>모드를 변경하면 등록한 패턴이 초기화 돼요.</Text>
            </View>
          ) : null}
        </View>
        <Pressable style={styles.selectDateWrap} onPress={handleDateLabelName('routineStartDateTime')}>
          <Text style={styles.label}>시작 날짜</Text>
          <Text style={routineStartDateTime ? styles.value : styles.emptyValue}>{routineStartDateTime}</Text>
        </Pressable>
        <Pressable
          style={[styles.selectDateWrap, { alignItems: 'flex-start' }]}
          onPress={handleDateLabelName('routineEndDateTime')}
        >
          <View style={styles.endDateLabel}>
            <Text style={styles.label}>종료 날짜</Text>
            <View style={styles.adviceTextWrap}>
              <ExclamationMarkCircle />
              <Text style={styles.adviceText}>루틴 일정은 5년 이내로 설정할 수 있어요</Text>
            </View>
          </View>
          <Text style={routineEndDateTime ? styles.value : styles.emptyValue}>{routineEndDateTime || '미지정'}</Text>
        </Pressable>
        {isTodoMode ? (
          <>
            {/* TODO: 반복 패턴 화면 연결 필요 */}
            <Pressable style={styles.selectDateWrap} onPress={handleDuplicatePattern}>
              <Text style={styles.label}>반복 패턴</Text>
              <Text style={styles.emptyValue}>미지정</Text>
            </Pressable>
            <Pressable style={styles.selectDateWrap}>
              <Text style={styles.label}>
                공휴일 제외하기{' '}
                <Text style={[styles.optionText, { color: theme.COLORS.GRAY_SCALE.GRAY_70 }]}>(선택)</Text>
              </Text>
              {/* TODO: form Value와 연결 */}
              <Switch value={isSwitchOn} color={theme.COLORS.PRIMARY.RED_60} onValueChange={onToggleSwitch} />
            </Pressable>
          </>
        ) : null}
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
        mode="date"
        locale="ko-KR"
        date={
          // TODO: Date 객체 변환 필요
          // selecedtDateLabelName === 'routineStartDateTime' || selecedtDateLabelName === null
          //   ? dayjs(routineStartDateTime, 'YYYY. MM. DD').toDate()
          //   : dayjs(routineEndDateTime, 'YYYY. MM. DD').toDate()
          dayjs().toDate()
        }
        minimumDate={dayjs().toDate()}
        onConfirm={date => {
          if (!selecedtDateLabelName) {
            return;
          }

          handleDateChange(selecedtDateLabelName, date);
        }}
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
    gap: 32,
  },
  modeWrap: {
    gap: 12,
  },
  label: theme.TYPOGRAPHY.SUB_TITLE,
  modeImageWrap: {
    width: '100%',
    height: 112,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  selectDateWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyValue: {
    color: theme.COLORS.GRAY_SCALE.GRAY_80,
  },
  value: {
    color: theme.COLORS.DEFAULT.BLACK,
  },
  endDateLabel: {
    gap: 8,
  },
  adviceTextWrap: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  adviceText: {
    color: theme.COLORS.GRAY_SCALE.GRAY_60,
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
  optionText: theme.TYPOGRAPHY.CAPTION1_BASIC,
});

export { RoutineForm };
