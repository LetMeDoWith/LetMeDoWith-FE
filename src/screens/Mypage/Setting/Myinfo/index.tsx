import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  TextInput,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { HelperText } from 'react-native-paper';
import { getBottomSpace } from 'react-native-iphone-screen-helper';

import { theme } from 'styles/theme';
import { isAos } from 'utils/device';
import { BasicMenu } from 'components/Mypage/Setting/Menu';
import { ConfirmModal } from 'components/common/Modal';
import { DELETE_ACCOUNT_CONFIRM_MODAL_CONTENT, LOGOUT_CONFIRM_MODAL_CONTENT } from 'constants/Mypage';
import { useDeleteAccount } from 'hooks/queries/member/useDeleteAccount';
import { useStore } from 'stores/index';
import { disposeNotificationLayer } from 'utils/notification';
import { useValidNickname } from 'hooks/queries/member/useValidNickname';
import { StatusCodeEnum } from 'schemes/shared/enum';
import { Camera } from 'components/common/icons/Camera';
import { useUpdateMember } from 'hooks/queries/member/useUpdateMember';

type FormData = {
  nickname: string;
  selfDescription: string;
  profileImageUrl: string;
};

const Myinfo = () => {
  const { initAuthInfo } = useStore(({ authActions: { initAuthInfo } }) => ({
    initAuthInfo,
  }));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'LOGOUT' | 'DELETE_ACCOUNT' | null>(null);
  const { mutate: mutateDeleteAccount } = useDeleteAccount();
  const {
    mutate: mutateValidNickname,
    isSuccess: isSuccessMutateValidNickname,
    reset: resetMutateValidNickname,
  } = useValidNickname();

  const {
    watch,
    control,
    formState: { errors, dirtyFields, touchedFields },
    setError,
    clearErrors,
    handleSubmit,
  } = useForm<FormData>({
    defaultValues: {
      nickname: '',
      selfDescription: '',
      profileImageUrl: '',
    },
    mode: 'onBlur',
  });
  const { mutate: mutateUpdateMember } = useUpdateMember({
    onSuccess: () => {
      clearErrors();
      resetMutateValidNickname();
    },
  });

  const nickname = watch('nickname');
  const selfDescription = watch('selfDescription');
  const profileImageUrl = watch('profileImageUrl');

  const isButtonDisabled = useMemo(() => !nickname || !!errors.nickname, [nickname, errors.nickname]);

  const toggleModalOpen = useCallback(() => {
    setIsModalOpen(!isModalOpen);
  }, [isModalOpen]);

  const onPressLogout = useCallback(() => {
    Keyboard.dismiss();
    toggleModalOpen();
    setModalType('LOGOUT');
  }, [toggleModalOpen]);

  const onPressDeleteAccount = useCallback(() => {
    Keyboard.dismiss();
    toggleModalOpen();
    setModalType('DELETE_ACCOUNT');
  }, [toggleModalOpen]);

  const onPressConfirmButton = useCallback(async () => {
    toggleModalOpen();

    if (modalType === 'LOGOUT') {
      initAuthInfo();
      disposeNotificationLayer();
    }
  }, [modalType, toggleModalOpen]);

  const onPressCancelButton = useCallback(() => {
    toggleModalOpen();

    if (modalType === 'DELETE_ACCOUNT') {
      mutateDeleteAccount();
      return;
    }
  }, [modalType, mutateDeleteAccount, toggleModalOpen]);

  const handleProfileImage = () => {
    // TODO: 갤러리 선택 기능 연동
    console.log('클릭');
  };

  const onSubmit = useCallback((values: FormData) => {
    mutateUpdateMember(values);
  }, []);

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.contentWrap}>
            <View style={styles.imageWrap}>
              <Pressable style={{ width: 120, height: 120 }} onPress={handleProfileImage}>
                {profileImageUrl ? (
                  <Image
                    style={styles.image}
                    source={{
                      uri: profileImageUrl,
                    }}
                  />
                ) : (
                  <View style={[styles.image, { backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_96 }]} />
                )}
                <View style={{ position: 'absolute', right: -8, bottom: -8 }}>
                  <Camera width={32} height={32} />
                </View>
              </Pressable>
            </View>
            <View style={styles.formContainer}>
              <View style={styles.field}>
                <Controller
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.inputSection}>
                      <Text style={[theme.TYPOGRAPHY.BODY_2, { color: theme.COLORS.GRAY_SCALE.GRAY_60 }]}>닉네임</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="닉네임을 입력해주세요."
                        onChangeText={onChange}
                        onBlur={() => {
                          onBlur();
                          resetMutateValidNickname();

                          if (!dirtyFields.nickname) {
                            clearErrors('nickname');
                            return;
                          }

                          if (nickname.length < 2 || nickname.length > 7) {
                            setError('nickname', { type: 'nickname', message: '* 닉네임 길이 조건을 확인해주세요.' });
                            return;
                          }

                          if (nickname.match(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9/]/)) {
                            setError('nickname', {
                              type: 'nickname',
                              message: '* 띄워쓰기, 특수문자는 사용할 수 없어요.',
                            });
                            return;
                          }

                          mutateValidNickname(
                            { nickname },
                            {
                              onSuccess: ({ statusCode, data }) => {
                                if (statusCode !== StatusCodeEnum.enum.S100) {
                                  setError('nickname', { type: 'nickname', message: `* ${data}.` });
                                  return;
                                }

                                clearErrors('nickname');
                              },
                              onError: e => {
                                Alert.alert('닉네임 중복 여부 검증에 실패했습니다.');
                                console.error(e.response?.data);
                              },
                            },
                          );
                        }}
                        value={value}
                      />
                    </View>
                  )}
                  control={control}
                  name="nickname"
                />
                {errors.nickname ? (
                  <HelperText type="error" padding="none" style={[styles.message, styles.error]}>
                    {errors.nickname.message as string}
                  </HelperText>
                ) : touchedFields.nickname && isSuccessMutateValidNickname ? (
                  <HelperText
                    type="info"
                    padding="none"
                    style={[
                      styles.message,
                      touchedFields.nickname && isSuccessMutateValidNickname ? styles.valid : styles.default,
                    ]}
                  >
                    사용 가능한 닉네임이에요.
                  </HelperText>
                ) : null}
              </View>
              <Controller
                render={({ field: { onChange, value } }) => (
                  <View style={styles.inputSection}>
                    <View style={styles.labelWrap}>
                      <Text style={[theme.TYPOGRAPHY.BODY_2, { color: theme.COLORS.GRAY_SCALE.GRAY_60 }]}>
                        자기소개(선택)
                      </Text>
                      <Text style={[theme.TYPOGRAPHY.CAPTION1_BASIC, { color: theme.COLORS.GRAY_SCALE.GRAY_60 }]}>
                        {selfDescription.length}/20
                      </Text>
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="프로필에 멋진 자기소개를 입력해 보세요."
                      onChangeText={onChange}
                      value={value}
                      maxLength={20}
                    />
                  </View>
                )}
                control={control}
                name="selfDescription"
              />
            </View>
            <BasicMenu title="로그아웃" style={{ paddingLeft: 0, paddingRight: 0 }} onPress={onPressLogout} />
            <Text style={styles.deleteAccount} onPress={onPressDeleteAccount}>
              회원탈퇴
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <Pressable
        style={[styles.button, !isButtonDisabled && { backgroundColor: theme.COLORS.PRIMARY.RED_60 }]}
        disabled={isButtonDisabled}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.buttonText}>저장하기</Text>
      </Pressable>
      <ConfirmModal
        visible={isModalOpen}
        title={modalType === 'LOGOUT' ? LOGOUT_CONFIRM_MODAL_CONTENT.title : DELETE_ACCOUNT_CONFIRM_MODAL_CONTENT.title}
        description={
          modalType === 'LOGOUT'
            ? LOGOUT_CONFIRM_MODAL_CONTENT.description
            : DELETE_ACCOUNT_CONFIRM_MODAL_CONTENT.description
        }
        confirmText={
          modalType === 'LOGOUT'
            ? LOGOUT_CONFIRM_MODAL_CONTENT.confirmButtonText
            : DELETE_ACCOUNT_CONFIRM_MODAL_CONTENT.confirmButtonText
        }
        cancelText={
          modalType === 'LOGOUT'
            ? LOGOUT_CONFIRM_MODAL_CONTENT.cancelButtonText
            : DELETE_ACCOUNT_CONFIRM_MODAL_CONTENT.cancelButtonText
        }
        onDismiss={toggleModalOpen}
        onConfirm={onPressConfirmButton}
        onCancel={onPressCancelButton}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 11,
    paddingBottom: 26,
    justifyContent: 'space-between',
  },
  contentWrap: {
    paddingHorizontal: 20,
  },
  imageWrap: {
    alignItems: 'center',
  },
  image: {
    borderRadius: 40,
    width: '100%',
    height: '100%',
  },
  formContainer: {
    gap: 24,
    marginTop: 45,
  },
  field: { gap: 12 },
  default: {
    color: theme.COLORS.GRAY_SCALE.GRAY_60,
  },
  labelWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputSection: {
    gap: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_80,
    paddingHorizontal: 16,
    color: theme.COLORS.DEFAULT.BLACK,
  },
  message: {
    paddingVertical: 0,
    fontSize: 12,
  },
  valid: {
    color: theme.COLORS.SUB.BLUE_60,
  },
  error: {
    color: theme.COLORS.SUB.PINK_60,
  },
  button: {
    position: 'absolute',
    borderRadius: 8,
    bottom: isAos ? 24 : getBottomSpace() + 24,
    left: 20,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 64,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_80,
  },
  buttonText: {
    fontSize: 18,
    color: theme.COLORS.DEFAULT.WHITE,
  },
  deleteAccount: {
    fontSize: 12,
    marginTop: 24,
    color: theme.COLORS.GRAY_SCALE.GRAY_60,
    alignSelf: 'flex-start',
  },
});

export { Myinfo };
