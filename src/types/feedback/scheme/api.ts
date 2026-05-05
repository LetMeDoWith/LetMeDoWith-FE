import { z } from 'zod';

import {
  taskFeedbackTemplateScheme,
  sentFeedbackScheme,
  receivedFeedbackScheme,
  fetchSentFeedbacksResponseScheme,
  fetchReceivedFeedbacksResponseScheme,
  fetchFeedbackTemplatesResponseScheme,
} from 'schemes/feedback/api';

type taskFeedbackTemplateSchemeType = z.infer<typeof taskFeedbackTemplateScheme>;
type sentFeedbackSchemeType = z.infer<typeof sentFeedbackScheme>;
type receivedFeedbackSchemeType = z.infer<typeof receivedFeedbackScheme>;
type fetchSentFeedbacksResponseSchemeType = z.infer<typeof fetchSentFeedbacksResponseScheme>;
type fetchReceivedFeedbacksResponseSchemeType = z.infer<typeof fetchReceivedFeedbacksResponseScheme>;
type fetchFeedbackTemplatesResponseSchemeType = z.infer<typeof fetchFeedbackTemplatesResponseScheme>;

export type {
  taskFeedbackTemplateSchemeType,
  sentFeedbackSchemeType,
  receivedFeedbackSchemeType,
  fetchSentFeedbacksResponseSchemeType,
  fetchReceivedFeedbacksResponseSchemeType,
  fetchFeedbackTemplatesResponseSchemeType,
};
