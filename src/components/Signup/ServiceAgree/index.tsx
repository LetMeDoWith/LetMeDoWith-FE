import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Controller, SubmitHandler, useFormContext } from 'react-hook-form';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Checkbox, Divider, IconButton } from 'react-native-paper';
import { getBottomSpace } from 'react-native-iphone-screen-helper';

import type { signUpRequestSchemeType } from 'types/member/scheme/api';
import { theme } from 'styles/theme';
import { useSignUp } from 'hooks/queries/member/useSignUp';
import { isAos } from 'utils/device';

type AgreementKeys = keyof signUpRequestSchemeType['agreements'];
type AgreementLabels = `agreements.${AgreementKeys}`;

const CHECKBOX_MAP_LIST: { label: AgreementLabels; text: string; isLinkable: boolean }[] = [
  { label: 'agreements.termsOfAgree', text: '(필수) 서비스 이용약관 관련 동의', isLinkable: true },
  { label: 'agreements.privacy', text: '(필수) 개인정보 처리 방침', isLinkable: true },
  { label: 'agreements.advertisement', text: '(선택) 광고성 정보 수신동의', isLinkable: true },
];

const ServiceAgree = () => {
  const [allChecked, setAllChecked] = useState<boolean>(false);
  const [ageOfAgree, setAgeOfAgree] = useState<boolean>(false);
  const { handleSubmit, control, watch, setValue } = useFormContext<signUpRequestSchemeType>();
  const termsOfAgree = watch('agreements.termsOfAgree');
  const privacy = watch('agreements.privacy');
  const advertisement = watch('agreements.advertisement');

  const { mutate } = useSignUp();

  const isButtonDisabled = useMemo(() => {
    if ((ageOfAgree && termsOfAgree && privacy) || allChecked) {
      return false;
    }

    return true;
  }, [ageOfAgree, allChecked, privacy, termsOfAgree]);

  const onSubmit: SubmitHandler<signUpRequestSchemeType> = useCallback(
    values => {
      console.log(values);
      const { dateOfBirth } = values;
      mutate({
        ...values,
        dateOfBirth: dateOfBirth.replaceAll(' / ', '-'),
      });
    },
    [mutate],
  );

  const onPressCheckBox = useCallback(
    (label: AgreementLabels) => () => {
      if (watch(label)) {
        setValue(label, false);
        return;
      }
      setValue(label, true);
    },
    [setValue, watch],
  );

  const toggleAgeOfAgreeCheckBox = useCallback(() => {
    setAgeOfAgree(prev => !prev);
  }, []);

  const onPressAllCheckBox = useCallback(() => {
    if (allChecked) {
      setAllChecked(false);
      setAgeOfAgree(false);
      setValue('agreements.termsOfAgree', false);
      setValue('agreements.privacy', false);
      setValue('agreements.advertisement', false);
      return;
    }
    setAllChecked(true);
    setAgeOfAgree(true);
    setValue('agreements.termsOfAgree', true);
    setValue('agreements.privacy', true);
    setValue('agreements.advertisement', true);
  }, [allChecked, setValue]);

  const getCheckboxStatus = useCallback((label: AgreementLabels) => (watch(label) ? 'checked' : 'unchecked'), [watch]);

  useEffect(() => {
    if (ageOfAgree && termsOfAgree && privacy && advertisement) {
      return;
    }

    setAllChecked(false);
  }, [ageOfAgree, termsOfAgree, privacy, advertisement]);

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>이용 약관에 동의해주시면</Text>
          <Text style={styles.title}>회원가입이 끝나요!</Text>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.checkboxWrap}>
          <View style={[styles.formRow, { paddingVertical: 16 }]}>
            <Checkbox.Android
              color={theme.COLORS.PRIMARY.RED_60}
              status={ageOfAgree ? 'checked' : 'unchecked'}
              onPress={toggleAgeOfAgreeCheckBox}
            />
            <Text>(필수) 만 14세 이상입니다.</Text>
          </View>
          {CHECKBOX_MAP_LIST.map(({ label, text, isLinkable }) => (
            <>
              <Divider style={styles.menuDivider} />
              <Controller
                key={label}
                name={label}
                control={control}
                render={() => (
                  <Pressable
                    style={styles.menu}
                    onPress={() => {
                      // TODO: 링크 및 랜딩 페이지 확정되면 onPress 핸들러 등록
                      console.log('click');
                    }}
                  >
                    <View style={styles.formRow}>
                      <Checkbox.Android
                        color={theme.COLORS.PRIMARY.RED_60}
                        status={getCheckboxStatus(label)}
                        onPress={onPressCheckBox(label)}
                      />
                      <Text>{text}</Text>
                    </View>
                    {isLinkable && (
                      <IconButton icon="chevron-right" iconColor={theme.COLORS.GRAY_SCALE.GRAY_80} size={16} />
                    )}
                  </Pressable>
                )}
              />
            </>
          ))}
        </View>
        <Divider style={styles.divider} />
        <View style={[styles.formRow, { marginTop: 16 }]}>
          <Checkbox.Android
            color={theme.COLORS.PRIMARY.RED_60}
            status={allChecked ? 'checked' : 'unchecked'}
            onPress={onPressAllCheckBox}
          />
          <Text>모두 동의합니다.</Text>
        </View>
      </View>
      <Pressable
        style={[styles.button, !isButtonDisabled && { backgroundColor: theme.COLORS.PRIMARY.RED_60 }]}
        onPress={handleSubmit(onSubmit)}
        disabled={isButtonDisabled}
      >
        <Text style={styles.buttonText}>완료</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
    height: isAos
      ? Dimensions.get('window').height - getStatusBarHeight()
      : Dimensions.get('window').height - getStatusBarHeight() - getBottomSpace(),
  },
  titleWrap: {
    marginBottom: 38,
    gap: 4,
  },
  title: theme.TYPOGRAPHY.HEADER,
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxWrap: {
    paddingBottom: 0,
  },
  menuDivider: { borderWidth: 1, borderColor: theme.COLORS.GRAY_SCALE.GRAY_92 },
  divider: { borderWidth: 1, borderColor: theme.COLORS.GRAY_SCALE.GRAY_50 },
  button: {
    marginBottom: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    height: 56,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_80,
  },
  buttonText: {
    fontSize: 18,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { ServiceAgree };
