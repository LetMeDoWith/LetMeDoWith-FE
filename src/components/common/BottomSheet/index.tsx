import React, {
  forwardRef,
  PropsWithChildren,
  type ReactElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { BackHandler, Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetModalProps } from '@gorhom/bottom-sheet';

import { theme } from 'styles/theme';
import { CancelIcon } from 'components/common/icons/CancelIcon';
import { BottomSheetBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';
import { isAos } from 'utils/device';

interface Props {
  title: string;
  /* 퍼센트 문자열이 기본이지만, 콘텐츠 높이에 맞춰야 하는 시트는 px 숫자도 넘길 수 있다 */
  snapPoints: (string | number)[];
  description?: string;
  /*
   * 기본 헤더(제목 + 닫기) 대신 그릴 헤더. 태스크 등록 시트처럼 제목 자리에
   * 모드 선택 같은 다른 UI가 들어가는 경우에만 넘긴다. 닫기 버튼도 직접 그려야 한다.
   */
  headerComponent?: ReactElement;
  /* 콘텐츠와 시트 아래 끝 사이 여백. 확인 버튼이 없는 시트는 기본값보다 좁게 쓰기도 한다. */
  contentBottomInset?: number;
  /* 시트 안에 입력이 있어 키보드를 피해야 할 때만 넘긴다(기본값은 라이브러리 동작 유지) */
  keyboardBehavior?: BottomSheetModalProps['keyboardBehavior'];
  keyboardBlurBehavior?: BottomSheetModalProps['keyboardBlurBehavior'];
  androidKeyboardInputMode?: BottomSheetModalProps['android_keyboardInputMode'];
  /*
   * 사용자가 닫기 버튼 외의 방법으로 시트를 닫을 수 있는지. 아래로 내리는 제스처와
   * 딤드 영역 탭을 함께 제어한다(둘 다 "임의로 닫기"라는 같은 성격이라 나누지 않는다).
   * 끄면 닫기 버튼으로만 닫힌다 — 루틴 등록처럼 입력 중 실수로 닫히면 안 되는 시트에 쓴다.
   */
  enablePanDownToClose?: boolean;
  // 콘텐츠 위 드래그로 시트를 움직이는 제스처. 시트 안에 가로 스크롤(예: 달력 스와이프)이 있을 때 끄면 제스처 충돌을 막는다.
  enableContentPanningGesture?: boolean;
  useScrollView?: boolean;
  buttonConfig?: {
    title: string;
    isDisabled: boolean;
    /*
     * FILLED(기본) — 브랜드 색으로 채운 확정 버튼.
     * OUTLINED — 테두리만 있는 버튼. 등록 시트의 스텝처럼 "확정"이 아니라
     * 이전 화면으로 돌아가는 성격의 확인에 쓴다.
     */
    variant?: 'FILLED' | 'OUTLINED';
  };
  handleCloseButton?: () => void;
  handleButtonSubmit?: () => void;
  onChange?: (isOpen: boolean) => void;
  onDismiss?: () => void;
}

/*
 * 렌더 안에서 정의하면 시트 내부 상태가 바뀔 때마다 새 컴포넌트 타입이 되어
 * 핸들이 통째로 다시 마운트된다. 그때 시트가 재측정되면서 iOS에서 닫혀 버린다.
 */
const Handle = () => (
  <View style={styles.handleContainer}>
    <View style={styles.handle} />
  </View>
);

const renderButton = (config: NonNullable<Props['buttonConfig']>, onPress?: () => void) => {
  const { title, isDisabled, variant = 'FILLED' } = config;
  const isOutlined = variant === 'OUTLINED';

  return (
    <Pressable
      style={[
        styles.button,
        isOutlined
          ? [styles.outlinedButton, isDisabled && styles.outlinedButtonDisabled]
          : { backgroundColor: isDisabled ? theme.COLORS.PRIMARY.RED_92 : theme.COLORS.PRIMARY.RED_60 },
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      <Text
        style={[
          styles.buttonTitle,
          isOutlined && (isDisabled ? styles.outlinedButtonTitleDisabled : styles.outlinedButtonTitle),
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};

const BottomSheet = forwardRef<BottomSheetModalMethods, PropsWithChildren<Props>>((props, ref) => {
  const {
    title,
    description,
    headerComponent,
    contentBottomInset,
    keyboardBehavior,
    keyboardBlurBehavior,
    androidKeyboardInputMode,
    enablePanDownToClose = true,
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
      <BottomSheetBackdrop
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior={enablePanDownToClose ? 'close' : 'none'}
        {...props}
      />
    ),
    [enablePanDownToClose],
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
      keyboardBehavior={keyboardBehavior}
      keyboardBlurBehavior={keyboardBlurBehavior}
      android_keyboardInputMode={androidKeyboardInputMode}
      backdropComponent={renderBackdrop}
      /*
       * 제스처로 닫을 수 있는 시트에는 반드시 핸들 바를 노출한다(정책).
       * 어포던스 없이 제스처만 열어두면 사용자가 닫을 수 있다는 걸 알 수 없다.
       */
      handleComponent={enablePanDownToClose ? Handle : null}
      onChange={handleSheetChanges}
      onDismiss={onDismiss}
    >
      <View
        style={[
          styles.container,
          enablePanDownToClose && styles.containerWithHandle,
          contentBottomInset !== undefined && { paddingBottom: contentBottomInset },
        ]}
      >
        <BottomSheetView style={styles.header}>
          {headerComponent ?? (
            <>
              <View style={styles.headerTitleWrap}>
                <Text style={styles.title}>{title}</Text>
                <Pressable onPress={handleClose}>
                  <CancelIcon />
                </Pressable>
              </View>
              {description && (
                <Text style={[styles.description, { color: theme.COLORS.GRAY_SCALE.GRAY_50 }]}>{description}</Text>
              )}
            </>
          )}
        </BottomSheetView>
        {useScrollView ? (
          /*
           * keyboardShouldPersistTaps: 기본값(never)이면 키보드가 떠 있을 때 첫 탭이
           * 키보드를 내리는 데만 쓰여 버튼이 눌리지 않는다. handled로 두면 탭이 그대로 전달된다.
           */
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            /*
             * flex를 주지 않으면 높이 고정 컨테이너 안에서 스크롤뷰가 콘텐츠 높이만큼 부풀어
             * 아래 버튼과 겹친다. 남는 공간도 여기서 흡수해 아래 붙는 요소 위치가 일정해진다.
             */
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
          >
            {children}
          </BottomSheetScrollView>
        ) : (
          children
        )}
        {buttonConfig && renderButton(buttonConfig, handleButtonSubmit)}
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
  /*
   * 핸들 바가 상단 여백을 대신하므로 paddingTop만 걷어낸다.
   * 하단 여백은 유지해야 저장 버튼이 시트 끝에 붙지 않는다.
   */
  containerWithHandle: {
    paddingTop: 0,
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
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    ...theme.TYPOGRAPHY.BODY_1,
    color: theme.COLORS.DEFAULT.WHITE,
  },
  outlinedButton: {
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
    borderWidth: 1,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  outlinedButtonDisabled: {
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_98,
  },
  outlinedButtonTitle: {
    color: theme.COLORS.GRAY_SCALE.GRAY_10,
  },
  outlinedButtonTitleDisabled: {
    color: theme.COLORS.GRAY_SCALE.GRAY_80,
  },
});
