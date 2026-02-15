import React, { useCallback, useMemo, useRef } from 'react';
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
  Linking,
  Dimensions,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { HelperText } from 'react-native-paper';
import { getBottomSpace } from 'react-native-iphone-screen-helper';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import type { SettingStackScreenProps } from 'types/shared';
import { theme } from 'styles/theme';
import { isAos } from 'utils/device';
import { useValidNickname } from 'hooks/queries/member/useValidNickname';
import { StatusCodeEnum } from 'schemes/shared/enum';
import { Camera } from 'components/common/icons/Camera';
import { useUpdateMember } from 'hooks/queries/member/useUpdateMember';
import { launchImageLibrary } from 'react-native-image-picker';
import { BottomSheet } from 'components/common/BottomSheet';
import { Gallery } from 'components/common/icons/Gallery';
import { useDialog } from 'components/common/Dialog/Provider';
import { updateMemberRequestSchemeType } from 'types/member/scheme/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Myinfo = ({ navigation: { navigate } }: SettingStackScreenProps<'MYINFO'>) => {
  const uploadImageBottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { showDialog, hideDialog } = useDialog();
  const {
    mutate: mutateValidNickname,
    isSuccess: isSuccessMutateValidNickname,
    reset: resetMutateValidNickname,
  } = useValidNickname();

  const {
    watch,
    control,
    setValue,
    formState: { errors, dirtyFields, touchedFields },
    setError,
    clearErrors,
    handleSubmit,
  } = useForm<updateMemberRequestSchemeType>({
    defaultValues: {
      nickname: '',
      selfDescription: '',
      profileImageUrl: '',
    },
    mode: 'onBlur',
  });
  const { mutate: mutateUpdateMember } = useUpdateMember({
    onSuccess: () => {
      navigate('DEFAULT');
      clearErrors();
      resetMutateValidNickname();
    },
  });

  const nickname = watch('nickname');
  const selfDescription = watch('selfDescription');
  const profileImageUrl = watch('profileImageUrl');

  const isButtonDisabled = useMemo(
    () => !nickname || !isSuccessMutateValidNickname || !!errors.nickname,
    [nickname, isSuccessMutateValidNickname, errors.nickname],
  );

  const handleProfileImage = (type: 'SELECT' | 'DELETE') => async () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.7 as const,
    };

    if (type === 'DELETE') {
      uploadImageBottomSheetModalRef.current?.dismiss();
      setValue('profileImageUrl', '');
      return;
    }

    try {
      // 카메라 촬영 또는 갤러리에서 선택
      const result = await launchImageLibrary(options);

      // 사용자가 취소한 경우
      if (result.didCancel) {
        console.log('사용자가 갤러리 접근을 취소했습니다');
        return;
      }

      // 권한 거부 또는 에러 처리
      if (result.errorCode) {
        console.error('[갤러리 에러]:', result.errorCode, result.errorMessage);
        // 권한 거부 에러인 경우만 다이얼로그 표시
        const isPermissionDenied =
          result.errorCode === 'permission' ||
          result.errorCode === 'camera_unavailable' ||
          result.errorCode === 'others';

        if (isPermissionDenied) {
          showDialog({
            title: '갤러리 접근 권한 필요',
            content: '갤러리 접근 권한을 허용해야 해요!\n기기 설정에서 권한을 변경할 수 있어요',
            leftButtonText: '취소',
            rightButtonText: '설정 바로가기',
            handleLeftButton: () => hideDialog,
            handleRightButton: () => {
              Linking.openSettings();
              hideDialog();
            },
          });
        }

        return;
      }

      // 이미지 선택 성공
      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.fileName || 'photo.jpg';

        const uri = asset.uri || '';
        const photoFile = {
          uri,
          width: asset.width || 0,
          height: asset.height || 0,
          isRawPhoto: false,
          orientation: 'portrait' as const,
          isMirrored: false,
        };

        // TODO: 업로드 이미지 URL 발급 API 연동
        // setValue('profileImageUrl', uri);
      }
    } catch (e) {
      console.error('이미지 선택 중 에러 발생:', e);
    }

    uploadImageBottomSheetModalRef.current?.dismiss();
  };

  const renderBottomSheetContent = () => (
    <>
      <Pressable style={styles.modalContentRow} onPress={handleProfileImage('SELECT')}>
        <Gallery />
        <Text style={styles.modalContentText}>앨범에서 선택</Text>
      </Pressable>
      {profileImageUrl && (
        <Pressable style={styles.modalContentRow} onPress={handleProfileImage('DELETE')}>
          <Camera />
          <Text style={styles.modalContentText}>프로필 사진 삭제</Text>
        </Pressable>
      )}
    </>
  );

  const onSubmit = useCallback((values: updateMemberRequestSchemeType) => {
    console.log(values);
    mutateUpdateMember(values);
  }, []);

  return (
    <>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.contentWrap}>
            <View style={styles.imageWrap}>
              <Pressable
                style={{ width: 120, height: 120 }}
                onPress={() => uploadImageBottomSheetModalRef.current?.present()}
              >
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
      <BottomSheet
        ref={uploadImageBottomSheetModalRef}
        title="프로필 이미지 업로드"
        description="프로필 이미지를 업로드 합니다."
        snapPoints={[`${((profileImageUrl ? 220 : 170) / SCREEN_HEIGHT) * 100}%`]}
      >
        <View style={styles.modalContainer}>{renderBottomSheetContent()}</View>
      </BottomSheet>
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
  modalContainer: {
    paddingVertical: 24,
    gap: 20,
  },
  modalContentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalContentText: theme.TYPOGRAPHY.BODY_1,
});

export { Myinfo };
