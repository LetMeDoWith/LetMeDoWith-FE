import React, { useCallback, useMemo, useRef } from 'react';
import { Alert, BackHandler, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { useFocusEffect } from '@react-navigation/native';
import { HelperText } from 'react-native-paper';
import { DateTimePicker } from 'components/common/DateTimePicker';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/src/types';
import { getBottomSpace } from 'react-native-iphone-screen-helper';
import dayjs from 'dayjs';

import { theme } from 'styles/theme';
import { isAos } from 'utils/device';
import type { SignUpStackScreenProps } from 'types/shared';
import { hexToRgba } from 'utils/style';
import { useValidNickname } from 'hooks/queries/member/useValidNickname';
import { StatusCodeEnum } from 'schemes/shared/enum';
import type { signUpRequestSchemeType } from 'types/member/scheme/api';
import { useDialog } from 'components/common/Dialog/Provider';

const UserInfo = ({ navigation: { navigate } }: SignUpStackScreenProps<'SIGN_UP_USER_INFO'>) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors, dirtyFields, touchedFields },
    setError,
    clearErrors,
  } = useFormContext<signUpRequestSchemeType>();

  const { showDialog, hideDialog } = useDialog();
  const {
    mutate: mutateValidNickname,
    isSuccess: isSuccessMutateValidNickname,
    reset: resetMutateValidNickname,
  } = useValidNickname();

  const dateTimePickerRef = useRef<BottomSheetModalMethods>(null);
  const nickname = watch('nickname');
  const dateOfBirth = watch('dateOfBirth');
  const gender = watch('gender');

  const isFieldErrorExisted = Object.keys(errors).length > 0;
  const isButtonDisabled = useMemo(
    () => !(nickname && dateOfBirth && gender) || isFieldErrorExisted,
    [nickname, dateOfBirth, gender, isFieldErrorExisted],
  );

  const handleDateChange = useCallback(
    (date: Date) => {
      setValue('dateOfBirth', dayjs(date).format('YYYY / MM / DD'));
      dateTimePickerRef.current?.dismiss();
    },
    [setValue],
  );

  const handleGenderButton = useCallback(
    (value: 'M' | 'F') => () => {
      setValue('gender', value);
    },
    [setValue],
  );

  // AOS에서 하드웨어 뒤로가기 버튼을 눌렀을 때 Dialog 노출
  useFocusEffect(() => {
    const onBackPress = () => {
      showDialog({
        title: '회원가입이 중단됩니다.',
        content: '지금까지 입력한 정보는 저장되지 않아요.\n그래도 나가시겠어요?',
        leftButtonText: '네',
        rightButtonText: '아니요',
        handleRightButton: hideDialog,
      });

      // 기본 뒤로가기 기능 해제
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  });

  return (
    <>
      <View style={styles.container}>
        <View style={styles.inputSection}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>반가워요!</Text>
            <Text style={styles.title}>사용자 정보를 입력해주세요</Text>
          </View>
          <View style={styles.formContainer}>
            <View style={styles.labelWrap}>
              <Text
                style={[
                  styles.label,
                  errors.nickname && styles.error,
                  !errors.nickname && touchedFields.nickname && isSuccessMutateValidNickname && styles.valid,
                ]}
              >
                닉네임
              </Text>
            </View>
            <Controller
              name="nickname"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    style={[
                      styles.input,
                      errors.nickname && styles.errorBorder,
                      !errors.nickname && touchedFields.nickname && isSuccessMutateValidNickname && styles.validBorder,
                    ]}
                    placeholder="닉네임을 입력해주세요"
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
                        setError('nickname', { type: 'nickname', message: '* 띄워쓰기, 특수문자는 사용할 수 없어요.' });
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
                </>
              )}
            />
            {errors.nickname ? (
              <HelperText type="error" padding="none" style={[styles.message, styles.error]}>
                {errors.nickname.message as string}
              </HelperText>
            ) : (
              <HelperText
                type="info"
                padding="none"
                style={[
                  styles.message,
                  touchedFields.nickname && isSuccessMutateValidNickname ? styles.valid : styles.default,
                ]}
              >
                {touchedFields.nickname && isSuccessMutateValidNickname
                  ? '사용 가능한 닉네임이에요.'
                  : '* 최소 2자 ~ 최대 7글자 입력 가능합니다.'}
              </HelperText>
            )}
          </View>
          <View style={styles.formContainer}>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field: { value } }) => (
                <>
                  <Text style={[styles.label, errors.dateOfBirth && styles.error]}>생년월일</Text>
                  <Pressable
                    onPress={() => {
                      dateTimePickerRef.current?.present();
                    }}
                  >
                    <TextInput
                      style={[styles.input, errors.dateOfBirth && styles.error]}
                      pointerEvents="none"
                      editable={false}
                      placeholder="YYYY / MM / DD"
                      value={value}
                    />
                  </Pressable>
                  <HelperText type="info" padding="none" style={[styles.message, styles.default]}>
                    * 14세 미만은 가입대상이 아닙니다.
                  </HelperText>
                </>
              )}
            />
          </View>
          <View style={styles.genderButtonContainer}>
            <Pressable
              style={[styles.genderButton, gender === 'M' && { borderColor: theme.COLORS.DEFAULT.BLACK }]}
              onPress={handleGenderButton('M')}
            >
              <Text style={styles.genderButtonText}>남성</Text>
            </Pressable>
            <Pressable
              style={[styles.genderButton, gender === 'F' && { borderColor: theme.COLORS.DEFAULT.BLACK }]}
              onPress={handleGenderButton('F')}
            >
              <Text style={styles.genderButtonText}>여성</Text>
            </Pressable>
          </View>
        </View>
        <Pressable
          style={[
            styles.nextButton,
            !isButtonDisabled && { backgroundColor: `${hexToRgba(theme.COLORS.PRIMARY.RED_60)}` },
          ]}
          disabled={isButtonDisabled}
          onPress={() => {
            navigate('SIGN_UP_AGREEMENT');
          }}
        >
          <Text style={styles.nextButtonText}>다음</Text>
        </Pressable>
      </View>
      <DateTimePicker
        ref={dateTimePickerRef}
        mode="date"
        title="생년월일"
        description="만 14세 미만은 가입할 수 없어요."
        onConfirm={handleDateChange}
        maximumDate={dayjs().subtract(14, 'year').toDate()}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: isAos ? 24 : getBottomSpace() + 24,
    paddingHorizontal: 20,
  },
  inputSection: {
    gap: 40,
  },
  labelWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  default: {
    color: theme.COLORS.GRAY_SCALE.GRAY_60,
  },
  message: {
    ...theme.TYPOGRAPHY.CAPTION1_BASIC,
    paddingVertical: 0,
  },
  titleWrap: {
    gap: 4,
  },
  title: theme.TYPOGRAPHY.HEADER,
  formContainer: {
    gap: 12,
  },
  label: {
    ...theme.TYPOGRAPHY.BODY_2,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_80,
    paddingHorizontal: 16,
    color: theme.COLORS.DEFAULT.BLACK,
  },
  valid: {
    color: theme.COLORS.SUB.BLUE_60,
  },
  error: {
    color: theme.COLORS.PRIMARY.RED_60,
  },
  validBorder: {
    borderColor: theme.COLORS.SUB.BLUE_60,
  },
  errorBorder: {
    borderColor: theme.COLORS.PRIMARY.RED_60,
  },
  genderField: {
    gap: 12,
  },
  genderButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    borderWidth: 1,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_92,
  },
  genderButtonText: {
    ...theme.TYPOGRAPHY.BODY_1,
    color: theme.COLORS.DEFAULT.BLACK,
  },
  nextButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    height: 56,
    backgroundColor: `${hexToRgba(theme.COLORS.PRIMARY.RED_60, 0.36)}`,
  },
  nextButtonText: {
    ...theme.TYPOGRAPHY.TITLE_2,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { UserInfo };
