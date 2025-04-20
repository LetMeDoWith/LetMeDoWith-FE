import React, { forwardRef, PropsWithChildren, useCallback, useImperativeHandle, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop';

import { theme } from 'styles/theme';
import { CancelIcon } from 'components/common/icons/CancelIcon';

interface Props {
  title: string;
  snapPoints: string[];
  buttonConfig?: {
    title: string;
    isDisabled: boolean;
  };
  handleCloseButton?: () => void;
  handleButtonSubmit?: () => void;
  onDismiss?: () => void;
}

const BottomSheet = forwardRef((props: PropsWithChildren<Props>, ref) => {
  const { title, buttonConfig, handleCloseButton, handleButtonSubmit, onDismiss, snapPoints, children } = props;

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handleClose = useCallback(() => {
    if (handleCloseButton) {
      handleCloseButton();
    }
    bottomSheetModalRef.current?.dismiss();
  }, [handleCloseButton]);
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="none" {...props} />
    ),
    [],
  );

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetModalRef.current?.present(),
    dismiss: () => bottomSheetModalRef.current?.dismiss(),
  }));

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      handleComponent={null}
      onDismiss={onDismiss}
    >
      <BottomSheetView style={styles.container}>
        <View>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={handleClose}>
              <CancelIcon />
            </Pressable>
          </View>
          {children}
        </View>
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
      </BottomSheetView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: theme.TYPOGRAPHY.HEADER_1,
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
