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

export { getRemainingMinutes, formatRemainingTime, formatTimeAgo, formatNotificationDate };
