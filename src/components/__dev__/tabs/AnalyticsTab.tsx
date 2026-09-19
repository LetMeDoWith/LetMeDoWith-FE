import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';

import { DevToolsButton } from 'components/__dev__/DevToolsButton';
import { useDevToolsStore } from 'components/__dev__/devToolsStore';
import type { AnalyticsEntry } from 'components/__dev__/types';
import type { AnalyticsCategory } from 'utils/analytics';

/* 카테고리별 색 — ConsoleTab의 LEVEL_COLORS 패턴 */
const CATEGORY_COLORS: Record<AnalyticsCategory, string> = {
  유입: '#E5C07B',
  조회: '#61DAFB',
  생성: '#98C379',
  상호작용: '#C678DD',
};

function AnalyticsItem({ item }: { item: AnalyticsEntry }) {
  const color = CATEGORY_COLORS[item.category];

  return (
    <View style={styles.row}>
      <Text style={styles.timestamp}>{dayjs(item.timestamp).format('HH:mm:ss')}</Text>
      <View style={[styles.categoryBadge, { borderColor: color }]}>
        <Text style={[styles.categoryText, { color }]}>{item.category}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, { color }]}>{item.name}</Text>
        {item.params ? <Text style={styles.params}>{JSON.stringify(item.params)}</Text> : null}
      </View>
      <Text style={[styles.sentBadge, item.sent ? styles.sentYes : styles.sentNo]}>
        {item.sent ? '전송됨' : '기록만'}
      </Text>
    </View>
  );
}

const MemoAnalyticsItem = React.memo(AnalyticsItem);

const AnalyticsTab = () => {
  const analyticsLogs = useDevToolsStore(s => s.analyticsLogs);
  const clearAnalyticsLogs = useDevToolsStore(s => s.clearAnalyticsLogs);

  const renderItem = useCallback(({ item }: { item: AnalyticsEntry }) => <MemoAnalyticsItem item={item} />, []);

  const keyExtractor = useCallback((item: AnalyticsEntry) => String(item.id), []);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.count}>{analyticsLogs.length} events</Text>
        <DevToolsButton label="Clear" doneLabel="Cleared" onPress={clearAnalyticsLogs} />
      </View>
      <BottomSheetFlatList
        data={analyticsLogs}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
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
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  timestamp: {
    color: '#666',
    fontSize: 10,
    fontFamily: 'monospace',
    minWidth: 60,
  },
  categoryBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  body: {
    flex: 1,
  },
  name: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  params: {
    color: '#ABB2BF',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  sentBadge: {
    fontSize: 10,
    fontFamily: 'monospace',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  sentYes: {
    color: '#98C379',
    backgroundColor: 'rgba(152,195,121,0.15)',
  },
  sentNo: {
    color: '#7F848E',
    backgroundColor: 'rgba(127,132,142,0.15)',
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
