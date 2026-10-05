import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { Clipboard, Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import * as Sentry from '@sentry/react-native';

import { queryClient } from 'services/queryClient';
import { apiClient } from 'services/apiClient';

import { DevToolsButton } from 'components/__dev__/DevToolsButton';
import { useDevToolsStore, type ApiFailureMode } from 'components/__dev__/devToolsStore';
import { navigationRef } from '../../../../App';
import { version as appVersion } from '../../../../package.json';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function getNavigationTree(state: any, depth = 0): ReactNode[] {
  if (!state) {
    return [];
  }

  const nodes: ReactNode[] = [];
  const routes = state.routes || [];
  const activeIndex = state.index ?? 0;

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const isActive = i === activeIndex;
    const indent = depth * 16;
    const key = `${route.key}-${depth}`;

    nodes.push(
      <View key={key} style={[styles.routeRow, { marginLeft: indent }]}>
        <Text style={[styles.routeIcon, isActive && styles.activeRouteIcon]}>{isActive ? '▸' : '▹'}</Text>
        <Text style={[styles.routeName, isActive && styles.activeRouteName]}>{route.name}</Text>
        {route.params && Object.keys(route.params).length > 0 && (
          <Text style={styles.routeParams}>{` ${JSON.stringify(route.params)}`}</Text>
        )}
      </View>,
    );

    // 중첩된 네비게이션 상태 재귀 탐색
    if (route.state) {
      nodes.push(...getNavigationTree(route.state, depth + 1));
    }
  }

  return nodes;
}

const ElementsTab = () => {
  const apiFailureMode = useDevToolsStore(s => s.apiFailureMode);
  const setApiFailureMode = useDevToolsStore(s => s.setApiFailureMode);

  /* 모드를 바꾸고 모든 조회를 초기 상태(데이터 없음)로 돌려, 보고 있는 화면의 조회를 바로 다시 보낸다 */
  const changeApiFailureMode = (mode: ApiFailureMode) => {
    setApiFailureMode(mode);
    queryClient.resetQueries();
  };
  const window = Dimensions.get('window');
  const screen = Dimensions.get('screen');
  const navState = navigationRef.isReady() ? navigationRef.getRootState() : null;
  const currentRoute = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
  const [fcmToken, setFcmToken] = useState<string>('(loading...)');

  const loadFcmToken = useCallback(async () => {
    const authStatus = await messaging().hasPermission();
    if (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      messaging()
        .getToken()
        .then(setFcmToken)
        .catch(() => setFcmToken('(unavailable)'));
    } else {
      setFcmToken('(permission not granted)');
    }
  }, []);

  useEffect(() => {
    loadFcmToken();
  }, [loadFcmToken]);

  return (
    <View style={styles.container}>
      {/* 앱 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.card}>
          <Row label="Version" value={appVersion} />
          <View style={styles.fcmRow}>
            <Text style={styles.label}>FCM Token</Text>
            <View style={styles.fcmButtons}>
              <DevToolsButton
                label="Copy"
                doneLabel="Copied"
                color="#98C379"
                onPress={() => Clipboard.setString(fcmToken)}
              />
              <DevToolsButton label="Refresh" doneLabel="Refreshed" color="#61DAFB" onPress={loadFcmToken} />
            </View>
          </View>
          <Text style={styles.fcmValue}>{fcmToken}</Text>
        </View>
      </View>

      {/* Sentry 전송 테스트 — Metro(__DEV__) 빌드는 전송이 꺼져 있어 dev 릴리즈 빌드에서만 실제 전송된다 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sentry</Text>
        <View style={[styles.card, styles.sentryButtons]}>
          <DevToolsButton
            label="JS Error"
            doneLabel="Thrown"
            onPress={() => {
              /*
               * 핸들러 안에서 throw하면 React가 삼킨다 — 전역 핸들러로 보내기 위해 틱을 넘긴다.
               * 릴리즈 빌드에서는 Sentry가 이벤트를 남긴 뒤 기본 핸들러가 실행되어 앱이 종료된다(정상).
               */
              setTimeout(() => {
                throw new Error('[DevTools] Sentry JS 에러 테스트');
              }, 0);
            }}
          />
          <DevToolsButton
            label="API Error"
            doneLabel="Sent"
            color="#E5C07B"
            onPress={async () => {
              /* 존재하지 않는 엔드포인트 → 404 → 전역 에러 구독 → captureApiError(warning) 경로 검증 */
              await queryClient
                .fetchQuery({
                  queryKey: ['__dev__', 'sentry-test', Date.now()],
                  queryFn: () => apiClient.get('v1/__dev__/sentry-test'),
                  retry: false,
                })
                .catch(() => {});
            }}
          />
          <DevToolsButton label="Native Crash" doneLabel="…" color="#C678DD" onPress={() => Sentry.nativeCrash()} />
        </View>
      </View>

      {/*
       * 에러 화면 확인 — 모드를 바꾸면 캐시도 함께 비운다. 그래야 보고 있는 화면의 핵심 데이터가
       * 첫 로딩으로 다시 요청되어, 실패 모드면 에러 화면이 뜬다(react-query 재시도 3회 후, 약 7초).
       * OFF로 바꾼 뒤 에러 화면의 "다시 시도하기"를 누르면 복구된다.
       */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Error Screen</Text>
        <View style={styles.card}>
          <Row label="API 강제 실패" value={apiFailureMode} />
          <View style={[styles.sentryButtons, styles.errorScreenButtons]}>
            <DevToolsButton label="OFF" doneLabel="OFF" color="#98C379" onPress={() => changeApiFailureMode('OFF')} />
            <DevToolsButton
              label="NETWORK"
              doneLabel="ON"
              color="#E5C07B"
              onPress={() => changeApiFailureMode('NETWORK')}
            />
            <DevToolsButton label="SERVER" doneLabel="ON" onPress={() => changeApiFailureMode('SERVER')} />
          </View>
        </View>
      </View>

      {/* 네비게이션 트리 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation Tree</Text>
        <View style={styles.card}>
          {navState ? getNavigationTree(navState) : <Text style={styles.dimText}>Navigation not ready</Text>}
        </View>
      </View>

      {/* 현재 라우트 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Route</Text>
        <View style={styles.card}>
          <Row label="Name" value={currentRoute?.name ?? '-'} />
          {currentRoute?.params && <Row label="Params" value={JSON.stringify(currentRoute.params, null, 2)} />}
        </View>
      </View>

      {/* 화면 크기 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dimensions</Text>
        <View style={styles.card}>
          <Row label="Window" value={`${window.width} × ${window.height}`} />
          <Row label="Screen" value={`${screen.width} × ${screen.height}`} />
          <Row label="Scale" value={`${window.scale}x`} />
          <Row label="Font Scale" value={`${window.fontScale}`} />
        </View>
      </View>

      {/* 플랫폼 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platform</Text>
        <View style={styles.card}>
          <Row label="OS" value={Platform.OS} />
          <Row label="Version" value={`${Platform.Version}`} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    color: '#61DAFB',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  fcmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  fcmButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sentryButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  errorScreenButtons: {
    marginTop: 8,
    flexWrap: 'wrap',
  },
  fcmValue: {
    color: '#EEE',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  label: {
    color: '#AAA',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  value: {
    color: '#EEE',
    fontSize: 12,
    fontFamily: 'monospace',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  dimText: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  routeIcon: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'monospace',
    marginRight: 6,
  },
  activeRouteIcon: {
    color: '#61DAFB',
  },
  routeName: {
    color: '#CCC',
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  activeRouteName: {
    color: '#FFF',
    fontWeight: '700',
  },
  routeParams: {
    marginLeft: 12,
    color: '#888',
    fontSize: 10,
    fontFamily: 'monospace',
    flexShrink: 1,
  },
});

export { ElementsTab };
