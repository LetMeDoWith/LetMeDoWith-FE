import React, { forwardRef, RefObject, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFormContext } from 'react-hook-form';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';

import { theme } from 'styles/theme';
import { BottomSheet } from 'components/common/BottomSheet';

type TaskCategory = { id: number; name: string };

// TODO: Task 카테고리 API 연동
const MOCK_CATEGORY_LIST = [
  { id: 1, name: '카테고리1' },
  { id: 2, name: '카테고리2' },
  { id: 3, name: '카테고리3' },
  { id: 4, name: '카테고리4' },
  { id: 5, name: '카테고리5' },
  { id: 6, name: '카테고리6' },
  { id: 7, name: '카테고리7' },
  { id: 8, name: '카테고리8' },
];

interface Props {
  taskCategoryId: number;
  prevSelectedCategory?: TaskCategory;
}

const CategoryBottomSheet = forwardRef<BottomSheetModalMethods, Props>(
  ({ taskCategoryId, prevSelectedCategory }, ref) => {
    const { setValue } = useFormContext();
    const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);
    const innerRef = useRef<BottomSheetModalMethods>(null);

    const onDismissCategoryBottomSheet = useCallback(() => {
      if (taskCategoryId === null) {
        setSelectedCategory(null);
        return;
      }

      if (!prevSelectedCategory) {
        return;
      }

      setSelectedCategory(prevSelectedCategory);
    }, [taskCategoryId, prevSelectedCategory]);

    const handleCategory = useCallback(
      ({ id, name }: TaskCategory) =>
        () => {
          setSelectedCategory({ id, name });
        },
      [],
    );

    const handleCategoryBottomSheetButton = useCallback(() => {
      setValue('taskCategoryId', selectedCategory?.id);
      innerRef.current?.dismiss();
    }, [selectedCategory]);

    useImperativeHandle(ref, () => innerRef.current!);

    return (
      <BottomSheet
        ref={innerRef}
        title="카테고리"
        buttonConfig={{ title: '저장하기', isDisabled: selectedCategory === null }}
        snapPoints={['60%']}
        onDismiss={onDismissCategoryBottomSheet}
        handleButtonSubmit={handleCategoryBottomSheetButton}
      >
        <View style={styles.bottomSheetContentContainer}>
          {MOCK_CATEGORY_LIST.map(({ id, name }) => (
            <Pressable
              key={id}
              style={[
                styles.categoryButton,
                selectedCategory?.id === id && {
                  borderColor: theme.COLORS.PRIMARY.RED_60,
                  backgroundColor: theme.COLORS.PRIMARY.RED_98,
                },
              ]}
              onPress={handleCategory({ id, name })}
            >
              <Text
                style={[
                  styles.categoryButtonName,
                  selectedCategory?.id === id && { color: theme.COLORS.PRIMARY.RED_60 },
                ]}
              >
                {name}
              </Text>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  bottomSheetContentContainer: {
    paddingVertical: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: 12,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
    borderRadius: 8,
  },
  categoryButtonName: theme.TYPOGRAPHY.BODY_1,
});

export { CategoryBottomSheet };
