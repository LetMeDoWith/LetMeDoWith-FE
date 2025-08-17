import { z } from 'zod';

const SuccessStatusCodeEnum = z.enum(['S100', 'S101', 'S102', 'S103']);

const ErrorStatusCodeEnum = z.enum([
  'E100',
  'E201',
  'E210',
  'E211',
  'E212',
  'E213',
  'E214',
  'E215',
  'E216',
  'E217',
  'E218',
  'E219',
  'E220',
  'E221',
  'E222',
  'E223',
  'E230',
  'E231',
  'E246',
  'E300',
  'E301',
  'E302',
  'E303',
  'E304',
  'E305',
  'E306',
  'E307',
  'E308',
  'E309',
  'E400',
  'E401',
  'E510',
]);

const StatusCodeEnum = z.enum([...SuccessStatusCodeEnum.options, ...ErrorStatusCodeEnum.options] as const);

export { SuccessStatusCodeEnum, ErrorStatusCodeEnum, StatusCodeEnum };
