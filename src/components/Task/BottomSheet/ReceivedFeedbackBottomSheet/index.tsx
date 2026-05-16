import React, { forwardRef, useState } from 'react';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';

import { BottomSheet } from 'components/common/BottomSheet';
import { ReceivedFeedbackContent } from 'components/Feedback/ReceivedFeedbackContent';

interface Props {
  dowithTaskId: number;
}

const ReceivedFeedbackBottomSheet = forwardRef<BottomSheetModalMethods, Props>(({ dowithTaskId }, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDismiss = () => {
    setIsOpen(false);
  };

  return (
    <BottomSheet
      ref={ref}
      title="받은 잔소리"
      snapPoints={['60%', '80%']}
      enablePanDownToClose
      useScrollView={false}
      onChange={setIsOpen}
      onDismiss={handleDismiss}
    >
      <ReceivedFeedbackContent dowithTaskId={dowithTaskId} enabled={isOpen} ListComponent={BottomSheetFlatList} />
    </BottomSheet>
  );
});

export { ReceivedFeedbackBottomSheet };
