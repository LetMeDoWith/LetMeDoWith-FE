import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { Clipboard, Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import messaging from '@react-native-firebase/messaging';

import { DevToolsButton } from 'components/__dev__/DevToolsButton';
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
