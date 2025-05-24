import { MEMBER_API } from 'services/urls';
import { apiClient } from 'services/apiClient';
import type {
  signUpRequestSchemeType,
  signUpResponseSchemeType,
  validNicknameRequestSchemeType,
  validNicknameResponseSchemeType,
} from 'types/member/scheme/api';

const validNickname = async (payload: validNicknameRequestSchemeType): Promise<validNicknameResponseSchemeType> => {
  try {
    const result = await apiClient.post<validNicknameResponseSchemeType>(MEMBER_API.VALID_NICKNAME, payload);
    return result.data;
  } catch (e) {
    throw e;
  }
};

const signUp = async (payload: signUpRequestSchemeType): Promise<signUpResponseSchemeType> => {
  try {
    const result = await apiClient.put<signUpResponseSchemeType>(MEMBER_API.SIGN_UP, payload);
    return result.data;
  } catch (e) {
    throw e;
  }
};

export { validNickname, signUp };
