import React, { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

import { useDevToolsStore } from 'components/__dev__/devToolsStore';
import type { DevToolsTab } from 'components/__dev__/types';
import { ElementsTab } from 'components/__dev__/tabs/ElementsTab';
import { ConsoleTab } from 'components/__dev__/tabs/ConsoleTab';
import { NetworkTab } from 'components/__dev__/tabs/NetworkTab';
import { StorageTab } from 'components/__dev__/tabs/StorageTab';
import { QueryTab } from 'components/__dev__/tabs/QueryTab';

const TABS: DevToolsTab[] = ['Elements', 'Console', 'Network', 'Storage', 'Query'];
const SNAP_POINTS = ['75%'];

const DevToolsSheet = () => {
  const sheetRef = useRef<BottomSheet>(null);
  const activeTab = useDevToolsStore(s => s.activeTab);
  const setActiveTab = useDevToolsStore(s => s.setActiveTab);
  const isSheetOpen = useDevToolsStore(s => s.isSheetOpen);
  const setIsSheetOpen = useDevToolsStore(s => s.setIsSheetOpen);

  // store의 isSheetOpen 변경 시 ref를 통해 직접 열기/닫기
  useEffect(() => {
    if (isSheetOpen) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [isSheetOpen]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    [],
  );

  // 스와이프로 닫았을 때 store 동기화
  const handleSheetChanges = useCallback(
    (index: number) => {
      setIsSheetOpen(index >= 0);
    },
    [setIsSheetOpen],
  );

  // Elements, Storage → ScrollView로 감싸기 (내부 FlatList 없음)
  // Console, Network → 자체 FlatList 사용 (ScrollView 불필요)
  const usesFlatList = activeTab === 'Console' || activeTab === 'Network';

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Elements':
        return <ElementsTab />;
      case 'Console':
        return <ConsoleTab />;
      case 'Network':
        return <NetworkTab />;
      case 'Storage':
        return <StorageTab />;
      case 'Query':
        return <QueryTab />;
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={SNAP_POINTS}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onChange={handleSheetChanges}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      {/* 탭 바 */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </Pressable>
        ))}
      </View>

      {/* 탭 콘텐츠
        - Console/Network: BottomSheetFlatList가 자체 스크롤 처리
        - Elements/Storage: BottomSheetScrollView로 감싸서 스크롤 */}
      {usesFlatList ? (
        renderTabContent()
      ) : (
        <BottomSheetScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {renderTabContent()}
        </BottomSheetScrollView>
      )}
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#1E1E1E',
  },
  handleIndicator: {
    backgroundColor: '#555',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#61DAFB',
  },
  tabText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#61DAFB',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 40,
  },
});

export { DevToolsSheet };
