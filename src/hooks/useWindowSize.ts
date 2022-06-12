/* eslint-disable @typescript-eslint/no-empty-function */
import { useEffect, useState } from 'react';

export function useWindowWidth() {
  const [windowSizeX, setWindowSizeX] = useState(window.innerWidth);

  useEffect(() => {
    window.addEventListener('resize', () => {
      setWindowSizeX(window.innerWidth);
    });
    return () => {
      window.removeEventListener('resize', () => {});
    };
  }, []);

  return {
    windowSizeX,
  };
}
