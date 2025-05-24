import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { QueryClient, QueryClientProvider, useIsFetching, useIsMutating } from '@tanstack/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Login } from 'screens/Login';
import { HomeStackNavigator } from 'components/navigators/Stack/Home';
import { ThemeContext } from 'hooks/shared/useTheme';
import { theme } from 'styles/theme';
import { Signup } from 'screens/Signup';
import { useAuthStore } from 'stores/auth';
import { DialogProvider } from 'components/common/Dialog/Provider';
import { LoadingOverlay } from 'components/common/LoadingOverlay';

const queryClient = new QueryClient();

function AppContent() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching + isMutating > 0;

  const { isLoggedIn, isNeedSignUp } = useAuthStore(({ isLoggedIn, isNeedSignUp }) => ({
    isLoggedIn,
    isNeedSignUp,
  }));

  return (
    <View style={styles.container}>
      {!isLoggedIn ? (
        <SafeAreaProvider>
          <KeyboardProvider>
            <GestureHandlerRootView style={styles.gestureHandlerRoot}>
              <BottomSheetModalProvider>
                <NavigationContainer>{isNeedSignUp ? <Signup /> : <HomeStackNavigator />}</NavigationContainer>
              </BottomSheetModalProvider>
            </GestureHandlerRootView>
          </KeyboardProvider>
        </SafeAreaProvider>
      ) : (
        <Login />
      )}
      {isLoading && <LoadingOverlay />}
    </View>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={theme}>
        <PaperProvider>
          <DialogProvider>
            <AppContent />
          </DialogProvider>
        </PaperProvider>
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gestureHandlerRoot: {
    flex: 1,
  },
});

export default App;
