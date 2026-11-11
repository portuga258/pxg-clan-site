import { cn } from '../../lib/utils';
import {
  getClanTypeClass,
  getClanTypeName,
  getRankTierClass,
  getStatusBadgeClass,
  getStatusLabel,
  getProfessionName,
  getProfessionInfo,
} from '../../data/mockData';

export function Badge({ children, variant = 'default', className, ...props }) {
  const variants = {
    default: 'badge',
    leader: 'badge-leader',
    officer: 'badge-officer',
    'master-crafter': 'badge-master-crafter',
    open: 'badge-open',
    collecting: 'badge-collecting',
    ready: 'badge-ready',
    completed: 'badge-completed',
    available: 'badge-available',
    borrowed: 'badge-borrowed',
    online: 'badge-available',
    offline: 'badge-completed',
  };

  return (
    <span className={cn(variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

export function ClanBadge({ clanType, className, showIcon = true }) {
  const icons = {
    malefic: '👻',
    naturia: '🌿',
    wingeon: '🕊️',
    seavell: '🌊',
    volcanic: '🌋',
    orebound: '⛏️',
    psycraft: '🔮',
    gardsen: '🌱',
  };

  return (
    <span className={cn(getClanTypeClass(clanType), className)}>
      {showIcon && <span aria-hidden="true">{icons[clanType?.toLowerCase()] || '❓'}</span>}
      {getClanTypeName(clanType)}
    </span>
  );
}

export function RankTierBadge({ tier, className }) {
  return (
    <span className={cn(getRankTierClass(tier), className)}>
      {tier}
    </span>
  );
}

export function StatusBadge({ status, className, showDot = true }) {
  const label = getStatusLabel(status);
  const badgeClass = getStatusBadgeClass(status);

  return (
    <span className={cn(badgeClass, className)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            backgroundColor: status === 'online' || status === 'available' || status === 'open' || status === 'ready'
              ? '#00ff88'
              : status === 'collecting'
                ? '#ffd700'
                : '#64748b'
          }}
        />
      )}
      {label}
    </span>
  );
}

export function ProfessionBadge({ profession, level, tier, skill, className, compact = false }) {
  const profInfo = getProfessionInfo(profession);
  const profName = getProfessionName(profession);
  const icon = profInfo?.icon || '❓';
  const colors = profInfo?.colors || { primary: '#64748b', secondary: '#e2e8f0' };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg', className)} style={{ backgroundColor: colors.secondary, borderColor: colors.primary }}>
        <span aria-hidden="true" className="text-body">{icon}</span>
        <span className="text-body-sm font-medium text-pxg-text-primary">{profName}</span>
        <RankTierBadge tier={tier} />
        <span className="text-caption text-pxg-text-muted">Lv.{level}</span>
        {skill && <span className="text-caption text-pxg-text-muted">Skill {skill}</span>}
      </div>
    );
  }

  return (
    <div className={cn('glass-card p-3', className)} style={{ borderColor: colors.primary }}>
      <div className="flex items-center gap-2 mb-2">
        <span aria-hidden="true" className="text-2xl">{icon}</span>
        <div>
          <p className="text-body font-medium text-pxg-text-primary">{profName}</p>
          <p className="text-caption text-pxg-text-muted">Level {level} • Tier {tier} • Skill {skill || '—'}</p>
        </div>
      </div>
      <div className="progress-bar" style={{ backgroundColor: colors.secondary }}>
        <div
          className="progress-fill rounded-full transition-all duration-700 ease-out"
          style={{ width: '0%', backgroundColor: colors.primary }}
          data-progress="0"
        ></div>
      </div>
    </div>
  );
}