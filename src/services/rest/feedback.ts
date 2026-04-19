import { apiClient } from 'services/apiClient';
import { FEEDBACK_API } from 'services/urls';
import type { PageRequestSchemeType } from 'types/shared/scheme/api';
import type { fetchSendFeedbacksResponseSchemeType } from 'types/feedback/scheme/api';

const fetchSendFeedbacks = async (params?: PageRequestSchemeType): Promise<fetchSendFeedbacksResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchSendFeedbacksResponseSchemeType>(FEEDBACK_API.SEND, { params });
    return result.data;
  } catch (e) {
    throw e;
  }
};

const fetchReceivedFeedbacks = async (
  params?: PageRequestSchemeType,
): Promise<fetchSendFeedbacksResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchSendFeedbacksResponseSchemeType>(FEEDBACK_API.RECEIVED, { params });
    return result.data;
  } catch (e) {
    throw e;
  }
};

export { fetchSendFeedbacks, fetchReceivedFeedbacks };
