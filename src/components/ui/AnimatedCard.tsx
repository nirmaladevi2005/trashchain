import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { fadeUpItem, useShouldReduceMotion } from '../../utils/animationVariants';

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode;
  className?: string;
  enableHover?: boolean;
}

export function AnimatedCard({ children, className = '', enableHover = true, ...props }: AnimatedCardProps) {
  const shouldReduceMotion = useShouldReduceMotion();

  if (shouldReduceMotion) {
    return <Card className={className} {...props}>{children}</Card>;
  }

  return (
    <motion.div
      variants={fadeUpItem}
      whileHover={enableHover ? { y: -5, scale: 1.01, transition: { duration: 0.2, ease: 'easeOut' } } : undefined}
      whileTap={enableHover ? { scale: 0.985 } : undefined}
    >
      <Card className={className} {...props}>
        {children}
      </Card>
    </motion.div>
  );
}
