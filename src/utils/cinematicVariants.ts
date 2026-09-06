import type { Variants } from 'framer-motion';
export { useShouldReduceMotion } from './animationVariants';

/**
 * Cinematic Scroll-Based Motion Variants
 * Easing: [0.22, 1, 0.36, 1] for smooth, cubic-bezier ease
 */

export const cinematicFadeUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 48,
    scale: 0.97
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.65, 
      ease: [0.22, 1, 0.36, 1],
      when: 'beforeChildren',
      staggerChildren: 0.1
    }
  }
};

export const cinematicSlideLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: 45 
  },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }
};

export const cinematicSlideRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: -45 
  },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }
};

export const cinematicZoomIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 1.08 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      duration: 0.7, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }
};

export const staggerCinematicContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05
    }
  }
};

export const staggerCinematicItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 28,
    scale: 0.97
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }
};

export const timelineNodeVariant: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.6, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: [0.34, 1.56, 0.64, 1] 
    } 
  }
};
