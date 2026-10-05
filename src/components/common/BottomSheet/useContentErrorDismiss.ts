import { useCallback, useRef, useState, type RefObject } from 'react';

import { showSnackbar, SNACKBAR_TYPE } from 'stores/snackbarStore';

/*
 * 시트 내용이 렌더 에러로 깨졌을 때 시트를 닫는다(수집은 SheetContentBoundary가 한다).
 *
 * gorhom 모달은 여는 애니메이션이 끝나 열림이 확정되기 전에는 dismiss()를 무시한다.
 * 열자마자 깨지면 첫 dismiss가 무시되어 빈 시트가 열린 채 남으므로,
 * 에러를 기억해 두었다가 열림이 확정되는 순간(onChange index >= 0) 다시 닫는다.
 * 닫히면(index -1) 내용이 언마운트되어 바운더리가 초기화되므로 에러 상태도 푼다.
 */
const useContentErrorDismiss = (sheetRef: RefObject<{ dismiss: () => void } | null>) => {
  const [hasContentError, setHasContentError] = useState(false);
  /* onChange는 렌더와 무관하게 동기 판단해야 해서 ref로도 둔다 */
  const hasContentErrorRef = useRef(false);

  const handleContentError = useCallback(() => {
    hasContentErrorRef.current = true;
    setHasContentError(true);
    showSnackbar('앗 잠시 문제가 생겼어요. 다시 시도해 주세요.', { type: SNACKBAR_TYPE.ERROR });
    sheetRef.current?.dismiss();
  }, [sheetRef]);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index < 0) {
        hasContentErrorRef.current = false;
        setHasContentError(false);
        return;
      }

      if (hasContentErrorRef.current) {
        sheetRef.current?.dismiss();
      }
    },
    [sheetRef],
  );

  return { hasContentError, handleContentError, handleSheetChange };
};

export { useContentErrorDismiss };
