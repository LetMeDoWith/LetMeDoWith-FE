import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { apiClient } from 'services/apiClient';
import { setAnalyticsListener } from 'utils/analytics';
import { DevToolsFAB } from 'components/__dev__/DevToolsFAB';
import { DevToolsSheet } from 'components/__dev__/DevToolsSheet';
import { getNextAnalyticsId, useDevToolsStore } from 'components/__dev__/devToolsStore';
import {
  installConsoleInterceptor,
  uninstallConsoleInterceptor,
} from 'components/__dev__/interceptors/consoleInterceptor';
import {
  installApiFailureInterceptor,
  uninstallApiFailureInterceptor,
} from 'components/__dev__/interceptors/apiFailureInterceptor';
import {
  installNetworkInterceptor,
  uninstallNetworkInterceptor,
} from 'components/__dev__/interceptors/networkInterceptor';

const DevToolsRoot = () => {
  const isSheetOpen = useDevToolsStore(s => s.isSheetOpen);
  const setIsSheetOpen = useDevToolsStore(s => s.setIsSheetOpen);

  useEffect(() => {
    installConsoleInterceptor();
    installNetworkInterceptor(apiClient);
    /* 네트워크 탭 기록보다 먼저 실행되도록 나중에 등록한다(axios 요청 인터셉터는 역순 실행) */
    installApiFailureInterceptor(apiClient);
    setAnalyticsListener(entry => {
      useDevToolsStore.getState().pushAnalyticsLog({
        id: getNextAnalyticsId(),
        timestamp: Date.now(),
        ...entry,
      });
    });

    return () => {
      uninstallConsoleInterceptor();
      uninstallNetworkInterceptor(apiClient);
      uninstallApiFailureInterceptor(apiClient);
      setAnalyticsListener(null);
    };
  }, []);

  const handleFABPress = useCallback(() => {
    setIsSheetOpen(!isSheetOpen);
  }, [isSheetOpen, setIsSheetOpen]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <DevToolsFAB onPress={handleFABPress} />
      <DevToolsSheet />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
  },
});

export { DevToolsRoot };
