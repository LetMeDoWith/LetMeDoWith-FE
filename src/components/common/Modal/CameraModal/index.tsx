import { useEffect, useRef } from 'react';
import { Alert, Button, Linking, Modal as RNModal, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Portal } from 'react-native-paper';
import { Camera, PhotoFile, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

import { useAppState } from 'hooks/shared/useAppState';
import { isAos } from 'utils/device';

const CameraModal = ({
  isVisible,
  onClose,
  onPhoto,
}: {
  isVisible: boolean;
  onClose: () => void;
  onPhoto: (photo: PhotoFile) => void;
}) => {
  const appState = useAppState();
  const isActive = isVisible && appState === 'active';
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const camera = useRef<Camera>(null);

  useEffect(() => {
    if (!isVisible || hasPermission) {
      return;
    }

    requestPermission().then(granted => {
      if (!granted) {
        Alert.alert('권한 필요', '카메라 사용을 위해 설정에서 권한을 허용해주세요', [
          { text: '취소', style: 'cancel', onPress: onClose },
          {
            text: '설정 열기',
            onPress: () => {
              Linking.openSettings();
              onClose();
            },
          },
        ]);
      }
    });
  }, [isVisible, hasPermission]);

  const takePhoto = async () => {
    if (!camera.current) {
      return;
    }

    try {
      const photo = await camera.current.takePhoto();
      onPhoto(photo);
    } catch (error) {
      console.error('Photo error:', error);
    }
  };

  if (!isVisible || !hasPermission) {
    return null;
  }

  return (
    <Portal>
      <RNModal visible={isVisible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
        {device == null ? (
          <View style={styles.permissionContainer}>
            <Text>{isAos ? '카메라를 찾을 수 없습니다' : '시뮬레이터에서는 카메라를 사용할 수 없습니다'}</Text>
            <Text>실제 기기에서 테스트해주세요</Text>
            {__DEV__ && (
              <Button
                title="Mock 사진 생성 (개발용)"
                onPress={() => {
                  const mockPhoto: PhotoFile = {
                    path: 'mock://photo.jpg',
                    width: 3024,
                    height: 4032,
                    isRawPhoto: false,
                    isMirrored: false,
                    orientation: 'portrait',
                    thumbnail: undefined,
                  };
                  onPhoto(mockPhoto);
                }}
              />
            )}
            <Button title="닫기" onPress={onClose} />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Camera ref={camera} style={StyleSheet.absoluteFill} device={device} isActive={isActive} photo={true} />
            <SafeAreaView style={styles.overlay}>
              <View style={styles.topBar}>
                <Button title="닫기" onPress={onClose} />
              </View>

              <View style={styles.bottomBar}>
                <Button title="📷 촬영" onPress={takePhoto} />
              </View>
            </SafeAreaView>
          </View>
        )}
      </RNModal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    padding: 20,
    alignItems: 'flex-start',
  },
  bottomBar: {
    padding: 40,
    alignItems: 'center',
  },
});

export { CameraModal };
