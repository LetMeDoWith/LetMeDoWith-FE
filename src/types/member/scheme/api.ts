import { z } from 'zod';

import { validNicknameRequestScheme, validNicknameResponseScheme } from 'schemes/member/api';

type validNicknameRequestSchemeType = z.infer<typeof validNicknameRequestScheme>;
type validNicknameResponseSchemeType = z.infer<typeof validNicknameResponseScheme>;

export type { validNicknameRequestSchemeType, validNicknameResponseSchemeType };
