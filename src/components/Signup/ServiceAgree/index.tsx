import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Controller, SubmitHandler, useFormContext } from 'react-hook-form';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Checkbox, Divider, IconButton } from 'react-native-paper';
import { getBottomSpace } from 'react-native-iphone-screen-helper';

import { theme } from 'styles/theme';
import { isAos } from 'utils/device';

const CHECKBOX_MAP_LIST = [
  { label: 'age_agree', text: '(필수) 만 14세 이상입니다.', isLinkable: false },
  { label: 'service_agree', text: '(필수) 서비스 이용약관 관련 동의', isLinkable: true },
  { label: 'private_agree', text: '(필수) 개인정보 처리 방침', isLinkable: true },
  { label: 'marketing_agree', text: '(선택) 광고성 정보 수신동의', isLinkable: true },
];

const ServiceAgree = () => {
  const [allChecked, setAllChecked] = useState<boolean>(false);
  const { handleSubmit, control, watch, setValue } = useFormContext();
  const ageAgree = watch('age_agree');
  const serviceAgree = watch('service_agree');
  const privateAgree = watch('private_agree');
  const marketingAgree = watch('marketing_agree');

  const isButtonDisabled = useMemo(() => {
    if (allChecked) {
      return false;
    }

    if (ageAgree && serviceAgree && privateAgree) {
      return false;
    }

    return true;
  }, [ageAgree, allChecked, privateAgree, serviceAgree]);

  const onSubmit: SubmitHandler<any> = useCallback(value => {
    Alert.alert(JSON.stringify(value, null, 2));
  }, []);

  const onPressCheckBox = useCallback(
    (label: string) => () => {
      if (watch(label)) {
        setValue(label, false);
        return;
      }
      setValue(label, true);
    },
    [setValue, watch],
  );

  const onPressAllCheckBox = useCallback(() => {
    if (allChecked) {
      setAllChecked(false);
      setValue('age_agree', false);
      setValue('service_agree', false);
      setValue('private_agree', false);
      setValue('marketing_agree', false);
      return;
    }
    setAllChecked(true);
    setValue('age_agree', true);
    setValue('service_agree', true);
    setValue('private_agree', true);
    setValue('marketing_agree', true);
  }, [allChecked, setValue]);

  const getCheckboxStatus = useCallback((label: string) => (watch(label) ? 'checked' : 'unchecked'), [watch]);

  useEffect(() => {
    if (ageAgree && serviceAgree && privateAgree && marketingAgree) {
      return;
    }
    setAllChecked(false);
  }, [ageAgree, serviceAgree, privateAgree, marketingAgree]);

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.titleWrap}>
          <Text style={styles.titleBold}>이용 약관에 동의해주시면</Text>
          <Text style={styles.titleNormal}>회원가입이 끝나요!</Text>
        </View>
        <Divider style={styles.divider} />
        <View>
          {CHECKBOX_MAP_LIST.map(({ label, text, isLinkable }) => (
            <Controller
              key={label}
              name={label}
              control={control}
              render={() => (
                <Pressable
                  style={[styles.menu, !isLinkable && { paddingVertical: 12 }]}
                  onPress={() => {
                    // TODO: 링크 및 랜딩 페이지 확정되면 onPress 핸들러 등록
                    console.log('click');
                  }}
                >
                  <View style={styles.formRow}>
                    <Checkbox.Android
                      color={theme.COLORS.PRIMARY.RED_500}
                      status={getCheckboxStatus(label)}
                      onPress={onPressCheckBox(label)}
                    />
                    <Text>{text}</Text>
                  </View>
                  {isLinkable && (
                    <IconButton icon="chevron-right" iconColor={theme.COLORS.GRAY_SCALE.GRAY_500} size={16} />
                  )}
                </Pressable>
              )}
            />
          ))}
        </View>
        <Divider style={styles.divider} />
        <View style={[styles.formRow, { marginTop: 20 }]}>
          <Checkbox.Android
            color={theme.COLORS.PRIMARY.RED_500}
            status={allChecked ? 'checked' : 'unchecked'}
            onPress={onPressAllCheckBox}
          />
          <Text>모두 동의합니다.</Text>
        </View>
      </View>
      <Pressable
        style={[styles.button, !isButtonDisabled && { backgroundColor: theme.COLORS.PRIMARY.RED_500 }]}
        onPress={handleSubmit(onSubmit)}
        disabled={isButtonDisabled}
      >
        <Text style={styles.buttonText}>회원가입 완료</Text>
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
    gap: 8,
  },
  titleBold: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  titleNormal: {
    fontSize: 24,
    alignItems: 'center',
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.COLORS.GRAY_SCALE.GRAY_500,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: { borderWidth: 0.3 },
  button: {
    marginBottom: 32,
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

export { ServiceAgree };
