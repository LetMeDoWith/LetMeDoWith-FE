import React, { useEffect, useReducer, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { queryClient } from 'services/queryClient';

/*
 * React Query 캐시 뷰어(개발용).
 * queryClient의 쿼리 캐시를 구독해 쿼리 목록·상태(fresh/stale/fetching)·관찰자 수·갱신 시각을 보여주고,
 * 행을 누르면 해당 쿼리의 data를 JSON으로 펼쳐 확인할 수 있다.
 */

const STATUS_COLOR: Record<string, string> = {
  success: '#4CAF50',
  error: '#F44336',
  pending: '#FFC107',
};

const formatTime = (timestamp: number) => {
  if (!timestamp) {
    return '-';
  }

  const date = new Date(timestamp);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const safeStringify = (data: unknown) => {
  try {
    const text = JSON.stringify(data, null, 2) ?? String(data);
    return text.length > 2000 ? `${text.slice(0, 2000)}\n… (truncated)` : text;
  } catch {
    return String(data);
  }
};

const ACTION_COLOR = {
  refetch: '#4CAF50',
  invalidate: '#FF9800',
  reset: '#BB86FC',
  remove: '#F44336',
};

interface ActionButtonProps {
  label: string;
  doneLabel: string;
  color: string;
  onPress: () => void | Promise<void>;
}

const ActionButton = ({ label, doneLabel, color, onPress }: ActionButtonProps) => {
  const scale = useSharedValue(1);
  const [done, setDone] = useState(false);
  const mountedRef = useRef(true);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

  const handlePress = async () => {
    // 눌렀을 때 살짝 줄었다가 스프링으로 튕겨 돌아오는 bounce 피드백
    scale.value = withSequence(withTiming(0.85, { duration: 70 }), withSpring(1, { damping: 6, stiffness: 220 }));

    try {
      // 실제 요청/동작이 끝날 때까지 대기한 뒤 완료(✓) 표시
      await onPress();
    } catch {
      // 개별 쿼리 에러는 전역 에러 핸들러가 처리하므로 여기선 무시
    }

    if (!mountedRef.current) {
      return;
    }
    setDone(true);
    setTimeout(() => {
      if (mountedRef.current) {
        setDone(false);
      }
    }, 900);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.actionButton, { borderColor: color }, animatedStyle]}>
        <Text style={[styles.actionText, { color }]}>{done ? `✓ ${doneLabel}` : label}</Text>
      </Animated.View>
    </Pressable>
  );
};

const QueryTab = () => {
  const [, forceUpdate] = useReducer(count => count + 1, 0);
  const [expandedHash, setExpandedHash] = useState<string | null>(null);

  /*
   * 캐시 변경마다 즉시 리렌더하면 잦은 fetch 시 과도하게 렌더되므로 최대 ~3회/초로 스로틀한다.
   */
  useEffect(() => {
    let scheduled = false;
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      if (scheduled) {
        return;
      }
      scheduled = true;
      setTimeout(() => {
        scheduled = false;
        forceUpdate();
      }, 300);
    });

    return unsubscribe;
  }, []);

  const queries = queryClient
    .getQueryCache()
    .getAll()
    .slice()
    .sort((a, b) => b.state.dataUpdatedAt - a.state.dataUpdatedAt);

  return (
    <View>
      <Text style={styles.count}>Queries: {queries.length}</Text>

      {queries.length === 0 && <Text style={styles.empty}>캐시된 쿼리가 없습니다.</Text>}

      {queries.map(query => {
        const { status, fetchStatus, dataUpdatedAt } = query.state;
        const isStale = query.isStale();
        const observers = query.getObserversCount();
        const expanded = expandedHash === query.queryHash;

        return (
          <Pressable
            key={query.queryHash}
            style={styles.row}
            onPress={() => setExpandedHash(expanded ? null : query.queryHash)}
          >
            <View style={styles.rowHeader}>
              <View style={[styles.dot, { backgroundColor: STATUS_COLOR[status] ?? '#888' }]} />
              <Text style={styles.key} numberOfLines={1}>
                {JSON.stringify(query.queryKey)}
              </Text>
              <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
            </View>

            <View style={styles.meta}>
              {fetchStatus === 'fetching' && <Text style={[styles.badge, styles.fetching]}>fetching</Text>}
              {fetchStatus === 'paused' && <Text style={[styles.badge, styles.paused]}>paused</Text>}
              <Text style={[styles.badge, isStale ? styles.stale : styles.fresh]}>{isStale ? 'stale' : 'fresh'}</Text>
              {observers === 0 && <Text style={[styles.badge, styles.inactive]}>inactive</Text>}
              <Text style={styles.metaText}>obs {observers}</Text>
              <Text style={styles.metaText}>{formatTime(dataUpdatedAt)}</Text>
            </View>

            {expanded && (
              <>
                <View style={styles.actions}>
                  <ActionButton
                    label="Refetch"
                    doneLabel="Refetched"
                    color={ACTION_COLOR.refetch}
                    onPress={() => queryClient.refetchQueries({ queryKey: query.queryKey, exact: true })}
                  />
                  <ActionButton
                    label="Invalidate"
                    doneLabel="Invalidated"
                    color={ACTION_COLOR.invalidate}
                    onPress={() => queryClient.invalidateQueries({ queryKey: query.queryKey, exact: true })}
                  />
                  <ActionButton
                    label="Reset"
                    doneLabel="Reset"
                    color={ACTION_COLOR.reset}
                    onPress={() => queryClient.resetQueries({ queryKey: query.queryKey, exact: true })}
                  />
                  <ActionButton
                    label="Remove"
                    doneLabel="Removed"
                    color={ACTION_COLOR.remove}
                    onPress={() => {
                      queryClient.removeQueries({ queryKey: query.queryKey, exact: true });
                      setExpandedHash(null);
                    }}
                  />
                </View>

                <Text style={styles.data}>{safeStringify(query.state.data)}</Text>
              </>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  count: {
    color: '#61DAFB',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  empty: {
    color: '#888',
    fontSize: 12,
  },
  row: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  key: {
    flex: 1,
    color: '#EEE',
    fontSize: 12,
    fontFamily: 'Courier',
  },
  chevron: {
    color: '#AAA',
    fontSize: 24,
    lineHeight: 24,
    marginLeft: 8,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  metaText: {
    color: '#888',
    fontSize: 10,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fetching: {
    color: '#1E1E1E',
    backgroundColor: '#61DAFB',
  },
  stale: {
    color: '#1E1E1E',
    backgroundColor: '#FFC107',
  },
  fresh: {
    color: '#FFF',
    backgroundColor: '#3A6A3A',
  },
  paused: {
    color: '#1E1E1E',
    backgroundColor: '#BB86FC',
  },
  inactive: {
    color: '#DDD',
    backgroundColor: '#555',
  },
  data: {
    color: '#CCC',
    fontSize: 11,
    fontFamily: 'Courier',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export { QueryTab };
