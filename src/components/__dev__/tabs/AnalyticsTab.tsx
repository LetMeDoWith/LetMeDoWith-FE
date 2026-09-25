import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';

import { DevToolsButton } from 'components/__dev__/DevToolsButton';
import { useDevToolsStore } from 'components/__dev__/devToolsStore';
import type { AnalyticsEntry } from 'components/__dev__/types';
import type { AnalyticsEventType } from 'utils/analytics';

/* 이벤트 타입별 색 — ConsoleTab의 LEVEL_COLORS 패턴 */
const TYPE_COLORS: Record<AnalyticsEventType, string> = {
  유입: '#E5C07B',
  조회: '#61DAFB',
  생성: '#98C379',
  상호작용: '#C678DD',
};

/* 파라미터 값은 문자열이면 따옴표로 감싸 숫자와 구분한다 */
const formatParamValue = (value: unknown) => (typeof value === 'string' ? `'${value}'` : String(value));

interface AnalyticsItemProps {
  item: AnalyticsEntry;
  expanded: boolean;
  onToggle: (id: number) => void;
}

function AnalyticsItem({ item, expanded, onToggle }: AnalyticsItemProps) {
  const color = TYPE_COLORS[item.type];
  const paramEntries = item.params ? Object.entries(item.params) : [];
  const hasParams = paramEntries.length > 0;

  const handlePress = useCallback(() => onToggle(item.id), [onToggle, item.id]);

  return (
    <Pressable onPress={handlePress} disabled={!hasParams}>
      <View style={styles.row}>
        {/* 파라미터가 없는 이벤트는 펼칠 게 없어 자리만 맞춘다 */}
        <Text style={styles.toggle}>{hasParams ? (expanded ? '▾' : '▸') : ''}</Text>
        <Text style={styles.timestamp}>{dayjs(item.timestamp).format('HH:mm:ss')}</Text>
        <View style={[styles.typeBadge, { borderColor: color }]}>
          <Text style={[styles.typeText, { color }]}>{item.type}</Text>
        </View>
        <Text style={[styles.name, { color }]}>{item.name}</Text>
      </View>
      {expanded && hasParams && (
        <View style={styles.detail}>
          {paramEntries.map(([key, value]) => (
            <View key={key} style={styles.paramRow}>
              <Text style={styles.paramKey}>{key}</Text>
              <Text style={styles.paramValue}>{formatParamValue(value)}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

const MemoAnalyticsItem = React.memo(AnalyticsItem);

const AnalyticsTab = () => {
  const analyticsLogs = useDevToolsStore(s => s.analyticsLogs);
  const clearAnalyticsLogs = useDevToolsStore(s => s.clearAnalyticsLogs);

  /* 여러 이벤트를 동시에 펼쳐 파라미터를 비교할 수 있게 id 집합으로 관리한다 */
  const [expandedIds, setExpandedIds] = useState<Set<number>>(() => new Set());

  const handleToggle = useCallback((id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    clearAnalyticsLogs();
    setExpandedIds(new Set());
  }, [clearAnalyticsLogs]);

  const renderItem = useCallback(
    ({ item }: { item: AnalyticsEntry }) => (
      <MemoAnalyticsItem item={item} expanded={expandedIds.has(item.id)} onToggle={handleToggle} />
    ),
    [expandedIds, handleToggle],
  );

  const keyExtractor = useCallback((item: AnalyticsEntry) => String(item.id), []);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.count}>{analyticsLogs.length} events</Text>
        <DevToolsButton label="Clear" doneLabel="Cleared" onPress={handleClear} />
      </View>
      <BottomSheetFlatList
        data={analyticsLogs}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        extraData={expandedIds}
        initialNumToRender={30}
        maxToRenderPerBatch={20}
        windowSize={11}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.empty}>아직 기록된 이벤트가 없습니다</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  count: {
    color: '#888',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  toggle: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'monospace',
    width: 14,
    textAlign: 'center',
  },
  timestamp: {
    color: '#666',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  typeBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  typeText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  name: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  detail: {
    paddingVertical: 6,
    paddingLeft: 22,
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  paramRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paramKey: {
    color: '#7F848E',
    fontSize: 11,
    fontFamily: 'monospace',
    minWidth: 150,
  },
  paramValue: {
    flex: 1,
    color: '#ABB2BF',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  empty: {
    color: '#7F848E',
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 24,
  },
});

export { AnalyticsTab };
