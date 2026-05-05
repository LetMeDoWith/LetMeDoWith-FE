import { apiClient } from 'services/apiClient';
import { FEEDBACK_API } from 'services/urls';
import type { PageRequestSchemeType } from 'types/shared/scheme/api';
import type {
  fetchSentFeedbacksResponseSchemeType,
  fetchReceivedFeedbacksResponseSchemeType,
  fetchFeedbackTemplatesResponseSchemeType,
} from 'types/feedback/scheme/api';
import type { LanguageCodeType } from 'constants/shared';

const fetchSentFeedbacks = async (params?: PageRequestSchemeType): Promise<fetchSentFeedbacksResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchSentFeedbacksResponseSchemeType>(FEEDBACK_API.SEND, { params });
    return result.data;
  } catch (e) {
    throw e;
  }
};

const fetchReceivedFeedbacks = async (
  params?: PageRequestSchemeType,
): Promise<fetchReceivedFeedbacksResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchReceivedFeedbacksResponseSchemeType>(FEEDBACK_API.RECEIVED, { params });
    return result.data;
  } catch (e) {
    throw e;
  }
};

const fetchFeedbackTemplates = async (
  language: LanguageCodeType,
): Promise<fetchFeedbackTemplatesResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchFeedbackTemplatesResponseSchemeType>(FEEDBACK_API.TEMPLATES, {
      params: { language },
    });
    return result.data;
  } catch (e) {
    throw e;
  }
};

export { fetchSentFeedbacks, fetchReceivedFeedbacks, fetchFeedbackTemplates };
