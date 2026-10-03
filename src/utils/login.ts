import { captureHandledError } from 'utils/sentry';
import { showSnackbar, SNACKBAR_TYPE } from 'stores/snackbarStore';
import type { ProviderEnumType } from 'types/auth/scheme/enum';

/*
 * 소셜 로그인 실패 공통 처리. 로그인 버튼들이 에러를 catch하면 SDK 자동 수집에서 빠지고
 * 사용자는 버튼을 눌러도 반응이 없어 보인다 — 실패를 보고하고 화면에 안내한다.
 * 사용자가 직접 취소한 경우는 실패가 아니므로 호출하지 않는다(취소 판별은 각 버튼이 SDK 기준으로 한다).
 */
const LOGIN_FAILED_MESSAGE = '로그인에 실패했어요. 다시 시도해 주세요.';

const reportLoginFailure = (provider: ProviderEnumType, error: unknown) => {
  captureHandledError(error, `login.${provider.toLowerCase()}`);
  showSnackbar(LOGIN_FAILED_MESSAGE, { type: SNACKBAR_TYPE.ERROR });
};

/*
 * 카카오 SDK는 취소를 에러 코드 없이 메시지로만 알린다.
 * Android: "user cancelled." / iOS: "... has been canceled by user."
 */
const isKakaoLoginCancelled = (error: unknown) => error instanceof Error && /cancell?ed/i.test(error.message);

export { reportLoginFailure, isKakaoLoginCancelled };
