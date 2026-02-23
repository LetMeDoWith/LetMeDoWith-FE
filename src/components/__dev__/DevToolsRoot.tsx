import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { apiClient } from 'services/apiClient';
import { DevToolsFAB } from 'components/__dev__/DevToolsFAB';
import { DevToolsSheet } from 'components/__dev__/DevToolsSheet';
import { useDevToolsStore } from 'components/__dev__/devToolsStore';
import {
  installConsoleInterceptor,
  uninstallConsoleInterceptor,
} from 'components/__dev__/interceptors/consoleInterceptor';
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

    return () => {
      uninstallConsoleInterceptor();
      uninstallNetworkInterceptor(apiClient);
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
