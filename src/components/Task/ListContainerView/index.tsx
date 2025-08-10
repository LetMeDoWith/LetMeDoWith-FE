import React from 'react';
import { ScrollView } from 'react-native';

import { List } from 'components/Task';
import type { fetchTaskListResponseSchemeDataType } from 'types/task/scheme/api';

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
  year: number;
  month: number;
  taskList: fetchTaskListResponseSchemeDataType;
}

const ListContainerView = ({ year, month, taskList }: Props) => (
  <ScrollView contentContainerStyle={{ paddingBottom: 134, gap: 16 }} showsVerticalScrollIndicator={false}>
    <List type="DOWITH" items={taskList.dowithTasks} year={year} month={month} />
    <List type="TODO" items={taskList.todoTasks} year={year} month={month} />
  </ScrollView>
);

export { ListContainerView };
