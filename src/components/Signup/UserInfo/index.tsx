import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, useFormContext } from 'react-hook-form';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { HelperText } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import dayjs from 'dayjs';

import { theme } from 'styles/theme';
import { isAos } from 'utils/device';
import type { SignUpStackScreenProps } from 'types/shared';
import { hexToRgba } from 'utils/style';

const UserInfo = ({ navigation: { navigate } }: SignUpStackScreenProps<'SIGN_UP_USER_INFO'>) => {
  const {
    control,
    watch,
    setValue,
    formState: { errors, dirtyFields },
    setError,
    clearErrors,
  } = useFormContext();

  const { top, bottom } = useSafeAreaInsets();
  const heightStyle = useMemo(
    () => ({
      height: isAos
        ? Dimensions.get('screen').height
        : Dimensions.get('screen').height - getStatusBarHeight() - top - bottom,
    }),
    [top, bottom],
  );

  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);

  const nickname = watch('nickname');
  const birthday = watch('birthday');
  const gender = watch('gender');

  const isFieldErrorExisted = Object.keys(errors).length > 0;
  const isButtonDisabled = !(nickname && birthday && gender) || isFieldErrorExisted;

  const toggleDatePicker = useCallback((isOpen: boolean) => () => setDatePickerOpen(isOpen), []);

  const handleDateChange = useCallback(
    (date: Date) => {
      setValue('birthday', dayjs(date).format('YYYY / MM / DD'));
      toggleDatePicker(false);
    },
    [setValue, toggleDatePicker],
  );

  const handleGenderChange = useCallback(
    (gender: 'male' | 'female') => () => {
      setValue('gender', gender);
    },
    [setValue],
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, heightStyle]}>
      <View style={styles.inputSection}>
        <View style={styles.titleWrap}>
          <Text style={styles.titleNormal}>반가워요!</Text>
          <Text style={styles.titleBold}>사용자 정보를 입력해주세요</Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.labelWrap}>
            <Text
              style={[
                styles.label,
                errors.nickname && styles.error,
                !errors.nickname && dirtyFields.nickname && styles.valid,
              ]}
            >
              닉네임
            </Text>
          </View>
          <Controller
            name="nickname"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  style={[
                    styles.input,
                    errors.nickname && styles.errorBorder,
                    !errors.nickname && dirtyFields.nickname && styles.validBorder,
                  ]}
                  placeholder="닉네임을 입력해주세요"
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
                      setError('nickname', { type: 'nickname', message: '* 띄워쓰기, 특수문자는 사용할 수 없어요.' });
                      return;
                    }

                    clearErrors('nickname');
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
              style={[styles.message, dirtyFields.nickname ? styles.valid : styles.default]}
            >
              {/* TODO: 사용 가능한 닉네임인지 판단 여부 api 연동 필요 */}
              {dirtyFields.nickname ? '사용 가능한 닉네임이에요.' : '* 최소 2자 ~ 최대 7글자 입력 가능합니다.'}
            </HelperText>
          )}
        </View>
        <View style={styles.formContainer}>
          <Controller
            name="birthday"
            control={control}
            render={({ field: { value } }) => (
              <>
                <Text style={[styles.label, errors.birthday && styles.error]}>생년월일</Text>
                <Pressable onPress={toggleDatePicker(true)}>
                  <TextInput
                    style={[styles.input, errors.birthday && styles.error]}
                    pointerEvents="none"
                    editable={false}
                    placeholder="YYYY / MM / DD"
                    value={value}
                  />
                </Pressable>
                <HelperText type="info" padding="none" style={[styles.message, styles.default]}>
                  * 14세 미만은 가입대상이 아닙니다.
                </HelperText>
                <DatePicker
                  modal
                  open={datePickerOpen}
                  mode="date"
                  date={dayjs().toDate()}
                  minimumDate={dayjs().subtract(14, 'year').toDate()}
                  onConfirm={handleDateChange}
                  onCancel={toggleDatePicker(false)}
                />
              </>
            )}
          />
        </View>
        <View style={styles.formContainer}>
          <Controller
            control={control}
            render={() => (
              <View style={styles.genderField}>
                <Text style={[styles.label, errors.gender && styles.error]}>성별</Text>
                <View style={styles.genderButtonGroup}>
                  <Pressable
                    style={[styles.genderButton, gender === 'male' && styles.selectGenderButton]}
                    onPress={handleGenderChange('male')}
                  >
                    <Text style={gender === 'male' && styles.selectGenderButtonText}>남성</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.genderButton, gender === 'female' && styles.selectGenderButton]}
                    onPress={handleGenderChange('female')}
                  >
                    <Text style={gender === 'female' && styles.selectGenderButtonText}>여성</Text>
                  </Pressable>
                </View>
              </View>
            )}
            name="gender"
          />
        </View>
      </View>
      <Pressable
        style={[
          styles.submitButton,
          !isButtonDisabled && { backgroundColor: `${hexToRgba(theme.COLORS.PRIMARY.RED_500)}` },
        ]}
        disabled={isButtonDisabled}
        onPress={() => {
          navigate('SIGN_UP_AGREEMENT');
        }}
      >
        <Text style={styles.submitButtonText}>다음</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  inputSection: {
    gap: 40,
  },
  labelWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  default: {
    color: theme.COLORS.GRAY_SCALE.GRAY_600,
  },
  message: {
    paddingVertical: 0,
    fontSize: 12,
  },
  titleWrap: {
    gap: 8,
  },
  titleNormal: {
    fontSize: 24,
    alignItems: 'center',
  },
  titleBold: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    gap: 12,
  },
  label: {
    fontSize: 14,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_500,
    paddingHorizontal: 16,
    color: theme.COLORS.DEFAULT.BLACK,
  },
  valid: {
    color: theme.COLORS.SECONDARY.BLUE_500,
  },
  error: {
    color: theme.COLORS.PRIMARY.RED_500,
  },
  validBorder: {
    borderColor: theme.COLORS.SECONDARY.BLUE_500,
  },
  errorBorder: {
    borderColor: theme.COLORS.PRIMARY.RED_500,
  },
  genderField: {
    gap: 12,
  },
  genderButtonGroup: {
    gap: 8,
    flexDirection: 'row',
  },
  genderButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_400,
    height: 48,
  },
  selectGenderButton: {
    borderColor: theme.COLORS.PRIMARY.RED_500,
    backgroundColor: theme.COLORS.PRIMARY.RED_100,
  },
  selectGenderButtonText: {
    color: theme.COLORS.PRIMARY.RED_500,
  },
  submitButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    height: 56,
    backgroundColor: `${hexToRgba(theme.COLORS.PRIMARY.RED_500, 0.36)}`,
  },
  submitButtonText: {
    fontSize: 18,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { UserInfo };
