import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Portal } from 'react-native-paper';

import { Dialog } from 'components/common/Dialog';

type DialogOptions = {
  title: string;
  content: string;
  subContent?: string;
  type?: 'BASIC' | 'ALERT';
  leftButtonText?: string;
  rightButtonText?: string;
  alertButtonText?: string;
  handleLeftButton?: () => void;
  handleRightButton?: () => void;
  handleAlertButton?: () => void;
};

const defaultOptions: Omit<DialogOptions, 'title' | 'content'> = {
  subContent: '',
  type: 'BASIC',
  leftButtonText: '취소',
  rightButtonText: '확인',
  alertButtonText: '확인',
  handleLeftButton: () => {},
  handleRightButton: () => {},
  handleAlertButton: () => {},
};

type DialogContextType = {
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
};

const DialogContext = createContext<DialogContextType>({
  showDialog: () => {},
  hideDialog: () => {},
});

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<DialogOptions>({
    title: '',
    content: '',
  });

  const showDialog = (options: DialogOptions) => {
    setOptions({ ...defaultOptions, ...options });
    setVisible(true);
  };
  const hideDialog = () => setVisible(false);

  return (
    <DialogContext.Provider value={{ showDialog, hideDialog }}>
      {children}
      <Portal>
        <Dialog
          title={options.title}
          content={options.content}
          type={options.type}
          visible={visible}
          onDismiss={hideDialog}
          leftButtonText={options.leftButtonText}
          rightButtonText={options.rightButtonText}
          alertButtonText={options.alertButtonText}
          subContent={options.subContent}
          handleLeftButton={options.handleLeftButton}
          handleRightButton={options.handleRightButton}
          handleAlertButton={options.handleAlertButton}
        />
      </Portal>
    </DialogContext.Provider>
  );
};

export const useDialog = () => useContext(DialogContext);
