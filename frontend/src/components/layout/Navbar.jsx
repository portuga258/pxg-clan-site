import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Discord,
} from '../../lib/icons';
import { clanInfo } from '../../data/mockData';
import { Avatar, Dropdown, Button } from '../ui';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Membros', href: '/members', icon: Users },
  { name: 'Empréstimos', href: '/loans', icon: Package },
  { name: 'Itens de Hunt', href: '/items', icon: ShoppingCart },
];

export function Navbar({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuItems = [
    ...(clanInfo.discordUrl ? [{
      key: 'discord',
      label: 'Discord do Clan',
      icon: <Discord className="w-4 h-4" />,
      onClick: () => window.open(clanInfo.discordUrl, '_blank', 'noopener,noreferrer'),
    }] : []),
    ...(user?.characterId ? [{
      key: 'profile',
      label: 'Meu perfil',
      icon: <User className="w-4 h-4" />,
      onClick: () => navigate(`/members/${user.characterId}`),
    }] : []),
    { key: 'logout', label: 'Sair', icon: <LogOut className="w-4 h-4" />, onClick: onLogout },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-panel border-b border-pxg-border-subtle/30">
      <nav className="container-pxg" aria-label="Navegação principal">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3" aria-label={`${clanInfo.name} - Home`}>
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pxg-accent-purple to-pxg-accent-cyan flex items-center justify-center text-2xl">
                {clanInfo.emblem}
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-display-sm text-pxg-text-primary tracking-tight">{clanInfo.name}</h1>
              <p className="text-[10px] text-pxg-text-muted uppercase tracking-wider">{clanInfo.tag}</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-body-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-pxg-accent-neonGreen bg-pxg-accent-neonGreen/10'
                    : 'text-pxg-text-secondary hover:text-pxg-text-primary hover:bg-pxg-bg-tertiary/50'
                )}
              >
                <item.icon className="w-4 h-4" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <Dropdown
                trigger={
                  <div className="flex items-center gap-2 pr-2">
                    <Avatar
                      name={user.characterName}
                      clanType={user.clanType}
                      size="sm"
                      status={user.activityStatus}
                      showStatus
                    />
                    <span className="hidden lg:block text-body-sm font-medium text-pxg-text-primary">
                      {user.characterName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-pxg-text-muted" />
                  </div>
                }
                items={menuItems}
                align="right"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm"><Link to="/login">Entrar</Link></Button>
                <Button asChild size="sm"><Link to="/register">Criar conta</Link></Button>
              </div>
            )}
          </div>

          <button
            className="md:hidden btn-ghost btn-sm p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-pxg-border-subtle/30 animate-slide-down">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-body font-medium transition-colors',
                    isActive
                      ? 'text-pxg-accent-neonGreen bg-pxg-accent-neonGreen/10'
                      : 'text-pxg-text-secondary hover:text-pxg-text-primary hover:bg-pxg-bg-tertiary/50'
                  )}
                >
                  <item.icon className="w-5 h-5" aria-hidden="true" />
                  {item.name}
                </NavLink>
              ))}
              <div className="pt-3 border-t border-pxg-border-subtle/30 flex items-center gap-3">
                {user ? (
                  <>
                    <Avatar
                      name={user.characterName}
                      clanType={user.clanType}
                      size="md"
                      status={user.activityStatus}
                    />
                    <div className="flex-1">
                      <p className="text-body font-medium text-pxg-text-primary">{user.characterName}</p>
                      <p className="text-caption text-pxg-text-muted">
                        {user.level ? `Level ${user.level} • ` : ''}{getClanTypeName(user.clanType) || 'Membro'}
                      </p>
                    </div>
                    {user.characterId && (
                      <Button asChild size="sm" variant="secondary">
                        <Link to={`/members/${user.characterId}`} onClick={() => setMobileMenuOpen(false)}>Meu perfil</Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={onLogout}>Sair</Button>
                  </>
                ) : (
                  <div className="flex flex-1 gap-2">
                    <Button asChild variant="ghost" fullWidth><Link to="/login">Entrar</Link></Button>
                    <Button asChild fullWidth><Link to="/register">Criar conta</Link></Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

function getClanTypeName(clanType) {
  const names = {
    malefic: 'Malefic',
    naturia: 'Naturia',
    wingeon: 'Wingeon',
    seavell: 'Seavell',
    volcanic: 'Volcanic',
    orebound: 'Orebound',
    psycraft: 'Psycraft',
    gardsen: 'Gardsen',
  };
  return names[clanType?.toLowerCase()] || clanType;
}
