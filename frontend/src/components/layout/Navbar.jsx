import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Membros', href: '/members', icon: Users },
  { name: 'Requests', href: '/requests', icon: Package },
  { name: 'Itens de Hunt', href: '/items', icon: ShoppingCart },
];

export function Navbar({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const knownRequestIds = useRef(null);
  const audioContext = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { token, switchCharacter } = useAuth();

  useEffect(() => {
    const unlockAudio = () => {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioContext.current) audioContext.current = new AudioContextClass();
      if (audioContext.current.state === 'suspended') {
        audioContext.current.resume().catch((error) => {
          console.error('Não foi possível habilitar o som dos requests:', error);
        });
      }
    };

    window.addEventListener('pointerdown', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      audioContext.current?.close();
      audioContext.current = null;
    };
  }, []);

  useEffect(() => {
    let active = true;
    if (!token) {
      knownRequestIds.current = null;
      return () => { active = false; };
    }

    const loadRequestNotifications = () => {
      Promise.all([
        apiRequest('/item-requests/notifications/count', { token }),
        apiRequest('/item-requests/notifications/requests?limit=100', { token }),
      ])
        .then(([{ count }, { data }]) => {
          if (!active) return;
          setRequestCount(count);
          const currentIds = new Set(data.map((request) => request.id));
          if (knownRequestIds.current) {
            const hasNewRequest = [...currentIds].some((id) => !knownRequestIds.current.has(id));
            const context = audioContext.current;
            if (hasNewRequest && context?.state === 'running') {
              const oscillator = context.createOscillator();
              const gain = context.createGain();
              const now = context.currentTime;
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(880, now);
              gain.gain.setValueAtTime(0.0001, now);
              gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
              gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
              oscillator.connect(gain);
              gain.connect(context.destination);
              oscillator.start(now);
              oscillator.stop(now + 0.36);
            }
          }
          knownRequestIds.current = currentIds;
        })
        .catch((error) => {
          if (active) console.error('Não foi possível atualizar as notificações de requests:', error);
        });
    };

    loadRequestNotifications();
    const intervalId = window.setInterval(loadRequestNotifications, 15000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [token]);
  const visibleRequestCount = token && user?.characterId ? requestCount : 0;
  const switchableCharacters = user?.characters || [];

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
    ...switchableCharacters
      .filter((character) => character.id !== user?.characterId)
      .map((character) => ({
        key: `character-${character.id}`,
        label: `Usar ${character.name}${character.is_primary ? ' · Principal' : ''}`,
        icon: <User className="w-4 h-4" />,
        onClick: () => {
          switchCharacter(character.id);
          navigate(`/members/${character.id}`);
        },
      })),
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
                {item.name === 'Requests' && visibleRequestCount > 0 && (
                  <span
                    className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-pxg-accent-neonRed px-1.5 py-0.5 text-[10px] font-bold leading-none text-white"
                    aria-label={`${visibleRequestCount} requests aguardando sua atenção`}
                  >
                    {visibleRequestCount > 99 ? '99+' : visibleRequestCount}
                  </span>
                )}
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
                  {item.name === 'Requests' && visibleRequestCount > 0 && (
                    <span
                      className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-pxg-accent-neonRed px-1.5 py-0.5 text-[10px] font-bold leading-none text-white"
                      aria-label={`${visibleRequestCount} requests aguardando sua atenção`}
                    >
                      {visibleRequestCount > 99 ? '99+' : visibleRequestCount}
                    </span>
                  )}
                </NavLink>
              ))}
              <div className="pt-3 border-t border-pxg-border-subtle/30 flex flex-wrap items-center gap-3">
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
                    {switchableCharacters.length > 1 && (
                      <div className="w-full space-y-1">
                        <p className="text-caption text-pxg-text-muted">Alternar personagem</p>
                        {switchableCharacters
                          .filter((character) => character.id !== user.characterId)
                          .map((character) => (
                            <Link
                              key={character.id}
                              to={`/members/${character.id}`}
                              onClick={() => {
                                switchCharacter(character.id);
                                setMobileMenuOpen(false);
                              }}
                              className="block rounded-lg px-3 py-2 text-body-sm text-pxg-text-secondary hover:bg-pxg-bg-tertiary/50"
                            >
                              {character.name}{character.is_primary ? ' · Principal' : ''}
                            </Link>
                          ))}
                      </div>
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
