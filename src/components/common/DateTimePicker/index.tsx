import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import dayjs from 'dayjs';
import DatePicker, { DatePickerProps } from 'react-native-date-picker';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';

import { BottomSheet } from 'components/common/BottomSheet';

interface Props extends Pick<DatePickerProps, 'minimumDate' | 'maximumDate' | 'minuteInterval'> {
  title: string;
  description: string;
  mode: 'date' | 'time';
  onConfirm: (date: Date) => void;
}

const DateTimePicker = forwardRef<BottomSheetModalMethods, Props>((props, ref) => {
  const { title, description, mode, onConfirm, minimumDate, maximumDate, minuteInterval } = props;
  const innerRef = useRef<BottomSheetModalMethods>(null);

  // time 모드일 경우, minimumDate가 있으면 가장 가까운 미래 시간으로 설정
  const getInitialDate = () => {
    if (mode === 'time' && minimumDate && minuteInterval) {
      const now = dayjs();
      const currentMinutes = now.minute();

      // minuteInterval에 맞춰 올림
      const nextMinutes = Math.ceil(currentMinutes / minuteInterval) * minuteInterval;

      // 60분을 넘으면 다음 시간으로
      if (nextMinutes >= 60) {
        return now.add(1, 'hour').minute(0).second(0).millisecond(0).toDate();
      }

      return now.minute(nextMinutes).second(0).millisecond(0).toDate();
    }

    return dayjs().toDate();
  };

  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate());
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSubmit = () => {
    onConfirm(selectedDate);
    innerRef.current?.dismiss();
  };

  useEffect(() => {
    let disabled = false;
    const selected = dayjs(selectedDate);

    // 최소 Date를 설정했을 경우
    if (minimumDate) {
      const minimum = dayjs(minimumDate);

      // 선택한 시간이 최소 시간보다 이전이면 비활성화
      if (selected.isBefore(minimum)) {
        disabled = true;
      }
    }

    // 최대 Date를 설정했을 경우
    if (maximumDate) {
      const maximum = dayjs(maximumDate);
      // 선택한 시간이 최대 시간보다 이후면 비활성화
      if (selected.isAfter(maximum)) {
        disabled = true;
      }
    }

    setIsDisabled(disabled);
  }, [selectedDate, minimumDate, maximumDate, mode]);

  useImperativeHandle(ref, () => innerRef.current!);

  return (
    <BottomSheet
      ref={innerRef}
      title={title}
      description={description}
      buttonConfig={{ title: '저장하기', isDisabled }}
      snapPoints={['46%']}
      handleButtonSubmit={handleSubmit}
    >
      <View style={styles.content}>
        <DatePicker
          open
          mode={mode}
          locale="ko-KR"
          date={selectedDate}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          minuteInterval={minuteInterval}
          onDateChange={date => {
            setSelectedDate(date);
          }}
        />
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
});

export { DateTimePicker };
