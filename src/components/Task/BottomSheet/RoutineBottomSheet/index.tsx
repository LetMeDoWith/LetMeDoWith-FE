import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';

import { BottomSheet } from 'components/common/BottomSheet';
import type { TaskModeType } from 'types/shared';
import { RoutineForm, RoutineFormRefMethod } from 'components/Task/Form/Routine';
import { useFormContext } from 'react-hook-form';
import type { taskFormSchemeType } from 'types/task/scheme/api';

interface Props {
  taskMode: TaskModeType | null;
  navigation: any;
}

const RoutineBottomSheet = forwardRef<BottomSheetModalMethods, Props>(({ navigation, taskMode }, ref) => {
  const { setValue, watch, formState } = useFormContext<taskFormSchemeType>();
  const innerRef = useRef<BottomSheetModalMethods>(null);
  const formRef = useRef<RoutineFormRefMethod>(null);

  const [isSubmitValid, setIsSubmitValid] = useState(false);

  const handleValidationChange = useCallback((valid: boolean) => {
    setIsSubmitValid(valid);
  }, []);

  const closeBottomSheet = () => innerRef.current?.close();

  useImperativeHandle(ref, () => innerRef.current!);

  return (
    <BottomSheet
      ref={innerRef}
      title="루틴 등록하기"
      buttonConfig={{ title: '등록하기', isDisabled: !isSubmitValid }}
      snapPoints={['90%']}
      // 달력 가로 스와이프·세로 스크롤이 시트 팬 제스처와 충돌하지 않도록 콘텐츠 팬 제스처를 끈다.
      enableContentPanningGesture={false}
      // 루틴은 입력 도중 실수로 닫히면 작성 내용을 잃으므로 닫기 버튼으로만 닫는다.
      enablePanDownToClose={false}
      handleCloseButton={() => formRef.current?.handleCloseButton()}
      handleButtonSubmit={() => formRef.current?.handleSubmit()}
    >
      <RoutineForm
        ref={formRef}
        navigation={navigation}
        taskMode={taskMode}
        closeBottomSheet={closeBottomSheet}
        setValue={setValue}
        watch={watch}
        formState={formState}
        handleValidationChange={handleValidationChange}
      />
    </BottomSheet>
  );
});

export { RoutineBottomSheet };
