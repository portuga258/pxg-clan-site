import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { cn } from '../../lib/utils';

export function Layout({ user, onLogout, children }) {
  const content = children ?? <Outlet />;

  return (
    <div className="min-h-screen bg-pxg-bg-primary">
      <Navbar user={user} onLogout={onLogout} />
      <main className="pt-16 min-h-[calc(100vh-4rem)]" id="main-content" tabIndex={-1}>
        {content}
      </main>
      <footer className="border-t border-pxg-border-subtle/30 bg-pxg-bg-card/50 backdrop-blur-glass">
        <div className="container-pxg py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-caption text-pxg-text-muted">
              {'© 2026 Lá Eles - Clan PokéXGames. Não oficial, feito por fãs para fãs.'}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://discord.gg/pxg-clan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-caption text-pxg-text-secondary hover:text-pxg-accent-cyan transition-colors"
              >
                Discord
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-caption text-pxg-text-secondary hover:text-pxg-accent-cyan transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageLayout({ title, description, children, className, actions }) {
  return (
    <div className={cn('container-pxg py-8', className)}>
      <header className="mb-8 animate-slide-up">
        <h1 className="font-display font-bold text-display-lg text-pxg-text-primary">{title}</h1>
        {description && (
          <p className="text-body text-pxg-text-secondary mt-2 max-w-2xl">{description}</p>
        )}
        {actions && (
          <div className="mt-4 flex flex-wrap gap-3">
            {actions}
          </div>
        )}
      </header>
      <div className="animate-fade-in">
        {children}
      </div>
    </div>
  );
}

export function Section({ title, description, children, className, action }) {
  return (
    <section className={cn('section', className)} aria-labelledby={title ? 'section-title' : undefined}>
      {(title || action) && (
        <header className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            {title && (
              <h2 id="section-title" className="font-display font-semibold text-display-md text-pxg-text-primary">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-body-sm text-pxg-text-secondary mt-1">{description}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </header>
      )}
      <div>{children}</div>
    </section>
  );
}

export function Grid({ columns = 1, sm = 2, lg = 3, xl = 4, gap = 6, className, children }) {
  return (
    <div className={cn(
      'grid gap-6',
      `grid-cols-${columns}`,
      `sm:grid-cols-${sm}`,
      `lg:grid-cols-${lg}`,
      `xl:grid-cols-${xl}`,
      className
    )}>
      {children}
    </div>
  );
}