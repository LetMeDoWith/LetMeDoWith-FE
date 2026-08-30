import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import { theme } from 'styles/theme';

interface Props {
  label?: string;
  placeholder?: string;
}

const Input = ({ label = '', placeholder = '' }: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({});
  return (
    <View style={styles.container}>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput style={styles.input} placeholder={placeholder} />
          </>
        )}
        name={label}
      />
      {errors?.label && <Text style={theme.TYPOGRAPHY.CAPTION1_BASIC}>에러</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    ...theme.TYPOGRAPHY.BODY_2,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 6,
    // TODO: theme 적용
    borderColor: '#DBDBDB',
    paddingHorizontal: 16,
  },
});

export { Input };
