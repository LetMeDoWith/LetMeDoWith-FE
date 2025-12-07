import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { TASK_QUERY_KEY } from 'constants/queries';
import { fetchUploadTaskSuccessImageUrlList } from 'services/rest/task';
import type {
  uploadTaskSuccessImageUrlListRequestSchemeType,
  uploadTaskSuccessImageUrlListResponseSchemeType,
} from 'types/task/scheme/api';

const useFetchUploadTaskSuccessImageUrlList = (id: number) =>
  useMutation<
    uploadTaskSuccessImageUrlListResponseSchemeType,
    AxiosError,
    uploadTaskSuccessImageUrlListRequestSchemeType
  >({
    mutationKey: TASK_QUERY_KEY.UPLOAD_SUCCESS_IMAGE_URL_LIST,
    mutationFn: payload => fetchUploadTaskSuccessImageUrlList(id, payload),
    onSuccess: ({ data }) => {
      console.log('두윗 성공 이미지 url 리스트 발급 성공 ! ', data);
      // TODO: 두윗 성공 이미지 업로드 API 연동
    },
  });

export { useFetchUploadTaskSuccessImageUrlList };
