import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { SignupStackNavigator } from 'components/navigators/Stack/Signup';

const Signup = () => {
  const methods = useForm({
    defaultValues: {
      nickname: '',
      birthday: '',
      gender: '',
      age_agree: false,
      service_agree: false,
      private_agree: false,
      marketing_agree: false,
    },
  });

  return (
    <FormProvider {...methods}>
      <SignupStackNavigator />
    </FormProvider>
  );
};

export { Signup };
