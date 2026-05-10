import type { ApiError } from 'services/apiClient';
import { useQuery } from '@tanstack/react-query';

import { FEEDBACK_QUERY_KEY } from 'constants/queries';
import { LANGUAGE_CODE } from 'constants/shared';
import { fetchFeedbackTemplates } from 'services/rest/feedback';
import type {
  fetchFeedbackTemplatesResponseSchemeType,
  taskFeedbackTemplateSchemeType,
} from 'types/feedback/scheme/api';

const useFetchFeedbackTemplates = () =>
  useQuery<fetchFeedbackTemplatesResponseSchemeType, ApiError, taskFeedbackTemplateSchemeType[]>({
    queryKey: FEEDBACK_QUERY_KEY.TEMPLATES,
    queryFn: () => fetchFeedbackTemplates(LANGUAGE_CODE.KR),
    select: data => data.data.templates,
  });

export { useFetchFeedbackTemplates };
