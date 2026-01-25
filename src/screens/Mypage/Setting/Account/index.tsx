import React, { useCallback, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';

import { BasicMenu } from 'components/Mypage/Setting/Menu';
import { DELETE_ACCOUNT_CONFIRM_MODAL_CONTENT, LOGOUT_CONFIRM_MODAL_CONTENT } from 'constants/Mypage';
import { ConfirmModal } from 'components/common/Modal';
import { disposeNotificationLayer } from 'utils/notification';
import { useStore } from 'stores/index';
import { useDeleteAccount } from 'hooks/queries/member/useDeleteAccount';

const Account = () => {
  const { initAuthInfo } = useStore(({ authActions: { initAuthInfo } }) => ({
    initAuthInfo,
  }));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'LOGOUT' | 'DELETE_ACCOUNT' | null>(null);

  const { mutate: mutateDeleteAccount } = useDeleteAccount();

  const toggleModalOpen = useCallback(() => {
    setIsModalOpen(!isModalOpen);
  }, [isModalOpen]);

  const onPressLogout = useCallback(() => {
    Keyboard.dismiss();
    toggleModalOpen();
    setModalType('LOGOUT');
  }, [toggleModalOpen]);

  const onPressDeleteAccount = useCallback(() => {
    Keyboard.dismiss();
    toggleModalOpen();
    setModalType('DELETE_ACCOUNT');
  }, [toggleModalOpen]);

  const onPressConfirmButton = useCallback(async () => {
    toggleModalOpen();

    if (modalType === 'LOGOUT') {
      initAuthInfo();
      disposeNotificationLayer();
    }
  }, [modalType, toggleModalOpen]);

  const onPressCancelButton = useCallback(() => {
    toggleModalOpen();

    if (modalType === 'DELETE_ACCOUNT') {
      mutateDeleteAccount();
      return;
    }
  }, [modalType, mutateDeleteAccount, toggleModalOpen]);

  return (
    <>
      <View style={styles.container}>
        <BasicMenu title="로그아웃" onPress={onPressLogout} />
        <BasicMenu title="회원탈퇴" onPress={onPressDeleteAccount} />
      </View>
      <ConfirmModal
        visible={isModalOpen}
        title={modalType === 'LOGOUT' ? LOGOUT_CONFIRM_MODAL_CONTENT.title : DELETE_ACCOUNT_CONFIRM_MODAL_CONTENT.title}
        description={
          modalType === 'LOGOUT'
            ? LOGOUT_CONFIRM_MODAL_CONTENT.description
            : DELETE_ACCOUNT_CONFIRM_MODAL_CONTENT.description
        }
        confirmText={
          modalType === 'LOGOUT'
            ? LOGOUT_CONFIRM_MODAL_CONTENT.confirmButtonText
            : DELETE_ACCOUNT_CONFIRM_MODAL_CONTENT.confirmButtonText
        }
        cancelText={
          modalType === 'LOGOUT'
            ? LOGOUT_CONFIRM_MODAL_CONTENT.cancelButtonText
            : DELETE_ACCOUNT_CONFIRM_MODAL_CONTENT.cancelButtonText
        }
        onDismiss={toggleModalOpen}
        onConfirm={onPressConfirmButton}
        onCancel={onPressCancelButton}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
});

export { Account };
