import { cn } from '../../lib/utils';
import { getClanTypeClass } from '../../data/mockData';

const clanEmblems = {
  malefic: '👻',
  naturia: '🌿',
  wingeon: '🕊️',
  seavell: '🌊',
  volcanic: '🌋',
  orebound: '⛏️',
  psycraft: '🔮',
  gardsen: '🌱',
};

const vocationColors = {
  'Elder Druid': 'from-green-500 to-emerald-500',
  'Master Sorcerer': 'from-blue-500 to-cyan-500',
  'Royal Paladin': 'from-yellow-400 to-orange-400',
  'Elite Knight': 'from-gray-400 to-gray-600',
};

export function Avatar({
  src,
  alt,
  name,
  clanType,
  vocation,
  size = 'md',
  status,
  className,
  showStatus = true,
  ...props
}) {
  const sizes = {
    xs: 'avatar-xs',
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradient = (vocation) => {
    return vocationColors[vocation] || 'from-pxg-accent-purple to-pxg-accent-cyan';
  };

  return (
    <div className={cn('relative inline-flex', className)} {...props}>
      <div
        className={cn('avatar relative overflow-hidden rounded-full bg-gradient-to-br', sizes[size], getGradient(vocation))}
        style={{
          background: src ? 'transparent' : `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`
        }}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-pxg-bg-primary font-display font-bold">
            {name ? (
              <span className={cn(
                'select-none',
                size === 'xs' && 'text-xs',
                size === 'sm' && 'text-sm',
                size === 'md' && 'text-base',
                size === 'lg' && 'text-lg',
                size === 'xl' && 'text-xl'
              )}>
                {getInitials(name)}
              </span>
            ) : (
              <span className={cn(
                size === 'xs' && 'text-xs',
                size === 'sm' && 'text-sm',
                size === 'md' && 'text-base',
                size === 'lg' && 'text-lg',
                size === 'xl' && 'text-xl'
              )}>
                {clanType ? clanEmblems[clanType] : '❓'}
              </span>
            )}
          </div>
        )}

        {clanType && (
          <div className="absolute bottom-0 right-0 -translate-x-1/2 translate-y-1/2">
            <span className={cn(getClanTypeClass(clanType), 'text-[10px] px-1.5 py-0.5 whitespace-nowrap shadow-glass')}>
              {clanEmblems[clanType]}
            </span>
          </div>
        )}
      </div>

      {showStatus && status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-pxg-bg-primary',
            statusSizes[size]
          )}
          style={{
            backgroundColor: status === 'online' ? '#00ff88' : '#64748b',
            boxShadow: status === 'online' ? '0 0 8px #00ff88' : 'none'
          }}
          aria-label={status === 'online' ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}

export function AvatarGroup({ avatars = [], maxVisible = 5, size = 'md', className }) {
  const sizes = {
    xs: '-ml-1',
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
    xl: '-ml-5',
  };

  const visibleAvatars = avatars.slice(0, maxVisible);
  const remainingCount = avatars.length - maxVisible;

  return (
    <div className={cn('flex', className)} role="group" aria-label={`${avatars.length} membros`}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={avatar.id || index}
          {...avatar}
          size={size}
          className={cn(index > 0 && sizes[size], 'relative z-10')}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn('avatar flex items-center justify-center bg-pxg-bg-tertiary border-pxg-border-subtle', sizes[size], 'ml-[-0.5rem]', 'font-medium text-pxg-text-secondary')}
          style={{ fontSize: size === 'xs' ? '0.5rem' : size === 'sm' ? '0.625rem' : size === 'md' ? '0.75rem' : size === 'lg' ? '0.875rem' : '1rem' }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}