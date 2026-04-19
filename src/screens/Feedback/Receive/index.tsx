import { StyleSheet, View } from 'react-native';

import { EmptyComment } from 'components/Feedback';

// TODO: 받은 잔소리 API 연동
const ReceiveFeedback = () => {
  return (
    <View style={styles.container}>
      <EmptyComment />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export { ReceiveFeedback };
