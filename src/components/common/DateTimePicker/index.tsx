import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
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
  const [selectedDate, setSelectedDate] = useState<Date>(dayjs().subtract(14, 'year').toDate());

  const handleSubmit = () => {
    onConfirm(selectedDate);
    innerRef.current?.dismiss();
  };

  useImperativeHandle(ref, () => innerRef.current!);

  return (
    <BottomSheet
      ref={innerRef}
      title={title}
      description={description}
      buttonConfig={{ title: '저장하기', isDisabled: false }}
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
