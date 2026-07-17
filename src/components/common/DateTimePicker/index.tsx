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

      // 현재 분이 5분 단위에 정확히 걸쳐도 다음 단위로 (항상 현재보다 미래인 5분 단위)
      const nextMinutes = (Math.floor(currentMinutes / minuteInterval) + 1) * minuteInterval;

      // 60분을 넘으면 다음 시간으로
      if (nextMinutes >= 60) {
        return now.add(1, 'hour').minute(0).second(0).millisecond(0).toDate();
      }

      return now.minute(nextMinutes).second(0).millisecond(0).toDate();
    }

    return dayjs().toDate();
  };

  const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate());
  // 최소 선택 가능 시각을 raw 현재시각(예: 10:08)이 아닌 "다음 5분 경계"(예: 10:10)로 맞춘다.
  // raw 값을 쓰면 과거 시각 선택 시 네이티브 피커가 10:08 같은 비경계 값으로 스냅되어 저장되는 문제가 있음.
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
