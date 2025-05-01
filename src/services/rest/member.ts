import { MEMBER_API } from 'services/urls';
import { apiClient } from 'services/apiClient';
import type { validNicknameRequestSchemeType, validNicknameResponseSchemeType } from 'types/member/scheme/api';

const validNickname = async (payload: validNicknameRequestSchemeType): Promise<validNicknameResponseSchemeType> => {
  try {
    const result = await apiClient.post<validNicknameResponseSchemeType>(MEMBER_API.VALID_NICKNAME, payload);
    return result.data;
  } catch (e) {
    throw e;
  }
};

export { validNickname };
