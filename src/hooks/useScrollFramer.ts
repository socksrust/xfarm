import { useTransform, useViewportScroll } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * @description - This function will handle the state for the scroll
 * and trigger the state when the position is reached
 */
export const useScrollFramer = (scrollTriggerPercentage = 0.04) => {
  const { scrollYProgress } = useViewportScroll();
  const yRange = useTransform(
    scrollYProgress,
    [0, scrollTriggerPercentage],
    [0, 1]
  );
  const [startedScrolling, setStartedScrolling] = useState(false);

  useEffect(
    () => yRange.onChange((v) => setStartedScrolling(v >= 1)),
    [yRange]
  );

  return {
    startedScrolling,
  };
};
