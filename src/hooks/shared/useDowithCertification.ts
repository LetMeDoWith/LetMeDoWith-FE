import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { launchCamera } from 'react-native-image-picker';

import { useDialog } from 'components/common/Dialog/Provider';
import { useUploadDowithTaskSuccessImageList } from 'hooks/queries/task/useFetchUploadTaskSuccessImageUrlList';
import { isAos } from 'utils/device';

/*
 * 두윗 인증(즉석 촬영 → S3 업로드 → 성공 처리) 흐름.
 *
 * 홈 목록의 상태 아이콘과 잡도리 모아보기의 "바로 인증하기"가 같은 동작을 해야 해서
 * 한 곳에 모아 둔다. 인증에 성공하면 태스크 목록 쿼리가 무효화되므로,
 * 상세를 보고 있는 화면은 재조회 결과로 알아서 인증 후 상태로 바뀐다.
 */
const useDowithCertification = (dowithTaskId: number) => {
  const { showDialog, hideDialog } = useDialog();
  const { mutate: uploadDowithTaskSuccessImageUrlListMutate } = useUploadDowithTaskSuccessImageList(dowithTaskId);

  /* 두윗 인증은 즉석 촬영만 허용한다(갤러리 선택 불가) */
  const certify = useCallback(async () => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.7 as const,
      /*
       * 라이브러리 기본값이 'pageSheet'라 iOS에서 카메라가 카드형 모달로 열리고
       * 상단에 뒤 화면이 비친다. 전체 화면으로 띄운다. (Android는 시스템 카메라
       * 앱을 인텐트로 실행하므로 이 옵션의 영향을 받지 않는다)
       */
      presentationStyle: 'fullScreen' as const,
    };

    try {
      const result = await launchCamera(options);

      // 사용자가 취소한 경우
      if (result.didCancel) {
        return;
      }

      // 권한 거부 또는 에러 처리
      if (result.errorCode) {
        console.error('[카메라 에러]:', result.errorCode, result.errorMessage);
        // 권한 거부 에러인 경우만 다이얼로그 표시
        const isPermissionDenied =
          result.errorCode === 'permission' ||
          result.errorCode === 'camera_unavailable' ||
          result.errorCode === 'others';

        if (isPermissionDenied) {
          showDialog({
            title: '카메라 접근 권한 필요',
            content: '카메라 접근 권한을 허용해야 해요!\n기기 설정에서 권한을 변경할 수 있어요',
            leftButtonText: '취소',
            rightButtonText: '설정 바로가기',
            handleLeftButton: hideDialog,
            handleRightButton: () => {
              Linking.openSettings();
              hideDialog();
            },
          });
        }

        // iOS 시뮬레이터에서 카메라 사용 시 에러 처리
        if (!isAos && result.errorCode === 'camera_unavailable') {
          Alert.alert(
            '카메라 사용 불가',
            'iOS 시뮬레이터에서는 카메라를 사용할 수 없습니다.\n실제 기기에서 테스트해주세요.',
            [{ text: '확인' }],
          );
        }
        return;
      }

      // 이미지 선택 성공
      if (result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.fileName || 'photo.jpg';

        const photoFile = {
          uri: asset.uri || '',
          width: asset.width || 0,
          height: asset.height || 0,
          isRawPhoto: false,
          orientation: 'portrait' as const,
          isMirrored: false,
        };

        uploadDowithTaskSuccessImageUrlListMutate({
          imageFileNames: [fileName],
          photo: photoFile,
        });
      }
    } catch (e) {
      console.error('이미지 촬영 중 에러 발생:', e);
    }
  }, [hideDialog, showDialog, uploadDowithTaskSuccessImageUrlListMutate]);

  return { certify };
};

export { useDowithCertification };
