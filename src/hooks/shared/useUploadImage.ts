import { useState, useCallback } from 'react';

import { uploadFileToBucket } from 'services/rest/task';

/**
 * Presigned URL 발급 함수의 타입 정의
 * @param imageFileName - 업로드할 이미지 파일명
 * @returns presignedUrl: S3 업로드용 서명된 URL, publicImageUrl: 업로드 완료 후 공개 접근 가능한 이미지 URL
 */
type PresignedUrlFetcher = (imageFileName: string) => Promise<{
  presignedUrl: string;
  publicImageUrl: string;
}>;

/**
 * 이미지 업로드를 처리하는 공통 훅
 *
 * Presigned URL을 발급받아 S3 버킷에 이미지를 업로드하고, 공개 접근 URL을 반환한다.
 * Presigned URL 발급 로직을 외부에서 주입받아 다양한 업로드 시나리오(프로필 이미지, 태스크 성공 이미지 등)에 재사용 가능하다.
 *
 * @param fetchPresignedUrl - Presigned URL 발급 함수 (용도에 따라 다른 API를 호출하도록 주입)
 * @returns upload: 이미지 업로드 실행 함수, isUploading: 업로드 진행 중 여부
 */
const useUploadImage = (fetchPresignedUrl: PresignedUrlFetcher) => {
  /** 업로드 진행 중 여부 */
  const [isUploading, setIsUploading] = useState(false);

  /**
   * 이미지 업로드 실행 함수
   * 1. fetchPresignedUrl을 호출하여 Presigned URL과 공개 이미지 URL을 발급받는다.
   * 2. 발급받은 Presigned URL로 S3 버킷에 파일을 업로드한다.
   * 3. 업로드 완료 후 공개 접근 가능한 이미지 URL을 반환한다.
   *
   * @param uri - 업로드할 로컬 이미지 파일의 URI
   * @param imageFileName - 서버에 저장될 이미지 파일명
   * @returns 공개 접근 가능한 이미지 URL
   */
  const upload = useCallback(
    async (uri: string, imageFileName: string): Promise<string> => {
      setIsUploading(true);
      try {
        const { presignedUrl, publicImageUrl } = await fetchPresignedUrl(imageFileName);

        await uploadFileToBucket(presignedUrl, uri);

        return publicImageUrl;
      } finally {
        setIsUploading(false);
      }
    },
    [fetchPresignedUrl],
  );

  return { upload, isUploading };
};

export { useUploadImage };