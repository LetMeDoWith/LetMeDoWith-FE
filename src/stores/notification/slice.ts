import { StateCreator } from 'zustand';

import { AuthSlice } from 'stores/auth/slice';

export interface NotificationSlice {
  isNotificationEnabled: boolean;
  notificationSettings: {
    base: boolean;
    todoBot: boolean;
    feedback: boolean;
    marketing: boolean;
  };
  notificationActions: {
    setIsNotificationEnabled: (enabled: boolean) => void;
    updateNotificationSettings: (settings: Partial<NotificationSlice['notificationSettings']>) => void;
    resetNotificationSettings: () => void;
  };
}

export const INITIAL_NOTIFICATION_STORAGE_VALUE = {
  isNotificationEnabled: false,
  notificationSettings: {
    base: false,
    todoBot: false,
    feedback: false,
    marketing: false,
  },
};

const initialNotificationState = {
  ...INITIAL_NOTIFICATION_STORAGE_VALUE,
};

export const createNotificationSlice: StateCreator<AuthSlice & NotificationSlice, [], [], NotificationSlice> = (
  set,
  get,
) => ({
  ...initialNotificationState,
  notificationActions: {
    setIsNotificationEnabled: enabled => set({ isNotificationEnabled: enabled }),
    updateNotificationSettings: settings => {
      set({
        notificationSettings: {
          ...get().notificationSettings,
          ...settings,
        },
      });
    },
    resetNotificationSettings: () => {
      set({ ...initialNotificationState });
    },
  },
});
