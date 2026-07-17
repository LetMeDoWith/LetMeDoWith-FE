import React, {
  forwardRef,
  PropsWithChildren,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { BackHandler, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';

import { theme } from 'styles/theme';
import { CancelIcon } from 'components/common/icons/CancelIcon';
import { BottomSheetBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';
import { isAos } from 'utils/device';

interface Props {
  title: string;
  snapPoints: string[];
  description?: string;
  enablePanDownToClose?: boolean;
  // 콘텐츠 위 드래그로 시트를 움직이는 제스처. 시트 안에 가로 스크롤(예: 달력 스와이프)이 있을 때 끄면 제스처 충돌을 막는다.
  enableContentPanningGesture?: boolean;
  useScrollView?: boolean;
  buttonConfig?: {
    title: string;
    isDisabled: boolean;
  };
  handleCloseButton?: () => void;
  handleButtonSubmit?: () => void;
  onChange?: (isOpen: boolean) => void;
  onDismiss?: () => void;
}

const BottomSheet = forwardRef<BottomSheetModalMethods, PropsWithChildren<Props>>((props, ref) => {
  const {
    title,
    description,
    enablePanDownToClose = false,
    enableContentPanningGesture = true,
    useScrollView = true,
    buttonConfig,
    handleCloseButton,
    handleButtonSubmit,
    onChange: onChangeCallback,
    onDismiss,
    snapPoints,
    children,
  } = props;

  const innerRef = useRef<BottomSheetModalMethods>(null);
  const [isOpen, setIsOpen] = useState(false);

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

  const handleSheetChanges = useCallback(
    (index: number) => {
      const open = index >= 0;
      setIsOpen(open);
      onChangeCallback?.(open);
    },
    [onChangeCallback],
  );

  // AOS 뒤로가기 버튼 클릭 시, 바텀 시트 닫힘 처리
  useEffect(() => {
    if (!isAos) {
      return;
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isOpen) {
        innerRef.current?.dismiss();
        return true; // 이벤트 소비 (기본 동작 방지)
      }
      return false; // 기본 동작 실행 (앱 종료 또는 이전 화면)
    });

    return () => backHandler.remove();
  }, [isOpen]);

  useImperativeHandle(ref, () => {
    return new Proxy({} as BottomSheetModalMethods, {
      get(_target, prop: keyof BottomSheetModalMethods) {
        if (prop === 'present') {
          return () => {
            // 바텀 시트 노출 시 가상 키보드 숨김 처리
            Keyboard.dismiss();
            innerRef.current?.present();
          };
        }
        const api = innerRef.current;
        const value = api?.[prop];
        return typeof value === 'function' ? value.bind(api) : value;
      },
    });
  });

  return (
    <BottomSheetModal
      ref={innerRef}
      snapPoints={snapPoints}
      enablePanDownToClose={enablePanDownToClose}
      enableContentPanningGesture={enableContentPanningGesture}
      backdropComponent={renderBackdrop}
      handleComponent={
        enablePanDownToClose
          ? () => (
              <View style={styles.handleContainer}>
                <View style={styles.handle} />
              </View>
            )
          : null
      }
      onChange={handleSheetChanges}
      onDismiss={onDismiss}
    >
      <View style={[styles.container, enablePanDownToClose && styles.containerWithHandle]}>
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
        {useScrollView ? (
          <BottomSheetScrollView showsVerticalScrollIndicator={false}>{children}</BottomSheetScrollView>
        ) : (
          children
        )}
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
  containerWithHandle: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_80,
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
