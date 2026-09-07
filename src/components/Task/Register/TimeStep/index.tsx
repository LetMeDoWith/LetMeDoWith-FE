import React from 'react';
import { StyleSheet, View } from 'react-native';
import DatePicker, { type DatePickerProps } from 'react-native-date-picker';

/*
 * 휠 높이를 고정한다. 두지 않으면 네이티브 피커의 고유 높이가 실제 보이는 휠보다 커서
 * 아래에 빈 공간이 남고, 그만큼 초기화 위쪽 여백이 넓어 보인다.
 */
const PICKER_HEIGHT = 216;

interface Props {
  value: Date;
  onChange: (date: Date) => void;
  /* 오늘 등록하는 도리는 이미 지난 시각을 고를 수 없다 */
  minimumDate?: Date;
  minuteInterval?: DatePickerProps['minuteInterval'];
}

const TimeStep = ({ value, onChange, minimumDate, minuteInterval }: Props) => (
  <View style={styles.container}>
    <DatePicker
      open
      mode="time"
      locale="ko-KR"
      style={styles.picker}
      date={value}
      minimumDate={minimumDate}
      minuteInterval={minuteInterval}
      onDateChange={onChange}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 8,
  },
  picker: {
    height: PICKER_HEIGHT,
  },
});

export { TimeStep };
