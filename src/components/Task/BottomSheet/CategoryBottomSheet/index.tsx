import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFormContext } from 'react-hook-form';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';

import { theme } from 'styles/theme';
import { BottomSheet } from 'components/common/BottomSheet';
import { useFetchTaskCategoryList } from 'hooks/queries/task/useFetchTaskCategoryList';

type TaskCategory = { id: number; title: string };

interface Props {
  taskCategoryId: number | null;
  prevSelectedCategory?: TaskCategory;
}

const CategoryBottomSheet = forwardRef<BottomSheetModalMethods, Props>(
  ({ taskCategoryId, prevSelectedCategory }, ref) => {
    const { setValue } = useFormContext();
    const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);
    const innerRef = useRef<BottomSheetModalMethods>(null);
    const { data: taskCategoryList } = useFetchTaskCategoryList();

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
      ({ id, title }: TaskCategory) =>
        () => {
          setSelectedCategory({ id, title });
        },
      [],
    );

    const handleCategoryBottomSheetButton = useCallback(() => {
      setValue('taskCategoryId', selectedCategory?.id);
      innerRef.current?.dismiss();
    }, [selectedCategory?.id, setValue]);

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
          {taskCategoryList?.map(({ id, emoji, title }) => (
            <Pressable
              key={id}
              style={[
                styles.categoryButton,
                selectedCategory?.id === id && {
                  borderColor: theme.COLORS.PRIMARY.RED_60,
                  backgroundColor: theme.COLORS.PRIMARY.RED_98,
                },
              ]}
              onPress={handleCategory({ id, title })}
            >
              <Text>{emoji}</Text>
              <Text
                style={[
                  styles.categoryButtonName,
                  selectedCategory?.id === id && { color: theme.COLORS.PRIMARY.RED_60 },
                ]}
              >
                {title}
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
  categoryButtonName: theme.TYPOGRAPHY.BODY_1,
});

export { CategoryBottomSheet };
