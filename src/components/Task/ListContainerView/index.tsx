import React, { useMemo } from 'react';
import { ScrollView } from 'react-native';
import dayjs from 'dayjs';

import { List } from 'components/Task';
import { useFetchTaskList } from 'hooks/queries/task/useFetchTaskList';

// NOTE: 임시 Mock Data
// const MOCK_DATA = {
//   todoTasks: [
//     {
//       id: 1,
//       taskCategoryId: 2,
//       taskCategoryName: '일상',
//       title: '아침 먹기 todo',
//       status: 'WAIT',
//       date: '2025-06-07',
//       startTime: '15:00:00',
//     },
//     {
//       id: 2,
//       taskCategoryId: 2,
//       taskCategoryName: '일상',
//       title: '아침 먹기 todo',
//       status: 'SUCCESS',
//       date: '2025-06-07',
//       startTime: '15:00:00',
//     },
//   ],
//   dowithTasks: [
//     {
//       id: 1,
//       taskCategoryId: 2,
//       taskCategoryName: '일상',
//       title: '아침 먹기 dowith',
//       status: 'WAIT',
//       date: '2025-06-07',
//       startTime: '15:00:00',
//       confirmedImageUrl: '',
//       feedBackCount: 5,
//     },
//     {
//       id: 2,
//       taskCategoryId: 2,
//       taskCategoryName: '일상',
//       title: '아침 먹기2222',
//       status: 'SUCCESS',
//       date: '2025-06-07',
//       startTime: '15:00:00',
//       confirmedImageUrl: 'https://media.bunjang.co.kr/images/crop/981758465_w320.jpg',
//       feedBackCount: 5,
//     },
//     {
//       id: 3,
//       taskCategoryId: 2,
//       taskCategoryName: '일상',
//       title: '아침 먹기3333',
//       status: 'FAIL',
//       date: '2025-06-07',
//       startTime: '15:00:00',
//       // confirmedImageUrl: 'https://example.com/image.jpg',
//       feedBackCount: 5,
//     },
//     {
//       id: 4,
//       taskCategoryId: 2,
//       taskCategoryName: '일상',
//       title: '아침 먹기3333',
//       status: 'FAIL',
//       date: '2025-06-07',
//       startTime: '15:00:00',
//       // confirmedImageUrl: 'https://example.com/image.jpg',
//       feedBackCount: 5,
//     },
//     {
//       id: 5,
//       taskCategoryId: 2,
//       taskCategoryName: '일상',
//       title: '아침 먹기3333',
//       status: 'FAIL',
//       date: '2025-06-07',
//       startTime: '15:00:00',
//       // confirmedImageUrl: 'https://example.com/image.jpg',
//       feedBackCount: 5,
//     },
//     {
//       id: 6,
//       taskCategoryId: 2,
//       taskCategoryName: '일상',
//       title: '아침 먹기3333',
//       status: 'FAIL',
//       date: '2025-06-07',
//       startTime: '15:00:00',
//       // confirmedImageUrl: 'https://example.com/image.jpg',
//       feedBackCount: 5,
//     },
//     {
//       id: 7,
//       taskCategoryId: 2,
//       taskCategoryName: '일상',
//       title: '아침 먹기3333',
//       status: 'FAIL',
//       date: '2025-06-07',
//       startTime: '15:00:00',
//       // confirmedImageUrl: 'https://example.com/image.jpg',
//       feedBackCount: 5,
//     },
//     {
//       id: 8,
//       taskCategoryId: 2,
//       taskCategoryName: '일상',
//       title: '아침 먹기3333',
//       status: 'FAIL',
//       date: '2025-06-07',
//       startTime: '15:00:00',
//       // confirmedImageUrl: 'https://example.com/image.jpg',
//       feedBackCount: 5,
//     },
//     {
//       id: 9,
//       taskCategoryId: 2,
//       taskCategoryName: '일상',
//       title: '아침 먹기3333',
//       status: 'FAIL',
//       date: '2025-06-07',
//       startTime: '15:00:00',
//       // confirmedImageUrl: 'https://example.com/image.jpg',
//       feedBackCount: 5,
//     },
//     {
//       id: 10,
//       taskCategoryId: 2,
//       taskCategoryName: '일상',
//       title: '아침 먹기3333',
//       status: 'FAIL',
//       date: '2025-06-07',
//       startTime: '15:00:00',
//       // confirmedImageUrl: 'https://example.com/image.jpg',
//       feedBackCount: 5,
//     },
//   ],
// };

interface Props {
  selectedDate: string;
}

const ListContainerView = ({ selectedDate }: Props) => {
  const year = dayjs(selectedDate).year();
  const month = dayjs(selectedDate).month() + 1;
  const yearMonth = useMemo(() => ({ year, month }), [year, month]);
  const { data: taskList } = useFetchTaskList(yearMonth);

  const filteredTaskList = taskList
    ? {
        dowithTasks: taskList.dowithTasks.filter(task => task.date === selectedDate),
        todoTasks: taskList.todoTasks.filter(task => task.date === selectedDate),
      }
    : null;

  return filteredTaskList ? (
    <ScrollView contentContainerStyle={{ paddingBottom: 134, gap: 16 }} showsVerticalScrollIndicator={false}>
      <List type="DOWITH" items={filteredTaskList.dowithTasks} />
      <List type="TODO" items={filteredTaskList.todoTasks} />
    </ScrollView>
  ) : null;
};

export { ListContainerView };
