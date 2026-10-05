import { Linking } from 'react-native';

import { showSnackbar, SNACKBAR_TYPE } from 'stores/snackbarStore';

/* 외부 브라우저로 링크를 연다. 열 수 없으면 조용히 끝내지 않고 스낵바로 알린다. */
const openExternalUrl = async (url: string) => {
  try {
    await Linking.openURL(url);
  } catch {
    showSnackbar('페이지를 열 수 없어요. 잠시 후 다시 시도해주세요.', { type: SNACKBAR_TYPE.ERROR });
  }
};

export { openExternalUrl };
