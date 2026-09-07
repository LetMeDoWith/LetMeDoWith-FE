import dayjs from 'dayjs';

/*
 * 두윗 마감(시작시간 + 1시간)까지 남은 분. 마감했으면 0.
 * 표시 문자열과 임박 여부 판단이 같은 값을 쓰도록 계산을 한곳에 둔다.
 */
const getRemainingMinutes = (startTime: string): number => {
  const now = dayjs();
  const target = dayjs().format('YYYY-MM-DD') + ' ' + startTime;
  const diff = dayjs(target).add(1, 'hour').diff(now, 'minute');

  return Math.max(0, diff);
};

/*
 * 지금보다 뒤에 오는 가장 가까운 분 단위 경계(예: 5분 간격이면 10:08 → 10:10).
 *
 * 시각 선택의 최소값으로 raw 현재시각을 그대로 쓰면, 네이티브 피커가 10:08 같은
 * 비경계 값으로 스냅되어 지난 시각이 저장된다. 최소값과 초기값을 모두 이 경계로 맞춘다.
 */
const getNextMinuteBoundary = (minuteInterval: number): Date => {
  const now = dayjs();
  // 현재 분이 경계에 정확히 걸쳐도 다음 경계로 보낸다(항상 현재보다 미래).
  const nextMinutes = (Math.floor(now.minute() / minuteInterval) + 1) * minuteInterval;

  if (nextMinutes >= 60) {
    return now.add(1, 'hour').minute(0).second(0).millisecond(0).toDate();
  }

  return now.minute(nextMinutes).second(0).millisecond(0).toDate();
};

const formatRemainingTime = (startTime: string): string => {
  const diff = getRemainingMinutes(startTime);

  if (diff <= 0) {
    return '';
  }

  const h = Math.floor(diff / 60);
  const m = diff % 60;

  if (h > 0 && m > 0) {
    return `${h}시간 ${m}분`;
  }
  if (h > 0) {
    return `${h}시간`;
  }
  return `${m}분`;
};

const formatTimeAgo = (dateString: string): string => {
  const now = dayjs();
  const target = dayjs(dateString);
  const diffMinutes = now.diff(target, 'minute');

  if (diffMinutes < 1) {
    return '방금 전';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = now.diff(target, 'hour');
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  const diffDays = now.diff(target, 'day');
  if (diffDays < 30) {
    return `${diffDays}일 전`;
  }

  return target.format('YYYY.MM.DD');
};

const formatNotificationDate = (dateString: string): string => {
  const now = dayjs();
  const target = dayjs(dateString);
  const isToday = now.format('YYYY-MM-DD') === target.format('YYYY-MM-DD');

  if (isToday) {
    return formatTimeAgo(dateString);
  }

  const isThisYear = now.year() === target.year();
  return isThisYear ? target.format('M월 D일') : target.format('YYYY년 M월 D일');
};

export { getRemainingMinutes, getNextMinuteBoundary, formatRemainingTime, formatTimeAgo, formatNotificationDate };
