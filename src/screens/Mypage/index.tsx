import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Profile } from 'components/Mypage/Profile';
import { Dashboard } from 'components/Mypage/Dashboard';
import { useFetchMyDowithInfo } from 'hooks/queries/member/useFetchMyDowithInfo';

const Mypage = () => {
  const { data } = useFetchMyDowithInfo();

  if (!data) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Profile data={data} />
      <Dashboard />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingBottom: 24,
    paddingVertical: 24,
    flex: 1,
  },
});

export { Mypage };
