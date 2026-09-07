import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';

import { BottomSheet } from 'components/common/BottomSheet';
import { RoutineSheetContent, type RoutineSheetContentRef } from 'components/Task/Form/Routine/SheetContent';
import type { TaskModeType } from 'types/shared';
import type { taskFormSchemeType } from 'types/task/scheme/api';

interface Props {
  taskMode: TaskModeType | null;
}

const RoutineBottomSheet = forwardRef<BottomSheetModalMethods, Props>(({ taskMode }, ref) => {
  const { setValue, watch } = useFormContext<taskFormSchemeType>();
  const innerRef = useRef<BottomSheetModalMethods>(null);
  const contentRef = useRef<RoutineSheetContentRef>(null);

  const closeBottomSheet = () => innerRef.current?.close();

  useImperativeHandle(ref, () => innerRef.current!);

  return (
    <BottomSheet
      ref={innerRef}
      title="루틴 등록하기"
      buttonConfig={{ title: '등록하기', isDisabled: false }}
      snapPoints={['90%']}
      // 달력 가로 스와이프·세로 스크롤이 시트 팬 제스처와 충돌하지 않도록 콘텐츠 팬 제스처를 끈다.
      enableContentPanningGesture={false}
      // 루틴은 입력 도중 실수로 닫히면 작성 내용을 잃으므로 닫기 버튼으로만 닫는다.
      enablePanDownToClose={false}
      handleCloseButton={() => contentRef.current?.handleCloseButton()}
      handleButtonSubmit={() => contentRef.current?.handleSubmit()}
    >
      <RoutineSheetContent
        ref={contentRef}
        taskMode={taskMode}
        setValue={setValue}
        watch={watch}
        closeBottomSheet={closeBottomSheet}
      />
    </BottomSheet>
  );
});

export { RoutineBottomSheet };
