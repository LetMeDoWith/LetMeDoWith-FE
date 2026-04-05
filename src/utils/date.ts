import dayjs from 'dayjs';

const formatRemainingTime = (startTime: string): string => {
  const now = dayjs();
  const target = dayjs().format('YYYY-MM-DD') + ' ' + startTime;
  const diff = dayjs(target).diff(now, 'minute');

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

export { formatRemainingTime };
