import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Link as LinkIcon, Leaf, Trophy, CheckCircle2, X } from 'lucide-react';
import { cn } from '../../../utils/cn';

export type CelebrationType = 'success' | 'chain' | 'recovery' | 'transformation' | 'achievement';
export type CelebrationLevel = 1 | 2 | 3;

export interface CelebrationBurstProps {
  show: boolean;
  type?: CelebrationType;
  level?: CelebrationLevel;
  title?: string;
  message?: string;
  impactScore?: number;
  beforeScore?: number;
  afterScore?: number;
  onClose?: () => void;
}

export function CelebrationBurst({
  show,
  type = 'success',
  level = 1,
  title,
  message,
  impactScore,
  beforeScore,
  afterScore,
  onClose
}: CelebrationBurstProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  useEffect(() => {
    if (!show) return;

    // Auto dismiss after 3.2s
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3200);

    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  const defaultTitle = 
    type === 'success' ? 'Welcome to the Recovery Chain' :
    type === 'chain' ? 'Mission Connected' :
    type === 'recovery' ? 'Recovery Verified' :
    type === 'transformation' ? 'Site Transformed' :
    'Achievement Unlocked';

  const defaultMessage = 
    type === 'success' ? 'Your environmental identity is ready.' :
    type === 'chain' ? 'You joined the recovery chain.' :
    type === 'recovery' ? 'Recovery work submitted & verified.' :
    type === 'transformation' ? 'This place has a new future.' :
    'Environmental milestone unlocked.';

  const IconComponent = 
    type === 'transformation' ? Leaf :
    type === 'achievement' ? Trophy :
    type === 'recovery' ? ShieldCheck :
    type === 'chain' ? LinkIcon : CheckCircle2;

  const iconColor = 
    type === 'transformation' ? 'text-purple-400 border-purple-500/40 bg-purple-950/40' :
    type === 'achievement' ? 'text-amber-400 border-amber-500/40 bg-amber-950/40' :
    type === 'recovery' ? 'text-fresh-400 border-fresh-500/40 bg-forest-950/40' :
    type === 'chain' ? 'text-amber-300 border-amber-400/40 bg-amber-950/40' :
    'text-fresh-400 border-fresh-400/40 bg-fresh-500/10';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] pointer-events-none flex items-center justify-center p-4">
        
        {/* HIGH ENERGY PARTY-POPPER AMBIENCE ON MILESTONE BURST */}
        {!prefersReducedMotion && (
          <CelebrationAmbience intensity={level === 1 ? 'subtle' : level === 2 ? 'moderate' : 'high'} className="z-[3005]" />
        )}

        {/* CELEBRATION CARD DIALOG */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -20 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className={cn(
            "pointer-events-auto bg-neutral-950/95 border text-white rounded-3xl p-6 shadow-2xl backdrop-blur-md max-w-sm w-full font-sans text-center relative space-y-4 z-[3010]",
            type === 'transformation' ? "border-purple-500/50 shadow-purple-950/60" :
            type === 'achievement' ? "border-amber-500/50 shadow-amber-950/60" :
            "border-fresh-500/50 shadow-fresh-950/40"
          )}
        >
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close celebration notification"
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className={cn("w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto shadow-xl transform hover:scale-105 transition-transform", iconColor)}>
            <IconComponent className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-fresh-400">
              ENVIRONMENTAL MILESTONE 🎉
            </span>
            <h3 className="text-xl font-black text-white">{title || defaultTitle}</h3>
            <p className="text-xs text-neutral-300 font-sans">{message || defaultMessage}</p>
          </div>

          {/* SCORE REVEAL IF PROVIDED */}
          {impactScore && (
            <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl flex items-center justify-around font-mono text-xs shadow-inner">
              {beforeScore !== undefined && afterScore !== undefined ? (
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[9px] text-neutral-500 block">BEFORE</span>
                    <span className="font-bold text-neutral-400">{beforeScore} Pts</span>
                  </div>
                  <span className="text-fresh-400 font-bold">→</span>
                  <div>
                    <span className="text-[9px] text-fresh-400 block">AFTER</span>
                    <span className="font-black text-fresh-400 text-sm">{afterScore} Pts</span>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-[9px] text-neutral-500 block">IMPACT REWARD</span>
                  <span className="font-black text-fresh-400 text-base">+{impactScore} Points</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// 1. REPEAT EXPORTS FOR COMPATIBILITY
export interface ImpactCelebrationProps {
  show: boolean;
  title?: string;
  message?: string;
  onClose?: () => void;
}

export function ImpactCelebration({ show, title, message, onClose }: ImpactCelebrationProps) {
  return (
    <CelebrationBurst 
      show={show} 
      type="success" 
      level={1} 
      title={title} 
      message={message} 
      onClose={onClose} 
    />
  );
}

export interface ChainLinkAnimationProps {
  show: boolean;
  message?: string;
  onClose?: () => void;
}

export function ChainLinkAnimation({ show, message, onClose }: ChainLinkAnimationProps) {
  return (
    <CelebrationBurst 
      show={show} 
      type="chain" 
      level={2} 
      message={message} 
      onClose={onClose} 
    />
  );
}

export interface RecoveryCelebrationProps {
  show: boolean;
  impactScore?: number;
  onClose?: () => void;
}

export function RecoveryCelebration({ show, impactScore = 150, onClose }: RecoveryCelebrationProps) {
  return (
    <CelebrationBurst 
      show={show} 
      type="recovery" 
      level={3} 
      impactScore={impactScore} 
      onClose={onClose} 
    />
  );
}

export interface TransformationRevealProps {
  show: boolean;
  onClose?: () => void;
}

export function TransformationReveal({ show, onClose }: TransformationRevealProps) {
  return (
    <CelebrationBurst 
      show={show} 
      type="transformation" 
      level={3} 
      onClose={onClose} 
    />
  );
}

export interface ScoreRevealProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function ScoreReveal({ value, suffix = '', prefix = '', className }: ScoreRevealProps) {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className={cn("font-mono font-black tracking-tight", className)}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

// 2. HIGH-ENERGY CONTINUOUS PARTY-POPPER AMBIENCE COMPONENT
export interface CelebrationAmbienceProps {
  intensity?: 'subtle' | 'moderate' | 'high';
  className?: string;
}

// Climate-tech celebration palette: Emerald, Fresh Green, Gold, White, Violet, Turquoise
const AMBIENT_PALETTE = ['#059669', '#10b981', '#fbbf24', '#ffffff', '#a855f7', '#06b6d4'];

export function CelebrationAmbience({ intensity = 'moderate', className }: CelebrationAmbienceProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  if (prefersReducedMotion) return null;

  const count = intensity === 'subtle' ? 40 : intensity === 'moderate' ? 80 : 120;

  return (
    <div 
      aria-hidden="true" 
      className={cn("fixed inset-0 pointer-events-none z-[15] overflow-hidden select-none", className)}
    >
      {/* VISUAL LEFT PARTY CANNON NOZZLE */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.25, 1], rotate: [-15, -25, -15] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="w-12 h-16 bg-gradient-to-r from-emerald-600 via-fresh-500 to-amber-400 rounded-r-3xl shadow-2xl flex items-center justify-center opacity-90 border-r-2 border-white/50"
        >
          <div className="w-5 h-5 rounded-full bg-white animate-ping opacity-75" />
        </motion.div>
      </div>

      {/* VISUAL RIGHT PARTY CANNON NOZZLE */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.25, 1], rotate: [15, 25, 15] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="w-12 h-16 bg-gradient-to-l from-emerald-600 via-fresh-500 to-amber-400 rounded-l-3xl shadow-2xl flex items-center justify-center opacity-90 border-l-2 border-white/50"
        >
          <div className="w-5 h-5 rounded-full bg-white animate-ping opacity-75" />
        </motion.div>
      </div>

      {/* LEFT CANNON LAUNCHED PARTICLES & RIBBONS */}
      {Array.from({ length: Math.floor(count / 2) }).map((_, i) => {
        const color = AMBIENT_PALETTE[i % AMBIENT_PALETTE.length];
        const isRibbon = i % 3 === 0;
        const isStar = i % 5 === 0;

        const targetX = 25 + (i * 2.5); // 25vw to 75vw inward
        const targetY = (Math.sin(i) * 200); // arc upward/downward
        const duration = 2.5 + (i % 4) * 0.4;
        const delay = (i % 6) * 0.4;

        return (
          <motion.div
            key={`left-pop-${i}`}
            initial={{
              opacity: 0,
              x: '0vw',
              y: '50vh',
              scale: 0.3,
              rotate: 0,
            }}
            animate={{
              opacity: [0, 1, 0.9, 0],
              x: ['0vw', `${targetX * 0.4}vw`, `${targetX}vw`],
              y: ['50vh', `calc(50vh + ${targetY - 100}px)`, `calc(50vh + ${targetY + 120}px)`],
              scale: [0.3, 1.3, 0.9],
              rotate: [0, 180, 540],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              repeatDelay: 1.2,
              delay: delay,
              ease: "easeOut",
            }}
            style={{
              position: 'absolute',
              width: isRibbon ? '4px' : isStar ? '10px' : '9px',
              height: isRibbon ? '26px' : isStar ? '10px' : '10px',
              backgroundColor: isStar ? 'transparent' : color,
              borderRadius: isStar ? '0%' : isRibbon ? '2px' : i % 2 === 0 ? '50%' : '2px',
              boxShadow: `0 0 12px ${color}`,
            }}
          >
            {isStar && <span style={{ color, fontSize: '14px', fontWeight: 'bold' }}>★</span>}
          </motion.div>
        );
      })}

      {/* RIGHT CANNON LAUNCHED PARTICLES & RIBBONS */}
      {Array.from({ length: Math.floor(count / 2) }).map((_, i) => {
        const color = AMBIENT_PALETTE[(i + 3) % AMBIENT_PALETTE.length];
        const isRibbon = i % 3 === 0;
        const isStar = i % 4 === 0;

        const targetX = 25 + (i * 2.5); // 25vw to 75vw inward from right
        const targetY = (Math.cos(i) * 220); // arc upward/downward
        const duration = 2.4 + (i % 4) * 0.45;
        const delay = 0.3 + (i % 6) * 0.4;

        return (
          <motion.div
            key={`right-pop-${i}`}
            initial={{
              opacity: 0,
              x: '100vw',
              y: '50vh',
              scale: 0.3,
              rotate: 0,
            }}
            animate={{
              opacity: [0, 1, 0.9, 0],
              x: ['100vw', `${100 - (targetX * 0.4)}vw`, `${100 - targetX}vw`],
              y: ['50vh', `calc(50vh + ${targetY - 120}px)`, `calc(50vh + ${targetY + 140}px)`],
              scale: [0.3, 1.3, 0.9],
              rotate: [0, -180, -540],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              repeatDelay: 1.2,
              delay: delay,
              ease: "easeOut",
            }}
            style={{
              position: 'absolute',
              width: isRibbon ? '4px' : isStar ? '10px' : '9px',
              height: isRibbon ? '26px' : isStar ? '10px' : '10px',
              backgroundColor: isStar ? 'transparent' : color,
              borderRadius: isStar ? '0%' : isRibbon ? '2px' : i % 2 === 0 ? '50%' : '2px',
              boxShadow: `0 0 12px ${color}`,
            }}
          >
            {isStar && <span style={{ color, fontSize: '14px', fontWeight: 'bold' }}>✦</span>}
          </motion.div>
        );
      })}
    </div>
  );
}
