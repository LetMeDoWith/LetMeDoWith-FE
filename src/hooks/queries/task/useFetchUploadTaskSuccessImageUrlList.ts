import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { Asset } from 'react-native-image-picker';

import { TASK_QUERY_KEY } from 'constants/queries';
import { fetchUploadTaskSuccessImageUrlList, updateDowithTaskStatusSuccess } from 'services/rest/task';
import { useUploadImage } from 'hooks/shared/useUploadImage';
import type { uploadTaskSuccessImageUrlListRequestSchemeType } from 'types/task/scheme/api';

const useUploadDowithTaskSuccessImageList = (id: number) => {
  const queryClient = useQueryClient();
  const { upload } = useUploadImage(async (imageFileName: string) => {
    const {
      data: { presignedUrls, publicImageUrls },
    } = await fetchUploadTaskSuccessImageUrlList(id, { imageFileNames: [imageFileName] });
    return { presignedUrl: presignedUrls[0], publicImageUrl: publicImageUrls[0] };
  });

  return useMutation<void, AxiosError, uploadTaskSuccessImageUrlListRequestSchemeType & { photo: Asset }>({
    mutationFn: async ({ imageFileNames, photo }) => {
      if (!photo.uri) {
        return;
      }

      // 1. presigned URL 발급 + S3 업로드
      const publicImageUrl = await upload(photo.uri, imageFileNames[0]);

      // 2. 이미지 업로드 완료 API 호출
      await updateDowithTaskStatusSuccess(id, {
        publicImageUrls: [publicImageUrl],
      });
    },
    onSuccess: async () => {
      console.log('두윗 성공 이미지 업로드 성공 !');
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.LIST });
    },
  });
};

export { useUploadDowithTaskSuccessImageList };
