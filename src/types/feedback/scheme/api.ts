import { z } from 'zod';

import { taskFeedbackTemplateScheme, sendFeedbackScheme, fetchSendFeedbacksResponseScheme } from 'schemes/feedback/api';

type taskFeedbackTemplateSchemeType = z.infer<typeof taskFeedbackTemplateScheme>;
type sendFeedbackSchemeType = z.infer<typeof sendFeedbackScheme>;
type fetchSendFeedbacksResponseSchemeType = z.infer<typeof fetchSendFeedbacksResponseScheme>;

export type { taskFeedbackTemplateSchemeType, sendFeedbackSchemeType, fetchSendFeedbacksResponseSchemeType };
