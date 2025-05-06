import { Pressable, StyleSheet } from 'react-native';

import { ArrowLeft } from 'components/common/icons/ArrowIcon';

interface Props {
  onPress: () => void;
}

const BackButton = ({ onPress }: Props) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <ArrowLeft width={24} height={24} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 16,
  },
});

export { BackButton };
