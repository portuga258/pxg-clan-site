import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora mesmo';
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return formatDate(date);
}

export function getClanTypeClass(clanType) {
  const classes = {
    malefic: 'clan-malefic',
    naturia: 'clan-naturia',
    wingeon: 'clan-wingeon',
    seavell: 'clan-seavell',
    volcanic: 'clan-volcanic',
    orebound: 'clan-orebound',
    psycraft: 'clan-psycraft',
    gardsen: 'clan-gardsen',
  };
  return classes[clanType?.toLowerCase()] || 'clan-badge bg-gray-800 text-gray-300 border-gray-600';
}

export function getClanTypeName(clanType) {
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

export function getProfessionName(profession) {
  const names = {
    engineer: 'Engenheiro',
    professor: 'Professor',
    stylist: 'Estilista',
    adventurer: 'Aventureiro',
  };
  return names[profession?.toLowerCase()] || profession;
}

export function getRankTierClass(tier) {
  const classes = {
    S: 'rank-s',
    A: 'rank-a',
    B: 'rank-b',
    C: 'rank-c',
    D: 'rank-d',
    E: 'rank-e',
  };
  return classes[tier?.toUpperCase()] || 'rank-e';
}

export function getStatusBadgeClass(status) {
  const classes = {
    open: 'badge-open',
    collecting: 'badge-collecting',
    ready: 'badge-ready',
    completed: 'badge-completed',
    available: 'badge-available',
    borrowed: 'badge-borrowed',
    online: 'badge-available',
    offline: 'badge-completed',
  };
  return classes[status?.toLowerCase()] || 'badge-completed';
}

export function getStatusLabel(status) {
  const labels = {
    open: 'Aberto',
    collecting: 'Em Coleta',
    ready: 'Pronto p/ Entrega',
    completed: 'Concluído',
    available: 'Disponível',
    borrowed: 'Emprestado',
    online: 'Online',
    offline: 'Offline',
  };
  return labels[status?.toLowerCase()] || status;
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}