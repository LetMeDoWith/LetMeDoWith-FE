import { z } from 'zod';

import { StatusCodeEnum } from 'schemes/shared/enum';

const BaseResponseScheme = z.object({
  statusCode: StatusCodeEnum,
  message: z.string(),
});

const EmptyDataResponseScheme = BaseResponseScheme.extend({
  data: z.object({}),
});

export { BaseResponseScheme, EmptyDataResponseScheme };
