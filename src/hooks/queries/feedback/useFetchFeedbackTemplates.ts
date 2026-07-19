import { useEffect } from 'react';
import type { ApiError } from 'services/apiClient';
import { useQuery } from '@tanstack/react-query';

import { FEEDBACK_QUERY_KEY } from 'constants/queries';
import { LANGUAGE_CODE } from 'constants/shared';
import { fetchFeedbackTemplates } from 'services/rest/feedback';
import { preloadFeedbackSvgs } from 'utils/feedbackSvgCache';
import type {
  fetchFeedbackTemplatesResponseSchemeType,
  taskFeedbackTemplateSchemeType,
} from 'types/feedback/scheme/api';

const useFetchFeedbackTemplates = () => {
  const query = useQuery<fetchFeedbackTemplatesResponseSchemeType, ApiError, taskFeedbackTemplateSchemeType[]>({
    queryKey: FEEDBACK_QUERY_KEY.TEMPLATES,
    queryFn: () => fetchFeedbackTemplates(LANGUAGE_CODE.KR),
    select: data => data.data.templates,
    staleTime: Infinity,
  });

  // 템플릿 로드 시 SVG 이모지를 미리 fetch해 캐시 워밍(첫 렌더 지연 제거). 이미 캐시된 URL은 건너뜀.
  useEffect(() => {
    if (query.data) {
      preloadFeedbackSvgs(query.data.map(template => template.emojiUrl));
    }
  }, [query.data]);

  return query;
};

export { useFetchFeedbackTemplates };
