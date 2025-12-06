import React, { createContext, useContext, useState } from 'react';
import type { PhotoFile } from 'react-native-vision-camera';

import { CameraModal } from 'components/common/Modal';

type CameraContextType = {
  openCamera: (onPhoto: (photo: PhotoFile) => void) => void;
  closeCamera: () => void;
};

const CameraContext = createContext<CameraContextType | null>(null);

const CameraProvider = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [onPhotoCallback, setOnPhotoCallback] = useState<((photo: PhotoFile) => void) | null>(null);

  const openCamera = (callback: (photo: PhotoFile) => void) => {
    setOnPhotoCallback(() => callback);
    setIsVisible(true);
  };

  const closeCamera = () => {
    setIsVisible(false);
    setOnPhotoCallback(null);
  };

  return (
    <CameraContext.Provider value={{ openCamera, closeCamera }}>
      {children}
      <CameraModal
        isVisible={isVisible}
        onClose={closeCamera}
        onPhoto={photo => {
          onPhotoCallback?.(photo);
          closeCamera();
        }}
      />
    </CameraContext.Provider>
  );
};

const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera must be used within CameraProvider');
  }
  return context;
};

export { CameraProvider, useCamera };
