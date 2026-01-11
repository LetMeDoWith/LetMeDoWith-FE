import React, { useContext, useEffect, useRef } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import {
  MutationCacheNotifyEvent,
  QueryCacheNotifyEvent,
  QueryClient,
  QueryClientProvider,
  useIsFetching,
  useIsMutating,
} from '@tanstack/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import { Login } from 'screens/Login';
import { HomeStackNavigator } from 'components/navigators/Stack/Home';
import { ThemeContext } from 'hooks/shared/useTheme';
import { theme } from 'styles/theme';
import { Signup } from 'screens/Signup';
import { useStore } from 'stores/index';
import { DialogProvider } from 'components/common/Dialog/Provider';
import { LoadingOverlay } from 'components/common/LoadingOverlay';
import { useRefreshTokenQuery } from 'hooks/queries/auth/useRefreshTokenQuery';
import { initNotificationLayer } from 'utils/notification';
import { useAddNotificationToken } from 'hooks/queries/notification/useAddNotificationToken';
import { AppStateProvider, AppStateContext, useAppState } from 'hooks/shared/useAppState';

dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

/**
 * React Query의 전역 에러 핸들러
 * 모든 쿼리/뮤테이션에서 발생한 에러를 중앙에서 처리
 */
const subscribeListener = (event: QueryCacheNotifyEvent | MutationCacheNotifyEvent) => {
  if ('action' in event && event.action && event.action.type === 'error') {
    const errorData = event.action.error.response.data;
    const errorMessage = errorData.message;

    const {
      tokenInfo,
      authActions: { setIsNeedRefreshToken },
    } = useStore.getState();

    // 액세스 토큰이 만료 되고, refresh 토큰이 만료되지 않았을 경우 토큰 재발급 상태로 수정
    if (
      tokenInfo.access?.token &&
      dayjs().isAfter(tokenInfo.access?.expireAt) &&
      tokenInfo.refresh?.token &&
      dayjs().isBefore(tokenInfo.refresh?.expireAt)
    ) {
      setIsNeedRefreshToken(true);
      return;
    }

    // 에러 타입에 따라 Alert 표시 및 로깅
    if ('query' in event) {
      Alert.alert(`[QueryCacheNotifyEvent Error]: ${errorMessage}`);
      console.error('[QueryCacheNotifyEvent Error]:', errorData);
    } else if ('mutation' in event) {
      Alert.alert(`[MutationCacheNotifyEvent Error]: ${errorMessage}`);
      console.error('[MutationCacheNotifyEvent Error]:', errorData);
    } else {
      Alert.alert(`[Unknown Event Error]: ${errorMessage}`);
      console.error('[Unknown Event Error]:', errorData);
    }
  }
};

const queryClient = new QueryClient();

// 전역 에러 핸들링 구독 (모든 쿼리/뮤테이션)
queryClient.getQueryCache().subscribe(subscribeListener);
queryClient.getMutationCache().subscribe(subscribeListener);

function AppContent() {
  const {
    tokenInfo,
    isNeedRefreshToken,
    isLoggedIn,
    isNeedSignUp,
    isHydrated,
    authActions: { setTokenInfo, setIsLoggedIn, setIsNeedRefreshToken, setIsNeedSignUp, initAuthInfo },
  } = useStore(
    ({
      tokenInfo,
      isNeedRefreshToken,
      isLoggedIn,
      isNeedSignUp,
      isHydrated,
      authActions: { setTokenInfo, setIsLoggedIn, setIsNeedRefreshToken, setIsNeedSignUp, initAuthInfo },
    }) => ({
      tokenInfo,
      isNeedRefreshToken,
      isLoggedIn,
      isNeedSignUp,
      isHydrated,
      authActions: { setTokenInfo, setIsLoggedIn, setIsNeedRefreshToken, setIsNeedSignUp, initAuthInfo },
    }),
  );

  // 토큰 재발급 진행중 관련 flag 변수 (중복 요청 방지)
  const isTokenRefreshingRef = useRef(false);
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching + isMutating > 0;

  const { mutate: mutateRefreshToken } = useRefreshTokenQuery();
  const { mutate: mutateNotificationToken } = useAddNotificationToken();

  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('AppContent must be used within AppStateProvider');
  }
  const { subscribe: subscribeAppState } = context;

  /**
   * 앱이 foreground로 복귀할 때마다 토큰 만료 체크
   * useAppState 훅을 사용하여 AppState 변경 감지
   */
  useAppState(state => {
    if (state === 'active') {
      // 액세스 토큰이 만료 되고, refresh 토큰이 만료되지 않았을 경우 토큰 재발급 상태로 수정
      if (
        tokenInfo.access?.token &&
        dayjs().isAfter(tokenInfo.access?.expireAt) &&
        tokenInfo.refresh?.token &&
        dayjs().isBefore(tokenInfo.refresh?.expireAt)
      ) {
        setIsNeedRefreshToken(true);
      }
    }
  });

  /**
   * 초기 앱 진입 시 실행되는 로직
   * - 토큰 재발급
   * - FCM 알림 레이어 초기화
   */
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    // 토큰 재발급이 필요하고 아직 진행중이 아닐 때 실행
    if (!isTokenRefreshingRef.current && isNeedRefreshToken && tokenInfo.refresh?.token) {
      isTokenRefreshingRef.current = true;
      mutateRefreshToken(
        { refreshToken: tokenInfo.refresh.token },
        {
          onSettled: () => {
            isTokenRefreshingRef.current = false;
          },
        },
      );
    }

    // 회원가입이 완료되었을 경우 알림 레이어 초기화
    if (!isNeedSignUp) {
      initNotificationLayer({
        // 포그라운드 메시지 처리 (원하면 notifee 로컬 알림 등)
        onForegroundMessage: async message => {
          console.log('[FCM][FG] 메세지 수신: ', message);
        },
        // 토큰 변경 시 서버 동기화
        onTokenChanged: async newToken => {
          console.log('onTokenChanged: ', newToken);
          // 로그인 완료 & 회원가입 완료 상태에서만 토큰 갱신 요청
          if (!isLoggedIn || isNeedSignUp) {
            return;
          }

          try {
            mutateNotificationToken({ notificationToken: newToken });
          } catch (e) {
            // 서버 동기화 실패 시 로깅
            console.log('[FCM] update token failed', e);
          }
        },
        subscribeAppState,
      });
    }
  }, [
    tokenInfo,
    isNeedRefreshToken,
    isHydrated,
    isLoggedIn,
    isNeedSignUp,
    setIsLoggedIn,
    setIsNeedRefreshToken,
    setIsNeedSignUp,
    setTokenInfo,
    subscribeAppState,
  ]);

  // useEffect(() => {
  //   initAuthInfo();
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
            <AppStateProvider>
              <AppContent />
            </AppStateProvider>
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
