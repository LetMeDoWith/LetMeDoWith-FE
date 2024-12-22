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
import type { HomeTabParamList, RootStackScreenProps } from 'types/shared';

const BottomTabNavigator = ({ navigation }: RootStackScreenProps<'HOME'>) => {
  const { Navigator, Screen } = createBottomTabNavigator<HomeTabParamList>();
  const {
    COLORS: { DEFAULT, PRIMARY, GRAY_SCALE },
  } = useTheme();

  return (
    <Navigator
      initialRouteName="MYTODO"
      screenOptions={{
        headerTitleAlign: 'center',
        tabBarActiveTintColor: PRIMARY.RED_60,
      }}
    >
      <Screen
        name="FEED"
        component={Feed}
        options={{
          headerTitle: '피드',
          tabBarLabel: '피드',
          tabBarIcon: ({ focused }) => (
            <FeedIcon
              fill={focused ? PRIMARY.RED_60 : DEFAULT.WHITE}
              stroke={focused ? PRIMARY.RED_60 : GRAY_SCALE.GRAY_60}
              fillRect={focused ? DEFAULT.WHITE : GRAY_SCALE.GRAY_60}
            />
          ),
        }}
      />
      <Screen
        name="MYTODO"
        component={Home}
        options={{
          headerShown: false,
          tabBarLabel: '마이투두',
          tabBarIcon: ({ focused }) => (
            <HomeIcon
              fill={focused ? PRIMARY.RED_60 : DEFAULT.WHITE}
              stroke={focused ? PRIMARY.RED_60 : GRAY_SCALE.GRAY_60}
            />
          ),
        }}
      />
      <Screen
        name="MYPAGE"
        component={Mypage}
        options={{
          headerTitle: '내정보',
          tabBarLabel: '내정보',
          tabBarIcon: ({ focused }) => (
            <MypageIcon
              fill={focused ? PRIMARY.RED_60 : DEFAULT.WHITE}
              stroke={focused ? PRIMARY.RED_60 : GRAY_SCALE.GRAY_60}
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
  );
};

export { BottomTabNavigator };
