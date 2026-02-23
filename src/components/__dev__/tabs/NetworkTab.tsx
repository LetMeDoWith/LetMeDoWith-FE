import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';

import { DevToolsButton } from 'components/__dev__/DevToolsButton';
import { useDevToolsStore } from 'components/__dev__/devToolsStore';
import type { NetworkEntry, NetworkStatus } from 'components/__dev__/types';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;

const STATUS_COLORS: Record<NetworkStatus, string> = {
  pending: '#888',
  fulfilled: '#98C379',
  rejected: '#E06C75',
};

function getStatusColor(entry: NetworkEntry): string {
  if (entry.status === 'pending') {
    return STATUS_COLORS.pending;
  }
  if (entry.statusCode && entry.statusCode >= 200 && entry.statusCode < 300) {
    return '#98C379';
  } // green
  if (entry.statusCode && entry.statusCode >= 400 && entry.statusCode < 500) {
    return '#E5C07B';
  } // yellow
  if (entry.statusCode && entry.statusCode >= 500) {
    return '#E06C75';
  } // red
  return STATUS_COLORS[entry.status];
}

function getShortUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

const NetworkDetail = ({ entry }: { entry: NetworkEntry }) => {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailTitle}>Request Headers</Text>
      <Text style={styles.detailJson}>
        {entry.requestHeaders ? JSON.stringify(entry.requestHeaders, null, 2) : '(none)'}
      </Text>

      <Text style={styles.detailTitle}>Request Body</Text>
      <Text style={styles.detailJson}>{entry.requestBody ? JSON.stringify(entry.requestBody, null, 2) : '(none)'}</Text>

      <Text style={styles.detailTitle}>Response Headers</Text>
      <Text style={styles.detailJson}>
        {entry.responseHeaders ? JSON.stringify(entry.responseHeaders, null, 2) : '(none)'}
      </Text>

      <Text style={styles.detailTitle}>Response Body</Text>
      <Text style={styles.detailJson}>
        {entry.responseBody ? JSON.stringify(entry.responseBody, null, 2) : '(none)'}
      </Text>
    </View>
  );
};

function NetworkItem({ item, expanded, onToggle }: { item: NetworkEntry; expanded: boolean; onToggle: () => void }) {
  const color = getStatusColor(item);

  return (
    <Pressable onPress={onToggle}>
      <View style={styles.row}>
        <Text style={styles.toggle}>{expanded ? '▾' : '▸'}</Text>
        <Text style={[styles.method, { color }]}>{item.method}</Text>
        <Text style={styles.url}>{getShortUrl(item.url)}</Text>
        <Text style={[styles.statusCode, { color: item.status === 'pending' ? '#E5C07B' : color }]}>
          {item.status === 'pending' ? 'PENDING' : item.statusCode ?? 'ERR'}
        </Text>
        <Text style={styles.duration}>{item.duration != null ? `${item.duration}ms` : '-'}</Text>
      </View>
      {expanded && <NetworkDetail entry={item} />}
    </Pressable>
  );
}

const NetworkTab = () => {
  const networkRequests = useDevToolsStore(s => s.networkRequests);
  const clearNetworkRequests = useDevToolsStore(s => s.clearNetworkRequests);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredRequests = useMemo(
    () => (activeFilter ? networkRequests.filter(req => req.method === activeFilter) : networkRequests),
    [networkRequests, activeFilter],
  );

  const renderItem = useCallback(
    ({ item }: { item: NetworkEntry }) => (
      <NetworkItem
        item={item}
        expanded={expandedId === item.id}
        onToggle={() => setExpandedId(prev => (prev === item.id ? null : item.id))}
      />
    ),
    [expandedId],
  );

  const keyExtractor = useCallback((item: NetworkEntry) => String(item.id), []);

  const ListHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        <View style={styles.toolbar}>
          <Text style={styles.count}>{filteredRequests.length} requests</Text>
          <DevToolsButton label="Clear" doneLabel="Cleared" onPress={clearNetworkRequests} />
        </View>
        <View style={styles.filterRow}>
          {HTTP_METHODS.map(method => {
            const isActive = activeFilter === method;
            return (
              <Pressable
                key={method}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(isActive ? null : method)}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{method}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    ),
    [filteredRequests.length, clearNetworkRequests, activeFilter],
  );

  return (
    <BottomSheetFlatList
      data={filteredRequests}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeader}
      initialNumToRender={20}
      maxToRenderPerBatch={15}
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
  filterChipActive: {
    backgroundColor: 'rgba(97,218,251,0.12)',
    borderColor: '#61DAFB',
  },
  filterText: {
    color: '#888',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#61DAFB',
  },
  count: {
    color: '#888',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  toggle: {
    color: '#888',
    fontSize: 16,
    fontFamily: 'monospace',
    width: 20,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  method: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    width: 42,
  },
  url: {
    flex: 1,
    color: '#D4D4D4',
    fontSize: 11,
    fontFamily: 'monospace',
    marginHorizontal: 6,
  },
  statusCode: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    width: 52,
    textAlign: 'right',
  },
  duration: {
    color: '#888',
    fontSize: 10,
    fontFamily: 'monospace',
    width: 50,
    textAlign: 'right',
  },
  detail: {
    backgroundColor: '#252525',
    padding: 10,
    borderRadius: 6,
    marginBottom: 4,
  },
  detailTitle: {
    color: '#61DAFB',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  detailJson: {
    color: '#AAA',
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 14,
  },
});

export { NetworkTab };
