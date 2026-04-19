import { StyleSheet, Text, View } from 'react-native';

import { DashedThunder } from 'components/common/icons/DashedThunder';
import { theme } from 'styles/theme';

const EmptyComment = () => {
  return (
    <View style={styles.container}>
      <DashedThunder />
      <View style={styles.textWrap}>
        <Text style={styles.title}>아직 보낸 잔소리가 없어요!</Text>
        <Text style={styles.description}>멘트 변경 필요</Text>
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
    gap: 12,
  },
  textWrap: {
    alignItems: 'center',
    gap: 4,
  },
  title: { ...theme.TYPOGRAPHY.TITLE_3, color: theme.COLORS.GRAY_SCALE.GRAY_50 },
  description: { ...theme.TYPOGRAPHY.CAPTION1_BASIC, color: theme.COLORS.GRAY_SCALE.GRAY_50 },
});

export { EmptyComment };
