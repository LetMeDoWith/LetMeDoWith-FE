import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';
import { DevToolsButton } from 'components/__dev__/DevToolsButton';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useDevToolsStore } from 'components/__dev__/devToolsStore';
import type { ConsoleEntry, LogLevel } from 'components/__dev__/types';

const LOG_LEVELS: LogLevel[] = ['log', 'info', 'warn', 'error'];

const LEVEL_COLORS: Record<LogLevel, string> = {
  log: '#D4D4D4',
  info: '#61DAFB',
  warn: '#E5C07B',
  error: '#E06C75',
};

const LEVEL_BG: Record<LogLevel, string> = {
  log: 'transparent',
  info: 'transparent',
  warn: 'rgba(229,192,123,0.08)',
  error: 'rgba(224,108,117,0.08)',
};

function LogItem({ item }: { item: ConsoleEntry }) {
  const color = LEVEL_COLORS[item.level];
  const bg = LEVEL_BG[item.level];

  return (
    <View style={[styles.logRow, { backgroundColor: bg }]}>
      <Text style={styles.timestamp}>{dayjs(item.timestamp).format('HH:mm:ss.SSS')}</Text>
      <Text style={[styles.level, { color }]}>{item.level.toUpperCase().padEnd(5)}</Text>
      <Text style={[styles.message, { color }]} numberOfLines={8}>
        {item.args.join(' ')}
      </Text>
    </View>
  );
}

const ConsoleTab = () => {
  const consoleLogs = useDevToolsStore(s => s.consoleLogs);
  const clearConsoleLogs = useDevToolsStore(s => s.clearConsoleLogs);
  const [activeFilter, setActiveFilter] = useState<LogLevel | null>(null);

  const filteredLogs = useMemo(
    () => (activeFilter ? consoleLogs.filter(log => log.level === activeFilter) : consoleLogs),
    [consoleLogs, activeFilter],
  );

  const renderItem = useCallback(({ item }: { item: ConsoleEntry }) => <LogItem item={item} />, []);

  const keyExtractor = useCallback((item: ConsoleEntry) => String(item.id), []);

  const ListHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        <View style={styles.toolbar}>
          <Text style={styles.count}>{filteredLogs.length} logs</Text>
          <DevToolsButton label="Clear" doneLabel="Cleared" onPress={clearConsoleLogs} />
        </View>
        <View style={styles.filterRow}>
          {LOG_LEVELS.map(level => {
            const isActive = activeFilter === level;
            const color = LEVEL_COLORS[level];
            return (
              <Pressable
                key={level}
                style={[styles.filterChip, isActive && { backgroundColor: color + '22', borderColor: color }]}
                onPress={() => setActiveFilter(isActive ? null : level)}
              >
                <Text style={[styles.filterText, { color: isActive ? color : '#888' }]}>{level.toUpperCase()}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    ),
    [filteredLogs.length, clearConsoleLogs, activeFilter],
  );

  return (
    <BottomSheetFlatList
      data={filteredLogs}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeader}
      initialNumToRender={30}
      maxToRenderPerBatch={20}
      windowSize={11}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    padding: 12,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 8,
    gap: 8,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#444',
  },
  filterText: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  count: {
    color: '#888',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  logRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  timestamp: {
    color: '#666',
    fontSize: 10,
    fontFamily: 'monospace',
    marginRight: 6,
    minWidth: 80,
  },
  level: {
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    marginRight: 6,
    minWidth: 40,
  },
  message: {
    fontSize: 11,
    fontFamily: 'monospace',
    flexShrink: 1,
    flex: 1,
  },
});

export { ConsoleTab };
