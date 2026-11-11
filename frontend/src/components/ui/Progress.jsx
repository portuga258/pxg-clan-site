import { cn } from '../../lib/utils';
import { getProfessionInfo, getProfessionName, professionRanks } from '../../data/mockData';

export function Progress({
  value = 0,
  max = 100,
  className,
  showLabel = false,
  label,
  variant = 'default',
  size = 'md',
  animated = false,
  ...props
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  const variants = {
    default: 'bg-pxg-accent-neonGreen',
    purple: 'bg-pxg-accent-purple',
    cyan: 'bg-pxg-accent-cyan',
    gold: 'bg-pxg-accent-gold',
    red: 'bg-pxg-accent-neonRed',
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-caption font-medium text-pxg-text-secondary">{label || 'Progresso'}</span>
        {showLabel && (
          <span className="text-caption font-mono text-pxg-text-primary">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className={cn('progress-bar', sizes[size])} role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={cn(
            'progress-fill rounded-full transition-all duration-700 ease-out',
            variants[variant],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function CircularProgress({
  value = 0,
  max = 100,
  size = 80,
  strokeWidth = 6,
  className,
  showValue = true,
  variant = 'default',
  ...props
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const variants = {
    default: 'stroke-pxg-accent-neonGreen',
    purple: 'stroke-pxg-accent-purple',
    cyan: 'stroke-pxg-accent-cyan',
    gold: 'stroke-pxg-accent-gold',
    red: 'stroke-pxg-accent-neonRed',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }} {...props}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="stroke-pxg-bg-tertiary"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn(
            'transition-all duration-700 ease-out',
            variants[variant]
          )}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold text-pxg-text-primary">
            {size < 60 ? `${Math.round(percentage)}%` : `${Math.round(percentage)}%`}
          </span>
        </div>
      )}
    </div>
  );
}

export function SkillProgress({
  profession,
  level,
  tier,
  skill,
  maxLevel = 100,
  className,
  showTier = true,
  ...props
}) {
  const percentage = (level / maxLevel) * 100;
  const profInfo = getProfessionInfo(profession);
  const profName = getProfessionName(profession);
  const icon = profInfo?.icon || '❓';
  const colors = profInfo?.colors || { primary: '#64748b', secondary: '#e2e8f0' };

  const tierColors = {
    S: 'bg-pxg-accent-gold',
    A: 'bg-pxg-accent-cyan',
    B: 'bg-pxg-accent-neonGreen',
    C: 'bg-pxg-accent-purple',
    D: 'bg-gray-500',
    E: 'bg-gray-600',
  };

  return (
    <div className={cn('glass-card p-4', className)} {...props}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="text-body font-medium text-pxg-text-primary">{profName}</p>
            <p className="text-caption text-pxg-text-muted">Level {level} / {maxLevel}</p>
          </div>
        </div>
        {showTier && (
          <span className={cn(
            'px-2.5 py-1 rounded text-caption font-bold text-pxg-bg-primary',
            tierColors[tier] || tierColors.E
          )}>
            Tier {tier}
          </span>
        )}
      </div>
      <div className="progress-bar h-2.5" style={{ backgroundColor: colors.secondary }}>
        <div
          className={cn('progress-fill rounded-full', tierColors[tier] || tierColors.E)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {skill !== undefined && (
        <p className="text-caption text-pxg-text-muted mt-2">Skill: {skill}</p>
      )}
    </div>
  );
}