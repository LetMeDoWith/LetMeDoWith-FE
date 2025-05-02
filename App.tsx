import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, Portal } from 'react-native-paper';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Login } from 'screens/Login';
import { HomeStackNavigator } from 'components/navigators/Stack/Home';
import { ThemeContext } from 'hooks/shared/useTheme';
import { theme } from 'styles/theme';
import { Signup } from 'screens/Signup';
import { useAuthStore } from 'stores/auth';

function App(): React.JSX.Element {
  const queryClient = new QueryClient();
  const { isLoggedIn, isNeedSignUp } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={theme}>
        <PaperProvider>
          <Portal>
            <View style={styles.container}>
              {!isLoggedIn ? (
                <SafeAreaProvider>
                  <KeyboardProvider>
                    <NavigationContainer>{isNeedSignUp ? <Signup /> : <HomeStackNavigator />}</NavigationContainer>
                  </KeyboardProvider>
                </SafeAreaProvider>
              ) : (
                <Login />
              )}
            </View>
          </Portal>
        </PaperProvider>
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default App;
