import React, { useEffect } from 'react';
import { Alert, AppState, StyleSheet, View } from 'react-native';
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
import { useRefreshTokenQuery } from 'hooks/queries/auth/useRefreshTokenQuery';

const queryClient = new QueryClient();
// 전역 에러 핸들링(모든 쿼리/뮤테이션)
queryClient.getQueryCache().subscribe(event => {
  if ('action' in event && event.action && event.action.type === 'error') {
    const errorMessage = event.action.error.response.data.message;
    Alert.alert(`에러가 발생했습니다. ${errorMessage}`);
    console.error('Query Error:', errorMessage);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if ('action' in event && event.action && event.action.type === 'error') {
    const errorMessage = event.action.error.response.data.message;
    Alert.alert(`에러가 발생했습니다. ${errorMessage}`);
    console.error('Mutation Error:', errorMessage);
  }
});

function AppContent() {
  const {
    tokenInfo,
    isNeedRefreshToken,
    isLoggedIn,
    isNeedSignUp,
    isHydrated,
    setTokenInfo,
    setIsLoggedIn,
    setIsNeedRefreshToken,
    setIsNeedSignUp,
    removeTokenInfo,
  } = useAuthStore(
    ({
      tokenInfo,
      isNeedRefreshToken,
      isLoggedIn,
      isNeedSignUp,
      isHydrated,
      actions: { setTokenInfo, setIsLoggedIn, setIsNeedRefreshToken, setIsNeedSignUp, removeTokenInfo },
    }) => ({
      tokenInfo,
      isNeedRefreshToken,
      isLoggedIn,
      isNeedSignUp,
      isHydrated,
      setTokenInfo,
      setIsLoggedIn,
      setIsNeedRefreshToken,
      setIsNeedSignUp,
      removeTokenInfo,
    }),
  );

  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching + isMutating > 0;

  const { mutate: mutateRefreshToken } = useRefreshTokenQuery();

  // 초기 앱 진입 및 Foreground 복귀시마다 토큰 재발급 로직 수행여부 체크
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (isNeedRefreshToken && tokenInfo.refresh?.token) {
      mutateRefreshToken(
        { refreshToken: tokenInfo.refresh.token },
        {
          onSuccess: ({ data }) => {
            if (!data.atk || !data.rtk) {
              return;
            }
            // 토큰 재발급이 완료 되었을 경우
            setTokenInfo({ access: data.atk, refresh: data.rtk });
            setIsLoggedIn(true);
            setIsNeedRefreshToken(false);
            setIsNeedSignUp(false);
          },
        },
      );
    }

    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        if (isNeedRefreshToken && tokenInfo.refresh?.token) {
          mutateRefreshToken(
            { refreshToken: tokenInfo.refresh.token },
            {
              onSuccess: ({ data }) => {
                if (!data.atk || !data.rtk) {
                  return;
                }
                // 토큰 재발급이 완료 되었을 경우
                setTokenInfo({ access: data.atk, refresh: data.rtk });
                setIsLoggedIn(true);
                setIsNeedRefreshToken(false);
                setIsNeedSignUp(false);
              },
            },
          );
        }
      }
    });

    return () => subscription.remove();
  }, [
    tokenInfo,
    isNeedRefreshToken,
    isHydrated,
    setIsLoggedIn,
    setIsNeedRefreshToken,
    setIsNeedSignUp,
    setTokenInfo,
    mutateRefreshToken,
  ]);

  // useEffect(() => {
  //   removeTokenInfo();
  // }, []);

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
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
      {(!isHydrated || isLoading) && <LoadingOverlay />}
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
