import React, { Fragment, useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';

import { STORAGE_KEY } from 'stores/secure';
import { DevToolsButton } from 'components/__dev__/DevToolsButton';

type StorageData = Record<string, unknown> | null;

function formatValue(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'boolean' || typeof value === 'number') {
    return String(value);
  }
  return JSON.stringify(value, null, 2);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const StorageTab = () => {
  const [data, setData] = useState<StorageData>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const raw = await EncryptedStorage.getItem(STORAGE_KEY.MERGED_INFO);
      if (raw) {
        const parsed = JSON.parse(raw);
        delete parsed.version;
        setData(parsed.state ?? parsed);
        setError(null);
      } else {
        setData(null);
        setError('(empty)');
      }
    } catch (e) {
      setData(null);
      setError(`Error: ${e}`);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <View>
      <View style={styles.toolbar}>
        <Text style={styles.sectionTitle}>EncryptedStorage</Text>
        <DevToolsButton label="Refresh" doneLabel="Refreshed" color="#61DAFB" onPress={loadData} />
      </View>

      <View style={styles.table}>
        {/* 테이블 헤더 */}
        <View style={styles.headerRow}>
          <View style={styles.keyCell}>
            <Text style={styles.headerText}>Key</Text>
          </View>
          <View style={styles.valueCell}>
            <Text style={styles.headerText}>Value</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.row}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : data ? (
          Object.entries(data).map(([key, value]) =>
            isObject(value) ? (
              <Fragment key={key}>
                {/* 1depth: 그룹 헤더 */}
                <View style={styles.groupRow}>
                  <Text style={styles.groupText}>{key}</Text>
                </View>
                {/* 2depth: 하위 항목 */}
                {Object.entries(value).map(([childKey, childValue]) => (
                  <View key={`${key}.${childKey}`} style={styles.row}>
                    <View style={styles.keyCellIndented}>
                      <Text style={styles.keyText}>{childKey}</Text>
                    </View>
                    <View style={styles.valueCell}>
                      <Text style={styles.valueText}>{formatValue(childValue)}</Text>
                    </View>
                  </View>
                ))}
              </Fragment>
            ) : (
              <View key={key} style={styles.row}>
                <View style={styles.keyCell}>
                  <Text style={styles.groupText}>{key}</Text>
                </View>
                <View style={styles.valueCell}>
                  <Text style={styles.valueText}>{formatValue(value)}</Text>
                </View>
              </View>
            ),
          )
        ) : (
          <View style={styles.row}>
            <Text style={styles.dimText}>(loading...)</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#61DAFB',
    fontSize: 13,
    fontWeight: '700',
  },
  table: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#383838',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  headerText: {
    color: '#999',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupRow: {
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#444',
  },
  groupText: {
    color: '#61DAFB',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#383838',
    paddingVertical: 7,
    minHeight: 32,
  },
  keyCell: {
    width: '40%',
    paddingLeft: 8,
    paddingRight: 4,
    justifyContent: 'center',
  },
  keyCellIndented: {
    width: '40%',
    paddingLeft: 20,
    paddingRight: 4,
    justifyContent: 'center',
  },
  valueCell: {
    flex: 1,
    paddingRight: 8,
    justifyContent: 'center',
  },
  keyText: {
    color: '#E5C07B',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  valueText: {
    color: '#D4D4D4',
    fontSize: 10,
    fontFamily: 'monospace',
    lineHeight: 15,
  },
  dimText: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'monospace',
    padding: 8,
  },
  errorText: {
    color: '#E06C75',
    fontSize: 11,
    fontFamily: 'monospace',
    padding: 8,
  },
});

export { StorageTab };
