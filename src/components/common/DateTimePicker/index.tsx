import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import dayjs from 'dayjs';
import DatePicker, { DatePickerProps } from 'react-native-date-picker';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';

import { BottomSheet } from 'components/common/BottomSheet';
import { getNextMinuteBoundary } from 'utils/date';

interface Props extends Pick<DatePickerProps, 'minimumDate' | 'maximumDate' | 'minuteInterval'> {
  title: string;
  description: string;
  mode: 'date' | 'time';
  onConfirm: (date: Date) => void;
}

const DateTimePicker = forwardRef<BottomSheetModalMethods, Props>((props, ref) => {
  const { title, description, mode, onConfirm, minimumDate, maximumDate, minuteInterval } = props;
  const innerRef = useRef<BottomSheetModalMethods>(null);

  /*
   * 시각 선택의 초기값. 최소값이 있으면 raw 현재시각이 아니라 "다음 분 경계"로 맞춘다.
   * (경계로 맞추는 이유는 getNextMinuteBoundary 주석 참고)
   */
  const getInitialDate = () =>
    mode === 'time' && minimumDate && minuteInterval ? getNextMinuteBoundary(minuteInterval) : dayjs().toDate();

  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate());
  const [currentMinimumDate, setCurrentMinimumDate] = useState<Date | undefined>(
    minimumDate ? getInitialDate() : undefined,
  );
  const [isDisabled, setIsDisabled] = useState(false);

  // 피커가 열릴 때 현재 시간 기준으로 초기값 및 minimumDate 갱신
  const handleOpen = (isOpen: boolean) => {
    if (!isOpen) {
      return;
    }

    if (minimumDate) {
      const newInitial = getInitialDate();
      setSelectedDate(newInitial);
      setCurrentMinimumDate(newInitial);
    } else {
      setCurrentMinimumDate(undefined);
    }
  };

  const handleSubmit = () => {
    onConfirm(selectedDate);
    innerRef.current?.dismiss();
  };

  useEffect(() => {
    let disabled = false;
    const selected = dayjs(selectedDate);

    // 최소 Date를 설정했을 경우
    if (currentMinimumDate) {
      if (selected.isBefore(dayjs(currentMinimumDate))) {
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
  }, [selectedDate, currentMinimumDate, maximumDate, mode]);

  useImperativeHandle(ref, () => innerRef.current!);

  return (
    <BottomSheet
      ref={innerRef}
      title={title}
      description={description}
      buttonConfig={{ title: '저장하기', isDisabled }}
      snapPoints={['46%']}
      handleButtonSubmit={handleSubmit}
      onChange={handleOpen}
    >
      <View style={styles.content}>
        <DatePicker
          open
          mode={mode}
          locale="ko-KR"
          date={selectedDate}
          minimumDate={currentMinimumDate}
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
