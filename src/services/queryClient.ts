import { QueryClient } from '@tanstack/react-query';

/*
 * 앱 전역에서 공유하는 단일 QueryClient 인스턴스.
 * App.tsx의 Provider와 개발용 DevTools(React Query 탭)가 같은 인스턴스를 참조하도록 모듈로 분리한다.
 */
const queryClient = new QueryClient();

export { queryClient };
