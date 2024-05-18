import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { ServiceAgree } from 'components/Signup/ServiceAgree';
import { UserInfo } from 'components/Signup/UserInfo';
import { theme } from 'styles/theme';

export type RootStackParamList = {
  SIGN_UP_USER_INFO: undefined;
  SIGN_UP_AGREEMENT: undefined;
};

const SignupStackNavigator = () => {
  const { Navigator, Screen } = createStackNavigator<RootStackParamList>();
  return (
    <Navigator
      initialRouteName="SIGN_UP_USER_INFO"
      screenOptions={{
        headerTitle: '회원가입',
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTintColor: theme.COLORS.DEFAULT.BLACK,
      }}
    >
      <Screen name="SIGN_UP_USER_INFO" component={UserInfo} />
      <Screen name="SIGN_UP_AGREEMENT" component={ServiceAgree} />
    </Navigator>
  );
};

export { SignupStackNavigator };
