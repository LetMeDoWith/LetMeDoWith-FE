import { z } from 'zod';

import { StatusCodeEnum } from 'schemes/shared/enum';

const BaseResponseScheme = z.object({
  statusCode: StatusCodeEnum,
  message: z.string(),
});

const EmptyDataResponseScheme = BaseResponseScheme.extend({
  data: z.object({}),
});

const PageRequestScheme = z.object({
  page: z.number().optional().describe('페이지 인덱스'),
  size: z.number().optional().describe('페이지 크기'),
});

const BasePageResponseScheme = BaseResponseScheme.extend({
  page: z.number().describe('현재 페이지'),
  size: z.number().describe('페이지 크기'),
  totalPage: z.number().describe('전체 페이지 수'),
  totalCount: z.number().describe('전체 개수'),
});

export { BaseResponseScheme, EmptyDataResponseScheme, PageRequestScheme, BasePageResponseScheme };
