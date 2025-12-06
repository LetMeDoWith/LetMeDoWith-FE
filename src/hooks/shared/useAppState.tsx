import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

type AppStateContextType = {
  appState: AppStateStatus;
  subscribe: (callback: (state: AppStateStatus) => void) => () => void;
};

const AppStateContext = createContext<AppStateContextType | null>(null);

const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const callbacksRef = useRef<Set<(state: AppStateStatus) => void>>(new Set());

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);

      callbacksRef.current.forEach(callback => {
        callback(nextAppState);
      });
    });

    return () => subscription.remove();
  }, []);

  const subscribe = (callback: (state: AppStateStatus) => void) => {
    callbacksRef.current.add(callback);

    return () => {
      callbacksRef.current.delete(callback);
    };
  };

  return <AppStateContext.Provider value={{ appState, subscribe }}>{children}</AppStateContext.Provider>;
};

const useAppState = (onStateChange?: (state: AppStateStatus) => void) => {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }

  const callbackRef = useRef(onStateChange);

  useEffect(() => {
    callbackRef.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    if (!callbackRef.current) {
      return;
    }

    // 콜백 등록 및 cleanup 함수 받기
    const unsubscribe = context.subscribe(state => {
      callbackRef.current?.(state);
    });

    return unsubscribe;
  }, [context]);

  return context.appState;
};

export { AppStateProvider, useAppState };
