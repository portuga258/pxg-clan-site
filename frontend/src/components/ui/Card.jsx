import { cn } from '../../lib/utils';

export function Card({ className, children, hover = false, neon = false, ...props }) {
  return (
    <article
      className={cn(
        'glass-card',
        hover && 'glass-card-hover',
        neon && 'glass-card-neon',
        className
      )}
      {...props}
    >
      {children}
    </article>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <header className={cn('px-4 py-3 border-b border-pxg-border-subtle/30', className)} {...props}>
      {children}
    </header>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn('text-display-sm font-display font-semibold text-pxg-text-primary', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-body-sm text-pxg-text-secondary mt-0.5', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('px-4 py-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <footer className={cn('px-4 py-3 border-t border-pxg-border-subtle/30 flex items-center gap-3', className)} {...props}>
      {children}
    </footer>
  );
}

export function GlassPanel({ className, children, ...props }) {
  return (
    <div className={cn('glass-panel p-4', className)} {...props}>
      {children}
    </div>
  );
}

export function StatsCard({ label, value, change, trend, icon, className }) {
  return (
    <Card className={className}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-caption text-pxg-text-muted uppercase tracking-wider">{label}</p>
            <p className="text-display-sm font-display font-bold text-pxg-text-primary mt-1">{value}</p>
            {change && (
              <div className={cn('flex items-center gap-1 mt-2', trend === 'up' ? 'text-pxg-accent-neonGreen' : 'text-pxg-accent-neonRed')}>
                <span className="text-body-sm font-medium">{change}</span>
                <span className="text-caption text-pxg-text-muted">vs período anterior</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-2 rounded-lg bg-pxg-bg-tertiary/50 text-2xl">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}