import { StyleSheet, Text, View } from 'react-native';

import { DashedThunder } from 'components/common/icons/DashedThunder';
import { theme } from 'styles/theme';

type EmptyCommentType = 'SEND' | 'RECEIVE';

interface Props {
  type: EmptyCommentType;
}

const EMPTY_COMMENT_TEXT: Record<EmptyCommentType, { title: string; descriptions: string[] }> = {
  SEND: {
    title: '아직 보낸 잔소리가 없어요!',
    descriptions: ['멘트 변경 필요'],
  },
  RECEIVE: {
    title: '아직 받은 잔소리가 없어요!',
    descriptions: ['내가 먼저 잔소리를 보내면', '잔소리 받을 확률 UP!'],
  },
};

const EmptyComment = ({ type }: Props) => {
  const { title, descriptions } = EMPTY_COMMENT_TEXT[type];

  return (
    <View style={styles.container}>
      <DashedThunder />
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {descriptions.map(desc => (
          <Text key={desc} style={styles.description}>
            {desc}
          </Text>
        ))}
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
