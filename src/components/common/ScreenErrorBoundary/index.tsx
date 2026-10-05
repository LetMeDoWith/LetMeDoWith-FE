import React, { Component, type ComponentType, type ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';

import { ErrorFallback } from 'components/common/ErrorFallback';
import { getErrorVariant, markErrorScreenShown } from 'utils/error';
import { captureRenderError } from 'utils/sentry';

interface BoundaryProps {
  /* QueryErrorResetBoundary의 reset. 재시도 때 실패했던 조회를 다시 요청하게 한다 */
  onReset: () => void;
  withSafeAreaTop?: boolean;
  onBack?: () => void;
  children: ReactNode;
}

interface BoundaryState {
  hasError: boolean;
  error: unknown;
}

class Boundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false, error: null };

  constructor(props: BoundaryProps) {
    super(props);
    /*
     * 화면이 처음 마운트될 때 한 번 초기화한다. 다른 화면의 던지지 않는 구독이 이미 실패시킨 조회는
     * "에러 + 데이터 없음"으로 남아 있는데, 초기화하지 않으면 react-query가 retryOnMount를 끄고
     * 재요청 없이 바로 던져 에러 화면이 뜬다. 초기화 플래그는 자식 조회가 마운트된 뒤 react-query가 지운다.
     */
    props.onReset();
  }

  static getDerivedStateFromError(error: unknown): BoundaryState {
    return { hasError: true, error };
  }

  /* 에러 화면이 떠 있는 동안 조회 실패 공통 스낵바를 건너뛰도록 표시한다(App.tsx 전역 구독) */
  private unmarkErrorScreen: (() => void) | null = null;

  componentDidCatch(error: unknown) {
    captureRenderError(error, 'screen');
    this.unmarkErrorScreen?.();
    this.unmarkErrorScreen = markErrorScreenShown();
  }

  componentWillUnmount() {
    this.unmarkErrorScreen?.();
  }

  handleRetry = () => {
    this.unmarkErrorScreen?.();
    this.unmarkErrorScreen = null;
    this.props.onReset();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          variant={getErrorVariant(this.state.error)}
          onRetry={this.handleRetry}
          withSafeAreaTop={this.props.withSafeAreaTop}
          onBack={this.props.onBack}
        />
      );
    }

    return this.props.children;
  }
}

interface Props {
  children: ReactNode;
  withSafeAreaTop?: boolean;
  /* 에러 화면에 뒤로가기를 그린다(헤더까지 가려지는 화면용) */
  onBack?: () => void;
}

/*
 * 화면 단위 에러 바운더리. 렌더 에러와, 핵심 조회가 첫 로딩에 실패해 던진 에러(throwOnInitialError)를 받아
 * 화면 내용 자리를 에러 화면으로 바꾼다. 네비게이터 헤더·탭바는 바깥이라 그대로 남는다.
 */
const ScreenErrorBoundary = ({ children, withSafeAreaTop, onBack }: Props) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <Boundary onReset={reset} withSafeAreaTop={withSafeAreaTop} onBack={onBack}>
        {children}
      </Boundary>
    )}
  </QueryErrorResetBoundary>
);

/*
 * 네비게이터 등록부에서 화면을 감싼다. 반드시 모듈 레벨에서 한 번만 호출한다 —
 * 렌더 중에 호출하면 매번 새 컴포넌트 타입이 되어 화면이 통째로 다시 마운트된다.
 */
const withScreenErrorBoundary = <P extends object>(
  Screen: ComponentType<P>,
  {
    withSafeAreaTop,
    withBackButton,
  }: {
    withSafeAreaTop?: boolean;
    /* 헤더까지 에러 화면으로 바뀌는 화면(headerShown: false + 탭바 없음)에서 나갈 수단을 준다 */
    withBackButton?: boolean;
  } = {},
) => {
  const Wrapped = (props: P) => {
    const { navigation } = props as { navigation?: { goBack: () => void } };

    return (
      <ScreenErrorBoundary
        withSafeAreaTop={withSafeAreaTop}
        onBack={withBackButton && navigation ? navigation.goBack : undefined}
      >
        <Screen {...props} />
      </ScreenErrorBoundary>
    );
  };
  Wrapped.displayName = `withScreenErrorBoundary(${Screen.displayName ?? Screen.name ?? 'Screen'})`;
  return Wrapped;
};

export { ScreenErrorBoundary, withScreenErrorBoundary };
