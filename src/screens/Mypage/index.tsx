import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Profile } from 'components/Mypage/Profile';
import { Dashboard } from 'components/Mypage/Dashboard';
import { theme } from 'styles/theme';

const Mypage = () => (
  // TODO: AOS 화면 비율 때문에 임시 ScrollView 조치
  <ScrollView>
    <Profile />
    <View style={styles.dashboardWrapper}>
      <Dashboard />
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  dashboardWrapper: {
    backgroundColor: theme.COLORS.GRAY_SCALE.BLUE_GRAY_200,
    height: '100%',
    paddingVertical: 26,
    paddingHorizontal: 24,
  },
});

export { Mypage };
