import { memo } from 'react';
import { View } from 'react-native';

import { List } from 'components/Task';
import type { fetchTaskListResponseSchemeDataType } from 'types/task/scheme/api';
import type { Rect } from 'utils/onboarding';

interface Props {
  year: number;
  month: number;
  taskList: fetchTaskListResponseSchemeDataType;
  selectedDate: string;
  onMeasureOnboardingTargets?: (targets: { status: Rect; thunder: Rect }) => void;
}

// 스크롤은 홈 화면 바깥 ScrollView가 담당(달력+리스트 전체가 함께 스크롤)하므로 여기선 목록만 렌더한다.
const ListContainerView = memo(({ year, month, taskList, selectedDate, onMeasureOnboardingTargets }: Props) => (
  <View style={{ gap: 16 }}>
    <List
      type="DOWITH"
      items={taskList.dowithTasks}
      year={year}
      month={month}
      selectedDate={selectedDate}
      onMeasureOnboardingTargets={onMeasureOnboardingTargets}
    />
    <List type="TODO" items={taskList.todoTasks} year={year} month={month} selectedDate={selectedDate} />
  </View>
));
ListContainerView.displayName = 'ListContainerView';

export { ListContainerView };
