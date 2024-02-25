import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import Config from 'react-native-config';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { Login } from '@screens/Login';

function App(): React.JSX.Element {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  return (
    <SafeAreaView>
      <Login />
    </SafeAreaView>
  );
}

export default App;
