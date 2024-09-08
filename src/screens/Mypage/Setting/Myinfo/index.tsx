import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { HelperText, IconButton, TextInput } from 'react-native-paper';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { getBottomSpace } from 'react-native-iphone-screen-helper';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { theme } from 'styles/theme';
import { isAos } from 'utils/device';
import { BasicMenu } from 'components/Mypage/Setting/Menu';
import { ConfirmModal } from 'components/common/Modal';
import { DELETE_ACCOUNT_CONFIRM_MODAL_CONTENT, LOGOUT_CONFIRM_MODAL_CONTENT } from 'constants/Mypage';
import type { SettingStackScreenProps } from 'types/shared';

type FormData = {
  nickname: string;
  description: string;
};

const Myinfo = ({ navigation: { navigate } }: SettingStackScreenProps<'MYINFO'>) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'LOGOUT' | 'DELETE_ACCOUNT' | null>(null);

  const {
    watch,
    control,
    formState: { errors, dirtyFields },
    setError,
    clearErrors,
    handleSubmit,
  } = useForm<FormData>({
    defaultValues: {
      nickname: '',
      description: '',
    },
  });

  const toggleModalOpen = useCallback(() => {
    setIsModalOpen(!isModalOpen);
  }, [isModalOpen]);

  const onPressLogout = useCallback(() => {
    toggleModalOpen();
    setModalType('LOGOUT');
  }, [toggleModalOpen]);

  const onPressDeleteAccount = useCallback(() => {
    toggleModalOpen();
    setModalType('DELETE_ACCOUNT');
  }, [toggleModalOpen]);

  const onPressConfirmButton = useCallback(() => {
    toggleModalOpen();

    if (modalType === 'DELETE_ACCOUNT') {
      return;
    }

    // TODO: 로그아웃 API 연동
  }, [modalType, toggleModalOpen]);

  const onPressCancelButton = useCallback(() => {
    toggleModalOpen();

    if (modalType === 'LOGOUT') {
      return;
    }

    // TODO: 회원 탈퇴 API 연동
  }, [modalType, toggleModalOpen]);

  const onSubmit = useCallback((values: FormData) => {
    console.log(values);
    // TODO: 회원 정보 수정 API 연동
  }, []);

  const nickname = watch('nickname');

  // TODO: 버튼 비활성화 기획에 맞게 수정 필요
  const isButtonDisabled = useMemo(() => !nickname, [nickname]);

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container} disableScrollOnKeyboardHide={true}>
      <View style={styles.contentWrap}>
        <View style={styles.imageWrap}>
          <Pressable
            style={{ width: 50, height: 50 }}
            onPress={() => {
              navigate('BADGE_INFO');
            }}
          >
            <Image
              style={styles.image}
              source={{
                uri: 'https://ichef.bbci.co.uk/news/1536/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg.webp',
              }}
            />
            <IconButton
              style={{ position: 'relative', left: 25, bottom: 25 }}
              icon="pencil-circle"
              iconColor={theme.COLORS.GRAY_SCALE.GRAY_500}
              size={22}
            />
          </Pressable>
          <Text style={styles.badgeText}>뉴비기너</Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.field}>
            <Controller
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text>닉네임</Text>
                  <TextInput
                    placeholder="닉네임을 입력해주세요."
                    placeholderTextColor={theme.COLORS.GRAY_SCALE.GRAY_600}
                    activeUnderlineColor={theme.COLORS.GRAY_SCALE.GRAY_500}
                    contentStyle={{
                      paddingLeft: 0,
                      backgroundColor: theme.COLORS.DEFAULT.WHITE,
                    }}
                    onChangeText={value => {
                      onChange(value);

                      // 값이 비어졌을 때 에러 초기화
                      if (value !== '') return;
                      clearErrors('nickname');
                    }}
                    onBlur={() => {
                      if (!dirtyFields.nickname) return;

                      // TODO: 이미 사용 중인 닉네임인지 여부 검사

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

                      clearErrors('nickname');
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
            ) : (
              <HelperText
                type="info"
                padding="none"
                style={[styles.message, dirtyFields.nickname ? styles.valid : styles.default]}
              >
                {/* TODO: 사용 가능한 닉네임인지 판단 여부 api 연동 필요 */}
                {dirtyFields.nickname ? '사용 가능한 닉네임이에요.' : '* 최소 2자 ~ 최대 7글자 입력 가능합니다.'}
              </HelperText>
            )}
          </View>
          <Controller
            render={({ field: { onChange, value } }) => (
              <View>
                <Text>자기소개</Text>
                <TextInput
                  placeholder="프로필에 멋진 자기소개를 입력해 보세요."
                  placeholderTextColor={theme.COLORS.GRAY_SCALE.GRAY_600}
                  activeUnderlineColor={theme.COLORS.GRAY_SCALE.GRAY_500}
                  contentStyle={{
                    paddingLeft: 0,
                    backgroundColor: theme.COLORS.DEFAULT.WHITE,
                  }}
                  onChangeText={onChange}
                  value={value}
                />
              </View>
            )}
            control={control}
            name="description"
          />
        </View>
        <BasicMenu title="로그아웃" style={{ paddingLeft: 0, paddingRight: 0 }} onPress={onPressLogout} />
        <Text style={styles.deleteAccount} onPress={onPressDeleteAccount}>
          회원탈퇴
        </Text>
      </View>
      <Pressable
        style={[styles.button, !isButtonDisabled && { backgroundColor: theme.COLORS.PRIMARY.RED_500 }]}
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
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    minHeight: isAos
      ? Dimensions.get('window').height - getStatusBarHeight() - 50
      : Dimensions.get('window').height - getStatusBarHeight() - getBottomSpace() - 20,
    paddingTop: 11,
    paddingBottom: 26,
    backgroundColor: theme.COLORS.DEFAULT.WHITE,
    justifyContent: 'space-between',
  },
  contentWrap: {
    paddingHorizontal: 24,
  },
  imageWrap: {
    alignItems: 'center',
  },
  badgeText: {
    marginTop: 12,
  },
  image: {
    borderRadius: 10,
    width: '100%',
    height: '100%',
  },
  formContainer: {
    gap: 26,
    marginTop: 45,
  },
  field: { gap: 12 },
  default: {
    color: theme.COLORS.GRAY_SCALE.GRAY_600,
  },
  message: {
    paddingVertical: 0,
    fontSize: 12,
  },
  valid: {
    color: theme.COLORS.SECONDARY.BLUE_500,
  },
  error: {
    color: theme.COLORS.PRIMARY.RED_500,
  },
  button: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    height: 64,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_500,
  },
  buttonText: {
    fontSize: 18,
    color: theme.COLORS.DEFAULT.WHITE,
  },
  deleteAccount: {
    fontSize: 12,
    marginTop: 24,
    color: theme.COLORS.GRAY_SCALE.GRAY_600,
    alignSelf: 'flex-start',
  },
});

export { Myinfo };
