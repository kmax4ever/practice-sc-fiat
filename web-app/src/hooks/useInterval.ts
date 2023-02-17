import { useEffect, useRef } from "react";

const useInterval = (callback: () => void, interval: number) => {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handler = savedCallback.current;

    if (handler) {
      const id = setInterval(handler, interval);
      return () => clearInterval(id);
    }
    return;
  }, [interval]);
};

export default useInterval;
