import React, { useCallback, useMemo, useState } from 'react';

import { SuccessTaskImageDetail } from 'components/Feed/SuccessTaskImageDetail';
import type { successDowithTaskSchemeType } from 'types/task/scheme/api';

const useSuccessTaskImageDetail = (data: successDowithTaskSchemeType[]) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openDetail = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const detailModal = useMemo(
    () => (
      <SuccessTaskImageDetail
        visible={selectedIndex !== null}
        data={data}
        initialIndex={selectedIndex ?? 0}
        onClose={closeDetail}
      />
    ),
    [selectedIndex, data, closeDetail],
  );

  return { openDetail, detailModal };
};

export { useSuccessTaskImageDetail };
