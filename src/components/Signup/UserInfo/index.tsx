import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, useFormContext } from 'react-hook-form';
import DropDownPicker from 'react-native-dropdown-picker';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { HelperText } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import dayjs from 'dayjs';
import Popover from 'react-native-popover-view';

import { theme } from 'styles/theme';
import { isAos } from 'utils/device';
import type { SignUpStackScreenProps } from 'types/shared';
import { QuestionCircle } from 'components/common/icons/QuestionCircle';

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

  const [selectBoxOpen, setSelectBoxOpen] = useState<boolean>(false);
  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);

  const nickname = watch('nickname');
  const birthday = watch('birthday');
  const gender = watch('gender');

  const isButtonDisabled = useMemo(() => !(nickname && birthday && gender), [nickname, birthday, gender]);

  const selectItems = [
    { label: '남성', value: 'male' },
    { label: '여성', value: 'female' },
  ];

  const toggleDatePicker = useCallback((isOpen: boolean) => () => setDatePickerOpen(isOpen), []);

  const handleDateChange = useCallback(
    (date: Date) => {
      setValue('birthday', dayjs(date).format('YYYY / MM / DD'));
      toggleDatePicker(false);
    },
    [setValue, toggleDatePicker],
  );

  return (
    <ScrollView contentContainerStyle={[styles.container, heightStyle]}>
      <View style={styles.inputSection}>
        <View>
          <Text style={styles.titleBold}>사용자 정보를</Text>
          <Text style={styles.titleNormal}>입력해주세요</Text>
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
            <Popover
              from={
                <Pressable>
                  <QuestionCircle />
                </Pressable>
              }
              backgroundStyle={styles.popoverBackground}
              offset={4}
              popoverStyle={styles.popoverStyle}
            >
              <Text style={styles.popoverTitle}>{'닉네임은 회원가입 이후 \n내 정보에서 변경할 수 있습니다.'}</Text>
            </Popover>
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
                  onChangeText={onChange}
                  onBlur={() => {
                    if (!dirtyFields.nickname) return;

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
            render={({ field }) => (
              <>
                <Text style={[styles.label, errors.gender && styles.error]}>성별</Text>
                <DropDownPicker
                  {...field}
                  listMode="SCROLLVIEW"
                  style={styles.selectBox}
                  dropDownContainerStyle={styles.selectBox}
                  items={selectItems}
                  multiple={false}
                  setValue={cb => {
                    const value = cb(field.value);
                    return field.onChange(value);
                  }}
                  placeholder="선택"
                  open={selectBoxOpen}
                  setOpen={setSelectBoxOpen}
                  onSelectItem={({ value }) => {
                    if (!value) return;
                    setValue('gender', value);
                  }}
                />
              </>
            )}
            name="gender"
          />
        </View>
      </View>
      <Pressable
        style={[styles.button, !isButtonDisabled && { backgroundColor: theme.COLORS.PRIMARY.RED_500 }]}
        disabled={isButtonDisabled}
        onPress={() => {
          navigate('SIGN_UP_AGREEMENT');
        }}
      >
        <Text style={styles.buttonText}>다음</Text>
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
  popoverStyle: { backgroundColor: theme.COLORS.DEFAULT.BLACK, paddingVertical: 12, paddingHorizontal: 8 },
  popoverBackground: { opacity: 0 },
  popoverTitle: { color: theme.COLORS.DEFAULT.WHITE, textAlign: 'center' },
  default: {
    color: theme.COLORS.GRAY_SCALE.GRAY_600,
  },
  message: {
    paddingVertical: 0,
    fontSize: 12,
  },
  titleBold: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  titleNormal: {
    fontSize: 28,
    alignItems: 'center',
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
    borderRadius: 6,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_400,
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
  selectBox: {
    width: Dimensions.get('window').width / 2 - 24,
    borderColor: theme.COLORS.GRAY_SCALE.GRAY_400,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    height: 56,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_500,
  },
  buttonText: {
    fontSize: 18,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { UserInfo };
