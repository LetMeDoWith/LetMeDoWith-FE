import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { ReceiveFeedback, SendFeedback } from 'screens/Feedback';
import { Thunder } from 'components/common/icons/Thunder';
import type { FeedbackTabParamList, RootStackParamList } from 'types/shared';
import { theme } from 'styles/theme';
import { withScreenErrorBoundary } from 'components/common/ScreenErrorBoundary';

/* 화면 렌더 에러·핵심 데이터 첫 로딩 실패 시 내용 자리를 에러 화면으로 바꾼다(헤더·탭바는 유지) */
const ReceiveFeedbackScreen = withScreenErrorBoundary(ReceiveFeedback);
const SendFeedbackScreen = withScreenErrorBoundary(SendFeedback);

const FeedbackTopTabNavigator = () => {
  const Tab = createMaterialTopTabNavigator<FeedbackTabParamList>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handlePressNag = () => {
    navigation.navigate('REALTIME_NAG');
  };

  return (
    <View style={styles.wrapper}>
      <Tab.Navigator
        sceneContainerStyle={{
          backgroundColor: theme.COLORS.DEFAULT.WHITE,
        }}
        screenOptions={{
          tabBarIndicatorStyle: { backgroundColor: theme.COLORS.DEFAULT.BLACK },
        }}
      >
        <Tab.Screen name="RECEIVE" component={ReceiveFeedbackScreen} options={{ tabBarLabel: '받은 잡도리' }} />
        <Tab.Screen name="SEND" component={SendFeedbackScreen} options={{ tabBarLabel: '보낸 잡도리' }} />
      </Tab.Navigator>
      <Pressable style={styles.fab} onPress={handlePressNag}>
        <Thunder width={16} height={16} fill={theme.COLORS.DEFAULT.WHITE} />
        <Text style={styles.fabText}>잡도리하기</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: theme.COLORS.PRIMARY.RED_60,
    shadowColor: theme.COLORS.DEFAULT.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    ...theme.TYPOGRAPHY.BODY_1,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { FeedbackTopTabNavigator };
