import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { ServiceAgree } from 'components/Signup/ServiceAgree';
import { UserInfo } from 'components/Signup/UserInfo';
import { theme } from 'styles/theme';
import type { SignUpStackParamList } from 'types/shared';
import { useDialog } from 'components/common/Dialog/Provider';
import { BackButton } from 'components/common/Header/BackButton';
import { useAuthStore } from 'stores/auth';

const SignupStackNavigator = () => {
  const { Navigator, Screen } = createStackNavigator<SignUpStackParamList>();
  const { showDialog, hideDialog } = useDialog();
  const { initAuthInfo } = useAuthStore(({ actions: { initAuthInfo } }) => ({
    initAuthInfo,
  }));

  return (
    <Navigator
      initialRouteName="SIGN_UP_USER_INFO"
      screenOptions={{
        headerTitle: '회원가입',
        headerTitleAlign: 'center',
        headerBackTitleVisible: false,
        headerTintColor: theme.COLORS.DEFAULT.BLACK,
        cardStyle: { backgroundColor: theme.COLORS.DEFAULT.WHITE },
      }}
    >
      <Screen
        name="SIGN_UP_USER_INFO"
        component={UserInfo}
        options={{
          headerLeft: () => (
            <BackButton
              onPress={() =>
                showDialog({
                  title: '회원가입이 중단됩니다.',
                  content: '지금까지 입력한 정보는 저장되지 않아요.\n그래도 나가시겠어요?',
                  leftButtonText: '네',
                  rightButtonText: '아니요',
                  handleLeftButton: () => {
                    hideDialog();
                    initAuthInfo();
                  },
                  handleRightButton: hideDialog,
                })
              }
            />
          ),
        }}
      />
      <Screen
        name="SIGN_UP_AGREEMENT"
        component={ServiceAgree}
        options={({ navigation: { goBack } }) => ({
          headerLeft: () => <BackButton onPress={goBack} />,
        })}
      />
    </Navigator>
  );
};

export { SignupStackNavigator };
