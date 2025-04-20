import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'react-native-paper';

import useTheme from 'hooks/shared/useTheme';
import { Feed } from 'screens/Feed';
import { Home } from 'screens/Home';
import { Mypage } from 'screens/Mypage';
import { HomeIcon } from 'components/common/icons/HomeIcon';
import { FeedIcon } from 'components/common/icons/FeedIcon';
import { MypageIcon } from 'components/common/icons/MypageIcon';
import { theme } from 'styles/theme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import type { HomeTabParamList, RootStackScreenProps } from 'types/shared';

const BottomTabNavigator = ({ navigation }: RootStackScreenProps<'HOME'>) => {
  const { Navigator, Screen } = createBottomTabNavigator<HomeTabParamList>();
  const {
    COLORS: { GRAY_SCALE },
  } = useTheme();

  return (
    <BottomSheetModalProvider>
      <Navigator
        initialRouteName="MYTODO"
        screenOptions={{
          headerTitleAlign: 'center',
          tabBarActiveTintColor: GRAY_SCALE.GRAY_20,
          tabBarLabelStyle: {
            fontSize: 11,
            lineHeight: 14,
          },
        }}
        sceneContainerStyle={{
          backgroundColor: theme.COLORS.DEFAULT.WHITE,
        }}
      >
        <Screen
          name="FEED"
          component={Feed}
          options={{
            headerTitle: '둘러보기',
            tabBarLabel: '둘러보기',
            tabBarIcon: ({ focused }) => (
              <FeedIcon
                fill={focused ? GRAY_SCALE.GRAY_20 : GRAY_SCALE.GRAY_80}
                stroke={focused ? GRAY_SCALE.GRAY_20 : GRAY_SCALE.GRAY_80}
                fillRect={focused ? GRAY_SCALE.GRAY_80 : GRAY_SCALE.GRAY_80}
              />
            ),
          }}
        />
        <Screen
          name="MYTODO"
          component={Home}
          options={{
            headerShown: false,
            tabBarLabel: '홈',
            tabBarIcon: ({ focused }) => (
              <HomeIcon
                fill={focused ? GRAY_SCALE.GRAY_20 : GRAY_SCALE.GRAY_80}
                stroke={focused ? GRAY_SCALE.GRAY_20 : GRAY_SCALE.GRAY_80}
              />
            ),
          }}
        />
        <Screen
          name="MYPAGE"
          component={Mypage}
          options={{
            headerTitle: '내정보',
            tabBarLabel: '마이두윗',
            tabBarIcon: ({ focused }) => (
              <MypageIcon
                fill={focused ? GRAY_SCALE.GRAY_20 : GRAY_SCALE.GRAY_80}
                stroke={focused ? GRAY_SCALE.GRAY_20 : GRAY_SCALE.GRAY_80}
              />
            ),
            headerRight: () => (
              <IconButton
                icon="cog-outline"
                iconColor={theme.COLORS.DEFAULT.BLACK}
                size={18}
                onPress={() => {
                  navigation.navigate('SETTING');
                }}
              />
            ),
          }}
        />
      </Navigator>
    </BottomSheetModalProvider>
  );
};

export { BottomTabNavigator };
