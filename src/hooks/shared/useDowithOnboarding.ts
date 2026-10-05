import { useCallback, useEffect, useState } from 'react';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useQueryClient } from '@tanstack/react-query';

import { MEMBER_QUERY_KEY } from 'constants/queries';
import type { HomeTabParamList } from 'types/shared';
import type { Rect } from 'utils/onboarding';

/* 온보딩이 가리킬 대상(첫 도리 항목의 상태 원·⚡칩)의 화면 좌표 */
interface OnboardingTargets {
  status: Rect;
  thunder: Rect;
}

const isSameRect = (a: Rect, b: Rect) => a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

const isSameTargets = (a: OnboardingTargets, b: OnboardingTargets) =>
  isSameRect(a.status, b.status) && isSameRect(a.thunder, b.thunder);

/*
 * 홈의 첫 도리 등록 온보딩 상태.
 *
 * 등록이 온보딩 완료 처리(PUT)까지 마친 경우에만 신호를 받아 띄운다.
 * - 바텀시트에서 등록: 시트 콜백이 requestOnboarding을 부른다.
 * - 수정 화면(TASK_FORM)에서 등록: 라우트 파라미터 showOnboarding으로 넘어온다.
 * 띄우려면 목록의 첫 도리 항목이 좌표를 재 올려줘야 한다(handleMeasureOnboardingTargets).
 */
const useDowithOnboarding = () => {
  const queryClient = useQueryClient();
  const { params } = useRoute<RouteProp<HomeTabParamList, 'MYTODO'>>();
  const { setParams } = useNavigation<BottomTabNavigationProp<HomeTabParamList, 'MYTODO'>>();

  const [isOnboardingRequested, setIsOnboardingRequested] = useState(false);
  const [onboardingTargets, setOnboardingTargets] = useState<OnboardingTargets | null>(null);
  const isOnboardingVisible = isOnboardingRequested && !!onboardingTargets;

  // 한 번 쓰고 지워야 홈에 다시 올 때 또 뜨지 않는다
  const showOnboardingParam = params?.showOnboarding;
  useEffect(() => {
    if (!showOnboardingParam) {
      return;
    }

    setIsOnboardingRequested(true);
    setParams({ showOnboarding: undefined });
  }, [showOnboardingParam, setParams]);

  /* 온보딩이 뜨면 member API를 다시 받아 서버의 온보딩 완료 값을 로컬 사본에 반영한다 */
  useEffect(() => {
    if (isOnboardingVisible) {
      queryClient.invalidateQueries({ queryKey: MEMBER_QUERY_KEY.MY_DOWITH });
    }
  }, [isOnboardingVisible, queryClient]);

  const requestOnboarding = useCallback(() => setIsOnboardingRequested(true), []);

  /*
   * 좌표가 실제로 달라졌을 때만 상태를 바꾼다.
   * 매 렌더마다 재측정하므로, 같은 값으로도 갱신하면 리렌더가 끝없이 이어진다.
   */
  const handleMeasureOnboardingTargets = useCallback((next: OnboardingTargets) => {
    setOnboardingTargets(prev => (prev && isSameTargets(prev, next) ? prev : next));
  }, []);

  const handleCloseOnboarding = useCallback(() => {
    setIsOnboardingRequested(false);
    setOnboardingTargets(null);
  }, []);

  return {
    isOnboardingRequested,
    /* 띄울 수 있으면 좌표, 아니면 null — 렌더 조건과 좌표를 한 번에 쓴다 */
    visibleOnboardingTargets: isOnboardingVisible ? onboardingTargets : null,
    requestOnboarding,
    handleMeasureOnboardingTargets,
    handleCloseOnboarding,
  };
};

export { useDowithOnboarding };
export type { OnboardingTargets };
