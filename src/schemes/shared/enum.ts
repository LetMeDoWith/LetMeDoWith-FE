import { z } from 'zod';

const SuccessStatusCodeEnum = z.enum(['S100', 'S101', 'S102', 'S103']);

const ErrorStatusCodeEnum = z.enum([
  'E200',
  'E201',
  'E210',
  'E211',
  'E212',
  'E213',
  'E214',
  'E215',
  'E216',
  'E217',
  'E300',
  'E301',
  'E302',
  'E303',
  'E304',
  'E305',
  'E306',
  'E400',
  'E510',
]);

const StatusCodeEnum = z.union([SuccessStatusCodeEnum, ErrorStatusCodeEnum]);

export { SuccessStatusCodeEnum, ErrorStatusCodeEnum, StatusCodeEnum };
