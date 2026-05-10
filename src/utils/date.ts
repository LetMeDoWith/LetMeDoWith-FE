import dayjs from 'dayjs';

const formatRemainingTime = (startTime: string): string => {
  const now = dayjs();
  const target = dayjs().format('YYYY-MM-DD') + ' ' + startTime;
  const diff = dayjs(target).add(1, 'hour').diff(now, 'minute');

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

export { formatRemainingTime, formatTimeAgo };
