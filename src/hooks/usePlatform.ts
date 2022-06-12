import { useEffect, useState } from 'react';

export function usePlatform(): {
  device: 'mobile' | 'desktop';
} {
  const [size, setSize] = useState(0);

  useEffect(() => {
    if (!size) {
      setSize(window.innerWidth);
    }
    window.addEventListener('resize', () => {
      setSize(window.innerWidth);
    });
  }, []);

  return {
    device: size < 620 ? 'mobile' : 'desktop',
  };
}
