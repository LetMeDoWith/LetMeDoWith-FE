import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';

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
      {errors?.label && <Text>에러</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontSize: 14,
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
