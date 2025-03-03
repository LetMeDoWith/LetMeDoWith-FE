import { Image, StyleSheet, Text, View } from 'react-native';

import { theme } from 'styles/theme';

const Comment = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={{
          uri: 'https://ichef.bbci.co.uk/news/1536/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg.webp',
        }}
      />
      <View style={styles.content}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>잔소리 메세지가 표시됩니다.</Text>
          <Text style={styles.description}>운동+상체루틴/인터벌 20분</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Text style={styles.info}>$사용자닉네임님$</Text>
          <Text style={styles.info}>•</Text>
          <Text style={styles.info}>1분전</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    flexDirection: 'row',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.COLORS.GRAY_SCALE.GRAY_95,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 40,
  },
  content: {
    gap: 12,
  },
  titleWrap: {
    gap: 8,
  },
  title: theme.TYPOGRAPHY.BODY_1,
  description: { ...theme.TYPOGRAPHY.BODY_2, color: theme.COLORS.GRAY_SCALE.GRAY_40 },
  info: { ...theme.TYPOGRAPHY.CAPTION1_BASIC, color: theme.COLORS.GRAY_SCALE.GRAY_70 },
});

export { Comment };
