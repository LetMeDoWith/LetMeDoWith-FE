import { StyleSheet, Text, View } from 'react-native';

import { theme } from 'styles/theme';

const EmptyComment = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>아직 보낸 잔소리가 없어요 </Text>
      <View style={styles.descriptionWrap}>
        <Text style={styles.description}>내가 먼저 잔소리를 보내면 </Text>
        <Text style={styles.description}>잔소리 받을 확률 UP! </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  title: { ...theme.TYPOGRAPHY.TITLE_2, fontWeight: 'bold', color: theme.COLORS.GRAY_SCALE.GRAY_80 },
  descriptionWrap: {
    alignItems: 'center',
  },
  description: { ...theme.TYPOGRAPHY.BODY_2, color: theme.COLORS.GRAY_SCALE.GRAY_80 },
});

export { EmptyComment };
