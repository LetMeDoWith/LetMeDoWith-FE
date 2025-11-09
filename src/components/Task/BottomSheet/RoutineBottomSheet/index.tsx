import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';

import { BottomSheet } from 'components/common/BottomSheet';
import type { TaskModeType } from 'types/shared';
import { RoutineForm, RoutineFormRefMethod } from 'components/Task/Form/Routine';
import { useFormContext } from 'react-hook-form';
import type { taskFormSchemeType } from 'types/task/scheme/api';

interface Props {
  taskMode: TaskModeType | null;
}

const RoutineBottomSheet = forwardRef<BottomSheetModalMethods, Props>(({ taskMode }, ref) => {
  const { setValue, watch } = useFormContext<taskFormSchemeType>();
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
      handleCloseButton={formRef.current?.handleCloseButton}
      handleButtonSubmit={formRef.current?.handleSubmit}
    >
      <RoutineForm
        ref={formRef}
        taskMode={taskMode}
        closeBottomSheet={closeBottomSheet}
        setValue={setValue}
        watch={watch}
        handleValidationChange={handleValidationChange}
      />
    </BottomSheet>
  );
});

export { RoutineBottomSheet };
