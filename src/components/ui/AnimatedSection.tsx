import React from 'react';
import { motion } from 'framer-motion';
import { fadeUpItem, useShouldReduceMotion } from '../../utils/animationVariants';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedSection({ children, className = '', delay = 0 }: AnimatedSectionProps) {
  const shouldReduceMotion = useShouldReduceMotion();

  if (shouldReduceMotion) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      variants={fadeUpItem}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
