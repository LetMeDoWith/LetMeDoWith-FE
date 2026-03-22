import { MEMBER_API } from 'services/urls';
import { apiClient } from 'services/apiClient';
import type { EmptyDataResponseSchemeType } from 'types/shared/scheme/api';
import type {
  notificationSettingsRequestSchemeType,
  signUpRequestSchemeType,
  signUpResponseSchemeType,
  updateMemberRequestSchemeType,
  validNicknameRequestSchemeType,
  validNicknameResponseSchemeType,
  profileImageUploadPresignedUrlRequestSchemeType,
  profileImageUploadPresignedUrlResponseSchemeType,
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

const updateMember = async (payload: updateMemberRequestSchemeType): Promise<EmptyDataResponseSchemeType> => {
  try {
    const result = await apiClient.patch<signUpResponseSchemeType>(MEMBER_API.BASE, payload);
    return result.data;
  } catch (e) {
    throw e;
  }
};

const deleteAccount = async (): Promise<EmptyDataResponseSchemeType> => {
  try {
    const result = await apiClient.delete<EmptyDataResponseSchemeType>(MEMBER_API.DELETE_ACCOUNT);
    return result.data;
  } catch (e) {
    throw e;
  }
};

const updateNotificationSettings = async (
  payload: notificationSettingsRequestSchemeType,
): Promise<EmptyDataResponseSchemeType> => {
  try {
    const result = await apiClient.put<EmptyDataResponseSchemeType>(MEMBER_API.NOTIFICATION_SETTINGS, payload);
    return result.data;
  } catch (e) {
    throw e;
  }
};

const fetchProfileImageUploadPresignedUrl = async (
  payload: profileImageUploadPresignedUrlRequestSchemeType,
): Promise<profileImageUploadPresignedUrlResponseSchemeType> => {
  try {
    const result = await apiClient.post<profileImageUploadPresignedUrlResponseSchemeType>(
      MEMBER_API.PROFILE_IMAGE_UPLOAD_PRESIGNED_URL,
      payload,
    );
    return result.data;
  } catch (e) {
    throw e;
  }
};

export {
  validNickname,
  signUp,
  updateMember,
  deleteAccount,
  updateNotificationSettings,
  fetchProfileImageUploadPresignedUrl,
};
