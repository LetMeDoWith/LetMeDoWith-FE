import { z } from 'zod';

const ProviderEnum = z.enum(['GOOGLE', 'KAKAO', 'APPLE']).describe('소셜로그인 기능 제공자');

export { ProviderEnum };
