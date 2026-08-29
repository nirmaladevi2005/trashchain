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

// Particle colors strictly adhering to climate-tech palette
const PARTICLE_COLORS = [
  '#059669', // Forest Green
  '#10b981', // Fresh Green
  '#f59e0b', // Amber Accent
  '#a855f7', // Purple Transformation
  '#ffffff', // White Highlight
];

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
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string; size: number; rotate: number }>>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      setPrefersReducedMotion(window.matchMedia('(prefers-color-scheme: reduce)').matches);
    }
  }, []);

  useEffect(() => {
    if (!show) return;

    // Generate burst particles based on level
    const particleCount = level === 1 ? 12 : level === 2 ? 20 : 30;
    const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * (level === 3 ? 320 : 200),
      y: -Math.random() * (level === 3 ? 240 : 160) - 20,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      size: Math.floor(Math.random() * 6) + 4,
      rotate: Math.floor(Math.random() * 360),
    }));

    setParticles(newParticles);

    // Auto dismiss after 2.5s
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 2800);

    return () => clearTimeout(timer);
  }, [show, level, onClose]);

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
        
        {/* PARTY-POPPER CONFETTI BURST PARTICLES */}
        {!prefersReducedMotion && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 1, x: 0, y: 0, scale: 0.5, rotate: 0 }}
                animate={{
                  opacity: [1, 1, 0],
                  x: p.x,
                  y: p.y,
                  scale: [0.5, 1.2, 0.8],
                  rotate: p.rotate,
                }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  width: `${p.size}px`,
                  height: `${p.size * (p.id % 2 === 0 ? 1 : 2.5)}px`,
                  backgroundColor: p.color,
                  borderRadius: p.id % 3 === 0 ? '50%' : '2px',
                }}
              />
            ))}
          </div>
        )}

        {/* CELEBRATION CARD DIALOG */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={cn(
            "pointer-events-auto bg-neutral-950/95 border text-white rounded-3xl p-6 shadow-2xl backdrop-blur-md max-w-sm w-full font-sans text-center relative space-y-4",
            type === 'transformation' ? "border-purple-500/50 shadow-purple-950/50" :
            type === 'achievement' ? "border-amber-500/50 shadow-amber-950/50" :
            "border-fresh-500/50 shadow-fresh-950/30"
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

          <div className={cn("w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto shadow-lg", iconColor)}>
            <IconComponent className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-fresh-400">
              ENVIRONMENTAL MILESTONE
            </span>
            <h3 className="text-lg font-black text-white">{title || defaultTitle}</h3>
            <p className="text-xs text-neutral-300 font-sans">{message || defaultMessage}</p>
          </div>

          {/* SCORE REVEAL IF PROVIDED */}
          {impactScore && (
            <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl flex items-center justify-around font-mono text-xs">
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
                  <span className="text-[9px] text-neutral-500 block">REWARD</span>
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
