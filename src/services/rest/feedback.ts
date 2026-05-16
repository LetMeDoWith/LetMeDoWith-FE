import { apiClient } from 'services/apiClient';
import { FEEDBACK_API } from 'services/urls';
import type { PageRequestSchemeType } from 'types/shared/scheme/api';
import type {
  fetchSentFeedbacksResponseSchemeType,
  fetchReceivedFeedbacksResponseSchemeType,
  fetchFeedbackTemplatesResponseSchemeType,
  fetchFeedbackAggregatesResponseSchemeType,
  fetchDowithTaskFeedbacksResponseSchemeType,
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

interface CreateDowithFeedbackRequest {
  dowithTaskId: number;
  taskFeedbackTemplateId: number;
}

const createDowithFeedback = async (params: CreateDowithFeedbackRequest) => {
  try {
    const result = await apiClient.post(FEEDBACK_API.BASE, params);
    return result.data;
  } catch (e) {
    throw e;
  }
};

const fetchDowithTaskFeedbackAggregates = async (
  dowithTaskId: number,
): Promise<fetchFeedbackAggregatesResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchFeedbackAggregatesResponseSchemeType>(
      `${FEEDBACK_API.DOWITH_TASK_FEEDBACKS}/${dowithTaskId}/aggregate`,
    );
    return result.data;
  } catch (e) {
    throw e;
  }
};

interface FetchDowithTaskFeedbacksParams extends PageRequestSchemeType {
  feedbackTemplateId?: number;
}

const fetchDowithTaskFeedbacks = async (
  dowithTaskId: number,
  params?: FetchDowithTaskFeedbacksParams,
): Promise<fetchDowithTaskFeedbacksResponseSchemeType> => {
  try {
    const result = await apiClient.get<fetchDowithTaskFeedbacksResponseSchemeType>(
      `${FEEDBACK_API.DOWITH_TASK_FEEDBACKS}/${dowithTaskId}`,
      { params },
    );
    return result.data;
  } catch (e) {
    throw e;
  }
};

export {
  fetchSentFeedbacks,
  fetchReceivedFeedbacks,
  fetchFeedbackTemplates,
  createDowithFeedback,
  fetchDowithTaskFeedbackAggregates,
  fetchDowithTaskFeedbacks,
};
