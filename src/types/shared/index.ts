import type { StackScreenProps } from '@react-navigation/stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

type SignUpStackParamList = {
  SIGN_UP_USER_INFO: undefined;
  SIGN_UP_AGREEMENT: undefined;
};

type SignUpStackScreenProps<T extends keyof SignUpStackParamList> = StackScreenProps<SignUpStackParamList, T>;

type RootStackParamList = {
  HOME: undefined;
  SETTING: undefined;
};

type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<RootStackParamList, T>;

type HomeTabParamList = {
  MYTODO: undefined;
  FEED: undefined;
  MYPAGE: undefined;
};

type HomeTabScreenProps<T extends keyof HomeTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<HomeTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

type SettingStackParamList = {
  DEFAULT: undefined;
  MYINFO: undefined;
  NOTIFICATION: undefined;
  POLICY: undefined;
};

type SettingStackScreenProps<T extends keyof SettingStackParamList> = StackScreenProps<SettingStackParamList, T>;

export type {
  SignUpStackParamList,
  SignUpStackScreenProps,
  RootStackParamList,
  RootStackScreenProps,
  HomeTabParamList,
  HomeTabScreenProps,
  SettingStackParamList,
  SettingStackScreenProps,
};
