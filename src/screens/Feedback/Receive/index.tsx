import { StyleSheet, View } from 'react-native';

import { Comment } from 'components/Feedback';

const ReceiveFeedback = () => {
  return (
    <View style={styles.container}>
      <Comment />
      <Comment />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
});

export { ReceiveFeedback };
