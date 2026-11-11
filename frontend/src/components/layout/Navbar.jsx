import { useState } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  Discord,
  Crown,
  Shield,
  Sparkles,
} from '../../lib/icons';
import { clanInfo } from '../../data/mockData';
import { Avatar, Dropdown, Button, Badge } from '../ui';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Membros', href: '/members', icon: Users },
  { name: 'Empréstimos', href: '/loans', icon: Package },
  { name: 'Itens de Hunt', href: '/items', icon: ShoppingCart },
];

const userMenuItems = [
  { key: 'profile', label: 'Meu Perfil', icon: User, onClick: () => {} },
  { key: 'settings', label: 'Configurações', icon: Settings, onClick: () => {} },
  { key: 'divider', divider: true },
  { key: 'discord', label: 'Discord do Clan', icon: Discord, onClick: () => window.open(clanInfo.discordUrl, '_blank') },
  { key: 'logout', label: 'Sair', icon: LogOut, onClick: () => {} },
];

export function Navbar({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const currentUser = user || {
    characterName: 'Portugap',
    clanType: 'malefic',
    level: 487,
    badges: ['leader'],
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass-panel border-b border-pxg-border-subtle/30">
      <nav className="container-pxg" aria-label="Navegação principal">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-3" aria-label={`${clanInfo.name} - Home`}>
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pxg-accent-purple to-pxg-accent-cyan flex items-center justify-center text-2xl">
                {clanInfo.emblem}
              </div>
              {clanInfo.recruitmentStatus === 'open' && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-pxg-accent-neonGreen rounded-full border-2 border-pxg-bg-primary animate-pulse" aria-label="Recrutamento aberto" />
              )}
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-display-sm text-pxg-text-primary tracking-tight">{clanInfo.name}</h1>
              <p className="text-[10px] text-pxg-text-muted uppercase tracking-wider">{clanInfo.tag}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
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

          {/* Right Side - User Menu */}
          <div className="flex items-center gap-3">
            {/* Recruitment Status Badge */}
            <Badge variant={clanInfo.recruitmentStatus === 'open' ? 'available' : 'borrowed'} className="hidden sm:inline-flex">
              {clanInfo.recruitmentStatus === 'open' ? 'Recrutamento Aberto' : 'Recrutamento Fechado'}
            </Badge>

            {/* User Avatar Dropdown */}
            <Dropdown
              trigger={
                <div className="flex items-center gap-2 pr-2" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <Avatar
                    name={currentUser.characterName}
                    clanType={currentUser.clanType}
                    size="sm"
                    status={currentUser.activityStatus || 'online'}
                    showStatus
                  />
                  <span className="hidden sm:block text-body-sm font-medium text-pxg-text-primary">
                    {currentUser.characterName}
                  </span>
                  <ChevronDown className="w-4 h-4 text-pxg-text-muted" />
                </div>
              }
              items={userMenuItems}
              align="right"
            />
          </div>

          {/* Mobile Menu Button */}
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

        {/* Mobile Menu */}
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
                <Avatar
                  name={currentUser.characterName}
                  clanType={currentUser.clanType}
                  size="md"
                  status={currentUser.activityStatus || 'online'}
                />
                <div className="flex-1">
                  <p className="text-body font-medium text-pxg-text-primary">{currentUser.characterName}</p>
                  <p className="text-caption text-pxg-text-muted">Level {currentUser.level} • {getClanTypeName(currentUser.clanType)}</p>
                </div>
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