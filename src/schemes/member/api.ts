import { z } from 'zod';

import { BaseResponseScheme } from 'schemes/shared/api';

const validNicknameRequestScheme = z.object({
  nickname: z.string(),
});

const validNicknameResponseScheme = BaseResponseScheme.extend({
  data: z.string(),
});

export { validNicknameRequestScheme, validNicknameResponseScheme };
