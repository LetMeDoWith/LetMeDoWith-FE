import { memo } from 'react';
import { ScrollView } from 'react-native';

import { List } from 'components/Task';
import type { fetchTaskListResponseSchemeDataType } from 'types/task/scheme/api';

interface Props {
  year: number;
  month: number;
  taskList: fetchTaskListResponseSchemeDataType;
  selectedDate: string;
}

const ListContainerView = memo(({ year, month, taskList, selectedDate }: Props) => (
  <ScrollView contentContainerStyle={{ paddingBottom: 134, gap: 16 }} showsVerticalScrollIndicator={false}>
    <List type="DOWITH" items={taskList.dowithTasks} year={year} month={month} selectedDate={selectedDate} />
    <List type="TODO" items={taskList.todoTasks} year={year} month={month} selectedDate={selectedDate} />
  </ScrollView>
));
ListContainerView.displayName = 'ListContainerView';

export { ListContainerView };
