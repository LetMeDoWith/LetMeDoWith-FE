import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useFetchTaskCategoryList } from 'hooks/queries/task/useFetchTaskCategoryList';
import { theme } from 'styles/theme';

interface Props {
  /* 아직 확정하지 않은 선택값. 확인을 눌러야 폼에 반영된다. */
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

const CategoryStep = ({ selectedId, onSelect }: Props) => {
  const { data: taskCategoryList } = useFetchTaskCategoryList();

  return (
    <View style={styles.container}>
      {taskCategoryList?.map(({ id, emoji, title }) => {
        const isSelected = selectedId === id;

        return (
          <Pressable
            key={id}
            style={[styles.button, isSelected && styles.buttonSelected]}
            onPress={() => onSelect(isSelected ? null : id)}
          >
            <Text>{emoji}</Text>
            <Text style={[styles.buttonName, isSelected && styles.buttonNameSelected]}>{title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    width: '48%',
    borderWidth: 1,
    paddingVertical: 12,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
    borderRadius: 8,
  },
  buttonSelected: {
    borderColor: theme.COLORS.PRIMARY.RED_60,
    backgroundColor: theme.COLORS.PRIMARY.RED_98,
  },
  buttonName: theme.TYPOGRAPHY.BODY_1,
  buttonNameSelected: {
    color: theme.COLORS.PRIMARY.RED_60,
  },
});

export { CategoryStep };
