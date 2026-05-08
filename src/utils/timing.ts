const debounce = <T extends (...args: Parameters<T>) => void>(fn: T, delay: number) => {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const throttle = <T extends (...args: Parameters<T>) => void>(fn: T, delay: number) => {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
};

export { debounce, throttle };
