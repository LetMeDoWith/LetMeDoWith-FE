import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApiError } from 'services/apiClient';
import { Asset } from 'react-native-image-picker';

import { TASK_QUERY_KEY } from 'constants/queries';
import { fetchUploadTaskSuccessImageUrlList, updateDowithTaskStatusSuccess } from 'services/rest/task';
import { useUploadImage } from 'hooks/shared/useUploadImage';
import type { uploadTaskSuccessImageUrlListRequestSchemeType } from 'types/task/scheme/api';
import { logEvent, toAnalyticsId } from 'utils/analytics';
import { showDoriSuccessMotion } from 'stores/successMotionStore';

const useUploadDowithTaskSuccessImageList = (id: number) => {
  const queryClient = useQueryClient();
  const { upload } = useUploadImage(async (imageFileName: string) => {
    const {
      data: { presignedUrls, publicImageUrls },
    } = await fetchUploadTaskSuccessImageUrlList(id, { imageFileNames: [imageFileName] });
    return { presignedUrl: presignedUrls[0], publicImageUrl: publicImageUrls[0] };
  });

  return useMutation<boolean, ApiError, uploadTaskSuccessImageUrlListRequestSchemeType & { photo: Asset }>({
    mutationFn: async ({ imageFileNames, photo }) => {
      if (!photo.uri) {
        return false;
      }

      // 1. presigned URL 발급 + S3 업로드
      const publicImageUrl = await upload(photo.uri, imageFileNames[0]);

      // 2. 이미지 업로드 완료 API 호출
      await updateDowithTaskStatusSuccess(id, {
        publicImageUrls: [publicImageUrl],
      });

      return true;
    },
    onSuccess: async didUpload => {
      console.log('도리 성공 이미지 업로드 성공 !');

      /* uri 없어 업로드를 건너뛴 경우(didUpload: false)는 실제 인증이 일어나지 않았으므로 이벤트를 보내지 않는다 */
      if (didUpload) {
        logEvent('certification_complete', { dori_id: toAnalyticsId(id) });
        /* 인증이 실제로 끝났을 때만 축하 모션을 띄운다(촬영 직후가 아니라 업로드·성공 처리 후) */
        showDoriSuccessMotion();
      }

      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.LIST });
    },
  });
};

export { useUploadDowithTaskSuccessImageList };
