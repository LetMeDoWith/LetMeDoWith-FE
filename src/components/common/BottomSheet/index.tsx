import React, { forwardRef, PropsWithChildren, useCallback, useImperativeHandle, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';

import { theme } from 'styles/theme';
import { CancelIcon } from 'components/common/icons/CancelIcon';
import { BottomSheetBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';

interface Props {
  title: string;
  snapPoints: string[];
  description?: string;
  buttonConfig?: {
    title: string;
    isDisabled: boolean;
  };
  handleCloseButton?: () => void;
  handleButtonSubmit?: () => void;
  onDismiss?: () => void;
}

const BottomSheet = forwardRef<BottomSheetModalMethods, PropsWithChildren<Props>>((props, ref) => {
  const { title, description, buttonConfig, handleCloseButton, handleButtonSubmit, onDismiss, snapPoints, children } =
    props;

  const innerRef = useRef<BottomSheetModalMethods>(null);
  const handleClose = useCallback(() => {
    if (handleCloseButton) {
      handleCloseButton();
    }
    innerRef.current?.dismiss();
  }, [handleCloseButton]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="none" {...props} />
    ),
    [],
  );

  useImperativeHandle(ref, () => innerRef.current!);

  return (
    <BottomSheetModal
      ref={innerRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleComponent={null}
      onDismiss={onDismiss}
    >
      <View style={styles.container}>
        <BottomSheetView style={styles.header}>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={handleClose}>
              <CancelIcon />
            </Pressable>
          </View>
          {description && (
            <Text style={[styles.description, { color: theme.COLORS.GRAY_SCALE.GRAY_50 }]}>{description}</Text>
          )}
        </BottomSheetView>
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>{children}</BottomSheetScrollView>
        {buttonConfig && (
          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: buttonConfig.isDisabled ? theme.COLORS.PRIMARY.RED_95 : theme.COLORS.PRIMARY.RED_60,
              },
            ]}
            onPress={handleButtonSubmit}
            disabled={buttonConfig.isDisabled}
          >
            <Text style={styles.buttonTitle}>{buttonConfig.title}</Text>
          </Pressable>
        )}
      </View>
    </BottomSheetModal>
  );
});

export { BottomSheet };

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 41,
    height: '100%',
    justifyContent: 'space-between',
  },
  header: { gap: 4 },
  headerTitleWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: theme.TYPOGRAPHY.TITLE_1,
  description: theme.TYPOGRAPHY.BODY_2,
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    backgroundColor: theme.COLORS.PRIMARY.RED_60,
  },
  buttonTitle: {
    fontSize: 16,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});
