import { useEffect, useState, useRef } from 'react';
import { useInView, animate } from 'framer-motion';
import { useShouldReduceMotion } from '../../utils/cinematicVariants';

export interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1.6,
  className = '',
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [displayValue, setDisplayValue] = useState(0);
  const shouldReduceMotion = useShouldReduceMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    if (isInView) {
      const controls = animate(0, value, {
        duration,
        ease: [0.22, 1, 0.36, 1],
        onUpdate: (latest) => {
          setDisplayValue(Math.round(latest));
        },
      });
      return () => controls.stop();
    }
  }, [isInView, value, duration, shouldReduceMotion]);

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}
