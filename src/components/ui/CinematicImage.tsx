import { motion } from 'framer-motion';
import { cinematicZoomIn, useShouldReduceMotion } from '../../utils/cinematicVariants';

export interface CinematicImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onDrag' | 'onDragStart' | 'onDragEnd' | 'onAnimationStart'> {
  containerClassName?: string;
  enableHoverZoom?: boolean;
}

export function CinematicImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  enableHoverZoom = true,
  ...props
}: CinematicImageProps) {
  const shouldReduceMotion = useShouldReduceMotion();

  if (shouldReduceMotion) {
    return (
      <div className={`overflow-hidden ${containerClassName}`}>
        <img src={src} alt={alt} className={className} {...props} />
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={cinematicZoomIn}
      className={`overflow-hidden ${containerClassName}`}
    >
      <motion.img
        src={src}
        alt={alt}
        whileHover={enableHoverZoom ? { scale: 1.04, transition: { duration: 0.3, ease: 'easeOut' } } : undefined}
        className={`w-full h-full object-cover transition-transform duration-500 ${className}`}
        {...props}
      />
    </motion.div>
  );
}
