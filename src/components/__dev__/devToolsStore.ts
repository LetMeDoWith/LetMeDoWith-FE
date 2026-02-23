import { create } from 'zustand';

import type { ConsoleEntry, DevToolsTab, NetworkEntry } from 'components/__dev__/types';

const MAX_CONSOLE_ENTRIES = 200;
const MAX_NETWORK_ENTRIES = 100;

interface DevToolsState {
  // UI 상태
  activeTab: DevToolsTab;
  isSheetOpen: boolean;

  // 콘솔
  consoleLogs: ConsoleEntry[];

  // 네트워크
  networkRequests: NetworkEntry[];

  // 액션
  setActiveTab: (tab: DevToolsTab) => void;
  setIsSheetOpen: (open: boolean) => void;
  pushConsoleLog: (entry: ConsoleEntry) => void;
  clearConsoleLogs: () => void;
  pushNetworkRequest: (entry: NetworkEntry) => void;
  updateNetworkRequest: (id: number, update: Partial<NetworkEntry>) => void;
  clearNetworkRequests: () => void;
}

let _nextConsoleId = 0;
let _nextNetworkId = 0;

export const getNextConsoleId = () => ++_nextConsoleId;
export const getNextNetworkId = () => ++_nextNetworkId;

export const useDevToolsStore = create<DevToolsState>(set => ({
  activeTab: 'Elements',
  isSheetOpen: false,
  consoleLogs: [],
  networkRequests: [],

  setActiveTab: tab => set({ activeTab: tab }),
  setIsSheetOpen: open => set({ isSheetOpen: open }),

  pushConsoleLog: entry =>
    set(state => ({
      consoleLogs: [entry, ...state.consoleLogs].slice(0, MAX_CONSOLE_ENTRIES),
    })),

  clearConsoleLogs: () => set({ consoleLogs: [] }),

  pushNetworkRequest: entry =>
    set(state => ({
      networkRequests: [entry, ...state.networkRequests].slice(0, MAX_NETWORK_ENTRIES),
    })),

  updateNetworkRequest: (id, update) =>
    set(state => ({
      networkRequests: state.networkRequests.map(req => (req.id === id ? { ...req, ...update } : req)),
    })),

  clearNetworkRequests: () => set({ networkRequests: [] }),
}));
