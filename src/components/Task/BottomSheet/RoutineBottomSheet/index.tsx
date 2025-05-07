import { Text, View } from 'react-native';
import { BottomSheet } from 'components/common/BottomSheet';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';

const RoutineBottomSheet = forwardRef<BottomSheetModalMethods, unknown>((props, ref) => {
  const innerRef = useRef<BottomSheetModalMethods>(null);

  const handleDismiss = () => {};

  const handleSubmit = () => {};

  useImperativeHandle(ref, () => innerRef.current!);

  return (
    <BottomSheet
      ref={innerRef}
      title="루틴 등록하기"
      buttonConfig={{ title: '등록하기', isDisabled: false }}
      snapPoints={['90%']}
      onDismiss={handleDismiss}
      handleButtonSubmit={handleSubmit}
    >
      <View>
        <Text>hello</Text>
      </View>
    </BottomSheet>
  );
});

export { RoutineBottomSheet };
