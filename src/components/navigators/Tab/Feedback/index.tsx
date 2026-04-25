import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { ReceiveFeedback, SendFeedback } from 'screens/Feedback';
import { Thunder } from 'components/common/icons/Thunder';
import type { FeedbackTabParamList, RootStackParamList } from 'types/shared';
import { theme } from 'styles/theme';

const FeedbackTopTabNavigator = () => {
  const Tab = createMaterialTopTabNavigator<FeedbackTabParamList>();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handlePressNag = () => {
    navigation.navigate('HOME', { screen: 'FEED' });
  };

  return (
    <View style={styles.wrapper}>
      <Tab.Navigator
        sceneContainerStyle={{
          backgroundColor: theme.COLORS.DEFAULT.WHITE,
          paddingVertical: 24,
          paddingHorizontal: 20,
        }}
        screenOptions={{
          tabBarIndicatorStyle: { backgroundColor: theme.COLORS.DEFAULT.BLACK },
        }}
      >
        <Tab.Screen name="RECEIVE" component={ReceiveFeedback} options={{ tabBarLabel: '받은 잔소리' }} />
        <Tab.Screen name="SEND" component={SendFeedback} options={{ tabBarLabel: '보낸 잔소리' }} />
      </Tab.Navigator>
      <Pressable style={styles.fab} onPress={handlePressNag}>
        <Thunder width={16} height={16} fill={theme.COLORS.DEFAULT.WHITE} />
        <Text style={styles.fabText}>잔소리하기</Text>
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
