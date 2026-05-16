import { z } from 'zod';

import {
  taskFeedbackTemplateScheme,
  sentFeedbackScheme,
  receivedFeedbackScheme,
  fetchSentFeedbacksResponseScheme,
  fetchReceivedFeedbacksResponseScheme,
  fetchFeedbackTemplatesResponseScheme,
  feedbackAggregateItemScheme,
  fetchFeedbackAggregatesResponseScheme,
  dowithTaskFeedbackScheme,
  fetchDowithTaskFeedbacksResponseScheme,
} from 'schemes/feedback/api';

type taskFeedbackTemplateSchemeType = z.infer<typeof taskFeedbackTemplateScheme>;
type sentFeedbackSchemeType = z.infer<typeof sentFeedbackScheme>;
type receivedFeedbackSchemeType = z.infer<typeof receivedFeedbackScheme>;
type fetchSentFeedbacksResponseSchemeType = z.infer<typeof fetchSentFeedbacksResponseScheme>;
type fetchReceivedFeedbacksResponseSchemeType = z.infer<typeof fetchReceivedFeedbacksResponseScheme>;
type fetchFeedbackTemplatesResponseSchemeType = z.infer<typeof fetchFeedbackTemplatesResponseScheme>;
type feedbackAggregateItemSchemeType = z.infer<typeof feedbackAggregateItemScheme>;
type fetchFeedbackAggregatesResponseSchemeType = z.infer<typeof fetchFeedbackAggregatesResponseScheme>;
type dowithTaskFeedbackSchemeType = z.infer<typeof dowithTaskFeedbackScheme>;
type fetchDowithTaskFeedbacksResponseSchemeType = z.infer<typeof fetchDowithTaskFeedbacksResponseScheme>;

export type {
  taskFeedbackTemplateSchemeType,
  sentFeedbackSchemeType,
  receivedFeedbackSchemeType,
  fetchSentFeedbacksResponseSchemeType,
  fetchReceivedFeedbacksResponseSchemeType,
  fetchFeedbackTemplatesResponseSchemeType,
  feedbackAggregateItemSchemeType,
  fetchFeedbackAggregatesResponseSchemeType,
  dowithTaskFeedbackSchemeType,
  fetchDowithTaskFeedbacksResponseSchemeType,
};
