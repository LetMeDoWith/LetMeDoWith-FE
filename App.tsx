import React, { useContext, useEffect, useRef } from 'react';
import { ScrollView, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
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
import { IS_DEV_MODE } from 'utils/env';
import { useLoadingOverlayStore } from 'stores/loadingOverlayStore';
import { GlobalSnackbar } from 'components/common/GlobalSnackbar';
import { showSnackbar, SNACKBAR_TYPE } from 'stores/snackbarStore';

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
import { linking } from 'utils/deepLink';
import { NOTIFICATION_QUERY_KEY } from 'constants/queries';
import { ErrorStatusCodeEnum } from 'schemes/shared/enum';
import { AppStateProvider, AppStateContext, useAppState } from 'hooks/shared/useAppState';

export const navigationRef = createNavigationContainerRef();

const ENABLE_DEVTOOLS = IS_DEV_MODE;

const DevToolsRoot = ENABLE_DEVTOOLS ? require('components/__dev__/DevToolsRoot').DevToolsRoot : () => null;

dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

// OS 폰트 크기 설정 무시 (앱 내 고정 폰트 크기 사용)
(Text as any).defaultProps = {
  ...(Text as any).defaultProps,
  allowFontScaling: false,
};

(TextInput as any).defaultProps = {
  ...(TextInput as any).defaultProps,
  allowFontScaling: false,
};

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

// API 에러 발생 시 공통으로 노출하는 스낵바 메시지
const API_ERROR_SNACKBAR_MESSAGE = '앗 잠시 문제가 생겼어요. 다시 시도해 주세요.';

/**
 * React Query의 전역 에러 핸들러
 * 모든 쿼리/뮤테이션에서 발생한 에러를 중앙에서 처리
 */
const subscribeListener = (event: QueryCacheNotifyEvent | MutationCacheNotifyEvent) => {
  if ('action' in event && event.action && event.action.type === 'error') {
    // 네트워크 에러(응답 없음)도 있으므로 옵셔널 체이닝으로 안전하게 접근
    const errorData = event.action.error?.response?.data;

    const {
      tokenInfo,
      authActions: { setIsNeedRefreshToken },
    } = useStore.getState();

    // 만료된 토큰 에러 → 리프레시 토큰이 유효하면 토큰 재발급 시도(스낵바 없이 조용히 처리)
    const isTokenExpiredError = errorData?.statusCode === ErrorStatusCodeEnum.enum.E302;
    if (isTokenExpiredError && tokenInfo.refresh?.token && dayjs().isBefore(tokenInfo.refresh?.expireAt)) {
      setIsNeedRefreshToken(true);
      return;
    }

    // 에러 타입에 따라 로깅
    if ('query' in event) {
      console.error('[QueryCacheNotifyEvent Error]:', errorData);
    } else if ('mutation' in event) {
      console.error('[MutationCacheNotifyEvent Error]:', errorData);
    } else {
      console.error('[Unknown Event Error]:', errorData);
    }

    // API 에러 공통 스낵바 노출(토큰 재발급 케이스는 위에서 return되어 제외됨)
    showSnackbar(API_ERROR_SNACKBAR_MESSAGE, { type: SNACKBAR_TYPE.ERROR });
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
  const isOverlaySuppressed = useLoadingOverlayStore(state => state.isSuppressed);
  // 자동 새로고침·당겨서 새로고침처럼 자체 로딩 표시가 있는 refetch 중에는 전역 오버레이를 숨긴다.
  const isLoading = isFetching + isMutating > 0 && !isOverlaySuppressed;

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
        // 포그라운드 메시지 수신 시 알림 목록 실시간 갱신
        onForegroundMessage: async () => {
          queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY.LIST });
        },
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
              <NavigationContainer ref={navigationRef} linking={linking} theme={DefaultTheme}>
                {isNeedSignUp ? <Signup /> : <HomeStackNavigator />}
              </NavigationContainer>
            </BottomSheetModalProvider>
          </KeyboardProvider>
        </SafeAreaProvider>
      ) : (
        <Login />
      )}
      {(!isHydrated || isLoading) && <LoadingOverlay />}
      <GlobalSnackbar />
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
