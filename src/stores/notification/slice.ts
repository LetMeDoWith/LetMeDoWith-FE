import { StateCreator } from 'zustand';

import { AuthSlice } from 'stores/auth/slice';

export interface NotificationSlice {
  notificationSettings: {
    base: boolean;
    todoBot: boolean;
    feedback: boolean;
    marketing: boolean;
  };
  notificationActions: {
    updateNotificationSettings: (settings: Partial<NotificationSlice['notificationSettings']>) => void;
    resetNotificationSettings: () => void;
  };
}

export const INITIAL_NOTIFICATION_STORAGE_VALUE = {
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
