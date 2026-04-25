import { apiClient } from 'services/apiClient';
import { FEEDBACK_API } from 'services/urls';
import type { PageRequestSchemeType } from 'types/shared/scheme/api';
import type {
  fetchSentFeedbacksResponseSchemeType,
  fetchReceivedFeedbacksResponseSchemeType,
} from 'types/feedback/scheme/api';

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

export { fetchSentFeedbacks, fetchReceivedFeedbacks };
