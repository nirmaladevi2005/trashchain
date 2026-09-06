import type { Variants } from 'framer-motion';

/**
 * Helper to safely check if OS/browser has enabled prefers-reduced-motion: reduce
 */
export function useShouldReduceMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Standard Page Entrance & Exit Variant
 * Visually clear fade-in with smooth vertical slide (y: 28 -> 0)
 */
export const pageVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 28 
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.45, 
      ease: [0.22, 1, 0.36, 1],
      when: 'beforeChildren',
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: -16,
    transition: { 
      duration: 0.25, 
      ease: [0.4, 0, 1, 1] 
    } 
  }
};

/**
 * Stagger Container Variant for Lists and Grids
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

/**
 * Fade Up Item Variant for Grid/List Cards
 */
export const fadeUpItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 22 
  },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.4, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }
};

/**
 * Scale Fade Variant for Modals / Popups
 */
export const scaleFadeVariant: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.94, 
    y: 12 
  },
  show: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.3, 
      ease: [0.16, 1, 0.3, 1] 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.94, 
    y: 12,
    transition: { 
      duration: 0.2, 
      ease: 'easeOut' 
    } 
  }
};

/**
 * Hover & Tap Button Variant
 */
export const buttonHoverTap = {
  whileHover: { 
    scale: 1.03, 
    y: -1, 
    transition: { duration: 0.18, ease: 'easeOut' } 
  },
  whileTap: { 
    scale: 0.97, 
    transition: { duration: 0.1 } 
  }
};

/**
 * Card Hover Lift Variant
 */
export const cardHoverVariant = {
  whileHover: { 
    y: -5, 
    scale: 1.01,
    transition: { duration: 0.22, ease: 'easeOut' } 
  }
};
