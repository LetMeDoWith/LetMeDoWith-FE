import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { SignupStackNavigator } from 'components/navigators/Stack/Signup';
import type { signUpRequestSchemeType } from 'types/member/scheme/api';

const Signup = () => {
  const methods = useForm<signUpRequestSchemeType>({
    defaultValues: {
      nickname: '',
      dateOfBirth: '',
      gender: '',
      agreements: {
        termsOfAgree: false,
        privacy: false,
        advertisement: false,
      },
    },
  });

  return (
    <FormProvider {...methods}>
      <SignupStackNavigator />
    </FormProvider>
  );
};

export { Signup };
