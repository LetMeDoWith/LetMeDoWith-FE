import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Controller, SubmitHandler, useFormContext } from 'react-hook-form';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Checkbox, Divider } from 'react-native-paper';

import { theme } from 'styles/theme';

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

  const isButtonDisabled = useMemo(() => {
    if (ageAgree && serviceAgree && privateAgree) {
      return false;
    }

    if (allChecked) {
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

  return (
    <View style={styles.container}>
      <View style={styles.inputSection}>
        <View style={styles.titleWrap}>
          <Text style={styles.titleBold}>서비스 이용 약관에</Text>
          <Text style={styles.titleNormal}>동의해주세요</Text>
        </View>
        <Divider style={styles.topDivider} />
        <View style={styles.checkboxWrap}>
          {CHECKBOX_MAP_LIST.map(item => (
            <Controller
              key={item.label}
              name={item.label}
              control={control}
              render={() => (
                <View style={styles.formRow}>
                  <Checkbox.Android
                    color={theme.COLORS.PRIMARY.RED_500}
                    status={getCheckboxStatus(item.label)}
                    onPress={onPressCheckBox(item.label)}
                  />
                  <Text>{item.text}</Text>
                </View>
              )}
            />
          ))}
        </View>
        <Divider style={styles.bottomDivider} bold />
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
        <Text style={styles.buttonText}>가입 완료하기</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
    height:
      Platform.OS === 'android'
        ? Dimensions.get('window').height - getStatusBarHeight()
        : Dimensions.get('window').height - getStatusBarHeight() - 34,
  },
  inputSection: {
    // gap: 40,
  },
  titleWrap: {
    marginBottom: 38,
  },
  titleBold: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  titleNormal: {
    fontSize: 28,
    alignItems: 'center',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxWrap: {
    gap: 10,
  },
  topDivider: { marginBottom: 20 },
  bottomDivider: { marginTop: 20 },

  button: {
    marginBottom: 32,
    marginHorizontal: 24,
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
