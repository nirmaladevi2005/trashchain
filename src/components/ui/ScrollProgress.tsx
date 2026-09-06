import { motion, useScroll, useSpring } from 'framer-motion';
import { useShouldReduceMotion } from '../../utils/cinematicVariants';

export function ScrollProgress({ className = '' }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const shouldReduceMotion = useShouldReduceMotion();
  if (shouldReduceMotion) return null;

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-forest-500 to-fresh-400 z-50 origin-left ${className}`}
      style={{ scaleX }}
    />
  );
}
