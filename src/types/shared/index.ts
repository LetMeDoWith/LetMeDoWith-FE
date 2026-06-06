import type { StackScreenProps } from '@react-navigation/stack';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type SignUpStackParamList = {
  SIGN_UP_USER_INFO: undefined;
  SIGN_UP_AGREEMENT: undefined;
};

type SignUpStackScreenProps<T extends keyof SignUpStackParamList> = StackScreenProps<SignUpStackParamList, T>;

type HomeTabParamList = {
  MYTODO: undefined;
  FEED: undefined;
  MYPAGE: undefined;
};

type RootStackParamList = {
  HOME: NavigatorScreenParams<HomeTabParamList> | undefined;
  SETTING: NavigatorScreenParams<SettingStackParamList> | undefined;
  TASK_FORM: {
    screen: 'COMMON' | 'ROUTINE';
    date: string;
    isRoutineTask?: boolean;
    id?: number;
    mode?: TaskModeType;
  };
  FEEDBACK: undefined;
  REALTIME_NAG: undefined;
  MYINFO: undefined;
  NOTIFICATION_LIST: undefined;
};

type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<RootStackParamList, T>;

type HomeTabScreenProps<T extends keyof HomeTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<HomeTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

type TaskModeType = 'TODO' | 'DOWITH';

type TaskFormStackParamList = {
  COMMON: {
    id: number;
    isRoutineTask: boolean;
    mode?: TaskModeType;
  };
  ROUTINE: {
    id: number;
    isRoutineTask: boolean;
    mode: TaskModeType;
  };
};

type TaskFormStackScreenProps<T extends keyof TaskFormStackParamList> = StackScreenProps<TaskFormStackParamList, T>;

type NoticeType = 'NOTICE' | 'EVENT';

type FeedbackStackParamList = {
  DEFAULT: undefined;
};

type FeedbackTabParamList = {
  RECEIVE: undefined;
  SEND: undefined;
};

type SettingStackParamList = {
  DEFAULT: undefined;
  MYINFO: undefined;
  NOTIFICATION: undefined;
  NOTICE: undefined;
  NOTICE_DETAIL: {
    noticeId: number;
  };
  POLICY: undefined;
  ACCOUNT: undefined;
  BADGE_INFO: undefined;
};

type SettingStackScreenProps<T extends keyof SettingStackParamList> = StackScreenProps<SettingStackParamList, T>;

export type {
  SignUpStackParamList,
  SignUpStackScreenProps,
  RootStackParamList,
  RootStackScreenProps,
  HomeTabParamList,
  HomeTabScreenProps,
  TaskModeType,
  TaskFormStackParamList,
  TaskFormStackScreenProps,
  FeedbackStackParamList,
  FeedbackTabParamList,
  SettingStackParamList,
  SettingStackScreenProps,
  NoticeType,
};
