import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useShouldReduceMotion } from '../../utils/cinematicVariants';

export interface ScrollParallaxProps {
  children: React.ReactNode;
  speed?: number; // e.g. -40 to 40 px shift
  className?: string;
}

export function ScrollParallax({ children, speed = -30, className = '' }: ScrollParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useShouldReduceMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-speed, speed]);

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
