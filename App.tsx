import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, Portal } from 'react-native-paper';

import { Login } from 'screens/Login';
import { HomeStackNavigator } from 'components/navigators/Stack/Home';
import { ThemeContext } from 'hooks/shared/useTheme';
import { theme } from 'styles/theme';
import { Signup } from 'screens/Signup';

function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isNeedSignUp] = useState<boolean>(true);

  return (
    <ThemeContext.Provider value={theme}>
      <PaperProvider>
        <Portal>
          <View style={styles.container}>
            {!isLoggedIn ? (
              <SafeAreaProvider>
                <NavigationContainer>{!isNeedSignUp ? <Signup /> : <HomeStackNavigator />}</NavigationContainer>
              </SafeAreaProvider>
            ) : (
              <Login setIsLoggedIn={setIsLoggedIn} />
            )}
          </View>
        </Portal>
      </PaperProvider>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default App;
