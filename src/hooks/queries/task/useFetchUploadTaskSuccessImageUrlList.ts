import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { PhotoFile } from 'react-native-vision-camera';

import { TASK_QUERY_KEY } from 'constants/queries';
import {
  fetchUploadTaskSuccessImageUrlList,
  updateDowithTaskStatusSuccess,
  uploadFileToBucket,
} from 'services/rest/task';
import type { uploadTaskSuccessImageUrlListRequestSchemeType } from 'types/task/scheme/api';

const useUploadDowithTaskSuccessImageList = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<void, AxiosError, uploadTaskSuccessImageUrlListRequestSchemeType & { photo: PhotoFile }>({
    mutationFn: async ({ imageFileNames, photo }) => {
      // 1. Presigned URL 리스트 받기
      const {
        data: { presignedUrls },
      } = await fetchUploadTaskSuccessImageUrlList(id, { imageFileNames });

      // 2. S3에 직접 이미지 업로드
      await uploadFileToBucket(presignedUrls[0], photo.path, progress => {
        console.log(`이미지 S3 업로드 진행률: ${Math.round(progress)}%`);
      });

      // 3. 이미지 업로드 완료 API 호출
      await updateDowithTaskStatusSuccess(id, {
        publicImageUrls: presignedUrls,
      });
    },
    onSuccess: async () => {
      console.log('두윗 성공 이미지 업로드 성공 !');
      queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEY.LIST });
    },
  });
};

export { useUploadDowithTaskSuccessImageList };
