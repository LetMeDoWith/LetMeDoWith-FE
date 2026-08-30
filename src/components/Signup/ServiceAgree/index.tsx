import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Controller, SubmitHandler, useFormContext } from 'react-hook-form';
import { Checkbox, Divider, IconButton } from 'react-native-paper';
import { getBottomSpace } from 'react-native-iphone-screen-helper';
import dayjs from 'dayjs';

import type { signUpRequestSchemeType } from 'types/member/scheme/api';
import { theme } from 'styles/theme';
import { useSignUp } from 'hooks/queries/member/useSignUp';
import { isAos } from 'utils/device';
import { useDialog } from 'components/common/Dialog/Provider';
import { useStore } from 'stores/index';

type AgreementKeys = keyof signUpRequestSchemeType['agreements'];
type AgreementLabels = `agreements.${AgreementKeys}`;

const CHECKBOX_MAP_LIST: { label: AgreementLabels; text: string; isLinkable: boolean }[] = [
  { label: 'agreements.termsOfAgree', text: '(필수) 서비스 이용약관 관련 동의', isLinkable: true },
  { label: 'agreements.privacy', text: '(필수) 개인정보 처리 방침', isLinkable: true },
  { label: 'agreements.advertisement', text: '(선택) 광고성 정보 수신동의', isLinkable: true },
];

const ServiceAgree = () => {
  const { handleSubmit, control, watch, setValue } = useFormContext<signUpRequestSchemeType>();
  const {
    notificationActions: { updateNotificationSettings },
  } = useStore();
  const { showDialog, hideDialog } = useDialog();

  const [allChecked, setAllChecked] = useState<boolean>(false);
  const [ageOfAgree, setAgeOfAgree] = useState<boolean>(false);
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

  const onSubmit: SubmitHandler<signUpRequestSchemeType> = useCallback(values => {
    console.log(values);
    const {
      nickname,
      dateOfBirth,
      agreements: { advertisement },
    } = values;

    // 광고성 알림 동의 안했을 경우 동의 강조 관련 Dialog 노출
    if (!advertisement) {
      showDialog({
        title: '광고성 정보 수신 동의',
        content: '광고성 정보 수신 미동의시 다양한 혜택 및\n이벤트 참여에 제한이 있을 수 있습니다.',
        leftButtonText: '미동의',
        rightButtonText: '동의',
        handleLeftButton: () => hideDialog,
        handleRightButton: () => {
          setValue('agreements.advertisement', true);
          hideDialog();
        },
      });

      showDialog({
        type: 'ALERT',
        title: '광고성 정보 수신거부 처리',
        content: '광고성 수신 정보 동의는 설정 >\n마케팅ㆍ혜택 알림에서 변경 가능합니다.',
        subContent: `작성자 : ${nickname}\n일시 : ${dayjs().format('YYYY년 MM월 DD일')}\n상태 : 광고성 정보 수신 ${
          advertisement ? '동의' : '미동의'
        }`,
        handleAlertButton: () => {
          mutate({
            ...values,
            dateOfBirth: dateOfBirth.replaceAll(' / ', '-'),
          });
          hideDialog();
        },
      });

      updateNotificationSettings({
        marketing: advertisement,
      });
      return;
    }

    updateNotificationSettings({
      marketing: true,
    });
    mutate({
      ...values,
      dateOfBirth: dateOfBirth.replaceAll(' / ', '-'),
    });
  }, []);

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
            <View key={label}>
              <Divider style={styles.menuDivider} />
              <Controller
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
                      <IconButton icon="chevron-right" iconColor={theme.COLORS.GRAY_SCALE.GRAY_40} size={16} />
                    )}
                  </Pressable>
                )}
              />
            </View>
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
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: isAos ? 24 : getBottomSpace() + 24,
    paddingHorizontal: 20,
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
    // marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    height: 56,
    backgroundColor: theme.COLORS.GRAY_SCALE.GRAY_80,
  },
  buttonText: {
    ...theme.TYPOGRAPHY.TITLE_2,
    color: theme.COLORS.DEFAULT.WHITE,
  },
});

export { ServiceAgree };
