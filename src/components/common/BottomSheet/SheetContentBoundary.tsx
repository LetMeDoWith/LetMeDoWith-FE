import { Component, type ReactNode } from 'react';

import { captureRenderError } from 'utils/sentry';

interface Props {
  /* 시트를 닫고 사용자에게 알리는 처리. 바텀시트 래퍼가 넘긴다 */
  onError: () => void;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/*
 * 바텀시트 내용의 렌더 에러를 받는 바운더리.
 * gorhom 시트는 루트 portal에 그려져 화면 바운더리 밖이라 따로 둔다. 시트 안에 에러 UI를 두지 않고 닫는다 —
 * 내용이 대부분 입력 폼이라 같은 상태로 다시 그려도 또 깨질 가능성이 크다.
 * 시트가 닫히면 내용이 언마운트되므로 다음에 열 때 상태가 초기화된다.
 */
class SheetContentBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    captureRenderError(error, 'bottom-sheet');
    this.props.onError();
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

export { SheetContentBoundary };
