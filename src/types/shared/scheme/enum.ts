import { z } from 'zod';

import { ErrorStatusCodeEnum, StatusCodeEnum, SuccessStatusCodeEnum } from 'schemes/shared/enum';

type SuccessStatusCodeType = z.infer<typeof SuccessStatusCodeEnum>;
type ErrorStatusCodeEnumType = z.infer<typeof ErrorStatusCodeEnum>;
type StatusCodeEnumType = z.infer<typeof StatusCodeEnum>;

export type { SuccessStatusCodeType, ErrorStatusCodeEnumType, StatusCodeEnumType };
