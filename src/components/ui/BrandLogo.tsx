import { cn } from '../../utils/cn';

export interface BrandLogoProps {
  variant?: 'full' | 'mark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  onClick?: () => void;
}

export function BrandLogo({
  variant = 'full',
  size = 'md',
  className,
  showText = true,
  onClick
}: BrandLogoProps) {
  const markSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const markOnly = variant === 'mark' || !showText;

  if (markOnly) {
    return (
      <img
        src="/logo-mark.svg"
        alt="TrashChain"
        onClick={onClick}
        className={cn(
          "object-contain select-none shrink-0 transition-transform duration-200 hover:scale-105",
          markSizeClasses[size],
          onClick && "cursor-pointer",
          className
        )}
      />
    );
  }

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 select-none font-display tracking-tight shrink-0",
        onClick && "cursor-pointer",
        className
      )}
    >
      <img
        src="/logo-mark.svg"
        alt=""
        aria-hidden="true"
        className={cn("object-contain shrink-0", markSizeClasses[size])}
      />
      <span className={cn(
        "font-black tracking-tight text-neutral-900 dark:text-white flex items-center leading-none",
        size === 'sm' && "text-lg",
        size === 'md' && "text-xl",
        size === 'lg' && "text-2xl",
        size === 'xl' && "text-3xl"
      )}>
        Trash<span className="text-fresh-500 font-black">Chain</span>
      </span>
    </div>
  );
}
