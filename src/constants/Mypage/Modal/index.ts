const LOGOUT_CONFIRM_MODAL_CONTENT = {
  title: '로그아웃 확인',
  description: '다시 로그인할 수 있어요.',
  cancelButtonText: '취소',
  confirmButtonText: '로그아웃',
} as const;

const DELETE_ACCOUNT_CONFIRM_MODAL_CONTENT = {
  title: '정말 탈퇴하시겠어요?',
  description: '탈퇴 버튼 선택 시, 계정은 삭제되며\n진행하신 투두와 잔소리 등\n모든 기록이 사라져요.',
  cancelButtonText: '탈퇴',
  confirmButtonText: '취소',
} as const;

export { LOGOUT_CONFIRM_MODAL_CONTENT, DELETE_ACCOUNT_CONFIRM_MODAL_CONTENT };
