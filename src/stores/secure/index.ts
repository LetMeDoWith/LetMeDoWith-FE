import EncryptedStorage from 'react-native-encrypted-storage';

const STORAGE_KEY = {
  MERGED_INFO: 'MERGED_INFO',
};

type StorageKey = keyof typeof STORAGE_KEY;

const isStorageKey = (key: string): key is StorageKey => {
  return Object.keys(STORAGE_KEY).includes(key);
};

/**
 * encrypted-storage에 Nil값이나 key 등 유효성 검사를 추가하여 래핑한 storage 함수
 */
const secureStorage = () => ({
  /**
   * 안전하게 키체인/스토리지에서 값을 읽음
   * @returns 문자열 또는 null
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (!isStorageKey(key)) {
        throw new Error(`유효하지 않은 스토리지 key로 접근할 수 없습니다. ${key}`);
      }
      const result = await EncryptedStorage.getItem(key);
      // null | undefined | "undefined" → null 처리
      if (result == null || result === 'undefined') {
        return null;
      }
      return result;
    } catch (e) {
      console.error(`secureStorage.getItem 에러 (key: ${key}):`, e);
      return null;
    }
  },

  /**
   * 안전하게 키체인/스토리지에 값을 작성
   * undefined/null 값인 경우 아이템을 제거
   */
  async setItem(key: string, value: string | null | undefined) {
    try {
      if (!isStorageKey(key)) {
        throw new Error(`유효하지 않은 스토리지 key로 생성할 수 없습니다. ${key}`);
      }
      if (value == null || value === 'undefined') {
        await EncryptedStorage.removeItem(key);
      } else {
        await EncryptedStorage.setItem(key, value);
      }
    } catch (e) {
      console.error(`secureStorage.setItem 에러 (key: ${key}, value: ${value}):`, e);
    }
  },

  /**
   * 안전하게 키체인/스토리지에서 아이템을 제거
   */
  async removeItem(key: string) {
    try {
      if (!isStorageKey(key)) {
        throw new Error(`유효하지 않은 스토리지 key로 제거할 수 없습니다. ${key}`);
      }
      await EncryptedStorage.removeItem(key);
    } catch (e) {
      console.error(`secureStorage.removeItem 에러 (key: ${key}):`, e);
    }
  },
});

export { secureStorage, STORAGE_KEY };
