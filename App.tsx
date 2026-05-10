import React, { useContext, useEffect, useRef } from 'react';
import { Alert, ScrollView, FlatList, StyleSheet, View } from 'react-native';
import { NavigationContainer, DefaultTheme, createNavigationContainerRef } from '@react-navigation/native';
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
import Config from 'react-native-config';

import { Login } from 'screens/Login';
import { HomeStackNavigator } from 'components/navigators/Stack/Home';
import { ThemeContext } from 'hooks/shared/useTheme';
import { theme } from 'styles/theme';
import { Signup } from 'screens/Signup';
import { useStore } from 'stores/index';
import { DialogProvider, useDialog } from 'components/common/Dialog/Provider';
import { LoadingOverlay } from 'components/common/LoadingOverlay';
import { useRefreshTokenQuery } from 'hooks/queries/auth/useRefreshTokenQuery';
import { initNotificationLayer } from 'utils/notification';
import { useAddNotificationToken } from 'hooks/queries/notification/useAddNotificationToken';
import { AppStateProvider, AppStateContext, useAppState } from 'hooks/shared/useAppState';

export const navigationRef = createNavigationContainerRef();

const ENABLE_DEVTOOLS = __DEV__ || Config.ENABLE_DEVTOOLS === 'true';

const DevToolsRoot = ENABLE_DEVTOOLS ? require('components/__dev__/DevToolsRoot').DevToolsRoot : () => null;

dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

(ScrollView as any).defaultProps = {
  ...(ScrollView as any).defaultProps,
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
};

(FlatList as any).defaultProps = {
  ...(FlatList as any).defaultProps,
  showsVerticalScrollIndicator: false,
  showsHorizontalScrollIndicator: false,
};

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
    authActions: { setIsNeedRefreshToken, initAuthInfo },
  } = useStore(
    ({
      tokenInfo,
      isNeedRefreshToken,
      isLoggedIn,
      isNeedSignUp,
      isHydrated,
      authActions: { setIsNeedRefreshToken, initAuthInfo },
    }) => ({
      tokenInfo,
      isNeedRefreshToken,
      isLoggedIn,
      isNeedSignUp,
      isHydrated,
      authActions: { setIsNeedRefreshToken, initAuthInfo },
    }),
  );

  // 토큰 재발급 진행중 관련 flag 변수 (중복 요청 방지)
  const isTokenRefreshingRef = useRef(false);
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching + isMutating > 0;

  const { mutate: mutateRefreshToken } = useRefreshTokenQuery();
  const { mutate: mutateNotificationToken } = useAddNotificationToken();
  const { showDialog, hideDialog } = useDialog();

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
    if (state === 'active' && tokenInfo.access?.token && dayjs().isAfter(tokenInfo.access?.expireAt)) {
      if (tokenInfo.refresh?.token && dayjs().isBefore(tokenInfo.refresh?.expireAt)) {
        // 액세스 토큰 만료, refresh 토큰 유효 → 토큰 재발급
        setIsNeedRefreshToken(true);
      } else {
        // 액세스 토큰, refresh 토큰 모두 만료 → 로그아웃 처리
        initAuthInfo();
        showDialog({
          type: 'ALERT',
          title: '세션 만료',
          content: '세션 정보가 만료되어\n로그인 페이지로 이동합니다.',
          handleAlertButton: hideDialog,
        });
      }
    }
  });

  /**
   * 토큰 재발급 로직
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
  }, [isHydrated, isNeedRefreshToken, tokenInfo.refresh?.token]);

  /**
   * 알림 레이어 초기화 (단 한 번만 실행)
   */
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    // 회원가입이 완료되었을 경우 알림 레이어 초기화
    if (!isNeedSignUp) {
      console.log('🚀 알림 레이어 초기화 시작');

      initNotificationLayer({
        // 토큰 변경 시 서버 동기화
        onTokenChanged: async newToken => {
          console.log('onTokenChanged: ', newToken);
          const { isLoggedIn, isNeedSignUp } = useStore.getState();

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
  }, [isHydrated, isNeedSignUp]);

  // useEffect(() => {
  //   initAuthInfo();
  // }, []);

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <SafeAreaProvider>
          <KeyboardProvider>
            <BottomSheetModalProvider>
              <NavigationContainer ref={navigationRef} theme={DefaultTheme}>
                {isNeedSignUp ? <Signup /> : <HomeStackNavigator />}
              </NavigationContainer>
            </BottomSheetModalProvider>
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
    <GestureHandlerRootView style={styles.container}>
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
      {ENABLE_DEVTOOLS && (
        <View style={styles.devToolsContainer} pointerEvents="box-none">
          <DevToolsRoot />
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  devToolsContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
  },
});

export default App;
