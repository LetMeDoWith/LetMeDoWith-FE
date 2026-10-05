import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import type { ApiError } from 'services/apiClient';
import { FEEDBACK_QUERY_KEY } from 'constants/queries';
import { checkFeedback } from 'services/rest/feedback';
import type { EmptyDataResponseSchemeType } from 'types/shared/scheme/api';
import type { fetchReceivedFeedbacksResponseSchemeType } from 'types/feedback/scheme/api';

/*
 * 받은 잡도리 확인(읽음) 처리.
 * 성공하면 목록을 다시 받지 않고 캐시에서 그 항목만 확인으로 바꾼다 — 받은 잡도리 목록의 회색 처리와
 * 홈 "내 잡도리" 빨간 점이 같은 캐시를 보므로 함께 갱신된다(무한 스크롤 전 페이지 재요청을 피한다).
 */
const useCheckFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation<EmptyDataResponseSchemeType, ApiError, number>({
    mutationKey: FEEDBACK_QUERY_KEY.CHECK,
    mutationFn: checkFeedback,
    onSuccess: (_, feedbackId) => {
      queryClient.setQueryData<InfiniteData<fetchReceivedFeedbacksResponseSchemeType, number>>(
        FEEDBACK_QUERY_KEY.RECEIVED,
        prev =>
          prev && {
            ...prev,
            pages: prev.pages.map(page => ({
              ...page,
              data: {
                ...page.data,
                feedbacks: page.data.feedbacks.map(feedback =>
                  feedback.id === feedbackId ? { ...feedback, isChecked: true } : feedback,
                ),
              },
            })),
          },
      );
    },
  });
};

export { useCheckFeedback };
