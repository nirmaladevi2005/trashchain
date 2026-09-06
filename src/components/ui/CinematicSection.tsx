import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  cinematicFadeUp, 
  cinematicSlideLeft, 
  cinematicSlideRight, 
  cinematicZoomIn,
  useShouldReduceMotion 
} from '../../utils/cinematicVariants';

export interface CinematicSectionProps {
  children: React.ReactNode;
  variant?: 'fade-up' | 'slide-left' | 'slide-right' | 'zoom-in';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const variantMap: Record<string, Variants> = {
  'fade-up': cinematicFadeUp,
  'slide-left': cinematicSlideLeft,
  'slide-right': cinematicSlideRight,
  'zoom-in': cinematicZoomIn,
};

export function CinematicSection({
  children,
  variant = 'fade-up',
  delay = 0,
  duration,
  className = '',
  once = true,
}: CinematicSectionProps) {
  const shouldReduceMotion = useShouldReduceMotion();
  const selectedVariant = variantMap[variant] || cinematicFadeUp;

  if (shouldReduceMotion) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-60px' }}
      variants={selectedVariant}
      transition={duration ? { duration, delay, ease: [0.22, 1, 0.36, 1] } : { delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
