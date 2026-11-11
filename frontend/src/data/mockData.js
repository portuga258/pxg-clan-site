export const clanInfo = {
  name: 'Lá Eles',
  tag: 'LAELES',
  slogan: 'Se marcar bobeira na hunt... Lá Eles!',
  emblem: '👻',
  recruitmentStatus: 'open',
  foundedDate: '2024-01-15',
  maxMembers: 50,
  discordUrl: import.meta.env.VITE_DISCORD_URL || '',
};

export const announcements = [];
export const members = [];
export const pokemonLoans = [];
export const itemRequests = [];

export const professionOrder = ['engineer', 'professor', 'stylist', 'adventurer'];

export const professionInfo = {
  engineer: {
    name: 'Engenheiro',
    icon: '⚙️',
    description: 'Especialista em tecnologia e produção de objetos mecânicos e eletrônicos.',
    resources: ['Minérios', 'Corrupted Iron Ore', 'Crypto Diamond Token', 'Tech Data'],
    specializations: ['Hacker', 'Mechanic'],
    npcs: ['Machvise (TC)', 'Kobain (NW)', 'Billy (NW)'],
    rankSRequirements: 'Skill 100 + Level 300 + Quest Introdução NW',
    colors: { primary: '#0369a1', secondary: '#bae6fd' },
  },
  professor: {
    name: 'Professor',
    icon: '📚',
    description: 'Mestre no conhecimento acadêmico, nas Philosopher Stones e nas Dungeons Acadêmicas.',
    resources: ['Philosopher Stone', 'Estudantes', 'Dungeons Acadêmico'],
    specializations: [],
    npcs: [],
    rankSRequirements: 'Skill 100 + Level 300',
    colors: { primary: '#7c3aed', secondary: '#ddd6fe' },
  },
  stylist: {
    name: 'Estilista',
    icon: '🎨',
    description: 'Mestre na criação de roupas, addons, toys, figures e itens de mobilidade.',
    resources: ['Style Points', 'Logs', 'Purpleheart Log', 'Nightmare Style Points', 'Drawing Clipboards'],
    specializations: ['Designer', 'Decorator'],
    npcs: ['Luna (TC)', 'Luna (NW)', 'Lillian (NW)'],
    rankSRequirements: 'Skill 100 + Level 300 + Quest Introdução NW',
    colors: { primary: '#ec4899', secondary: '#fce7f3' },
  },
  adventurer: {
    name: 'Aventureiro',
    icon: '🗺️',
    description: 'Explorador focado em mapas, dungeons semanais, cozinha e arqueologia.',
    resources: ['Mapas', 'Dungeons Semanais', 'Cozinheiro', 'Dungeons Arqueólogo'],
    specializations: [],
    npcs: [],
    rankSRequirements: 'Skill 100 + Level 300',
    colors: { primary: '#059669', secondary: '#a7f3d0' },
  },
};

export const itemCategories = [
  { id: 'hunt-loot', name: 'Loot de Hunt', icon: '💎' },
  { id: 'evolution-stone', name: 'Pedras de Evolução', icon: '💠' },
  { id: 'boss-loot', name: 'Loot de Boss', icon: '👑' },
  { id: 'consumable', name: 'Consumíveis', icon: '🧪' },
  { id: 'craft-material', name: 'Materiais de Craft', icon: '🔨' },
  { id: 'quest-item', name: 'Itens de Quest', icon: '📜' },
  { id: 'lab-component', name: 'Componentes de Lab', icon: '⚗️' },
];

export const pokemonTypes = [
  'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
  'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug',
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy',
];

export const pokemonUtilities = [
  'Blocker', 'Hiker', 'Fly', 'Surf', 'Healer', 'Support',
  'High DPS', 'Tank', 'Speed', 'Catcher',
];

export const professionRanks = [
  { tier: 'E', skillRange: '0-20', minLevel: 10, label: 'Novato' },
  { tier: 'D', skillRange: '20-40', minLevel: 35, label: 'Iniciante' },
  { tier: 'C', skillRange: '40-60', minLevel: 70, label: 'Aprendiz' },
  { tier: 'B', skillRange: '60-80', minLevel: 140, label: 'Veterano' },
  { tier: 'A', skillRange: '80-100', minLevel: 250, label: 'Expert' },
  { tier: 'S', skillRange: '100-120', minLevel: 300, label: 'Mestre' },
];

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

export function getProfessionInfo(profession) {
  return professionInfo[profession?.toLowerCase()] || null;
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

export function getRankTierClass(tier) {
  const classes = { S: 'rank-s', A: 'rank-a', B: 'rank-b', C: 'rank-c', D: 'rank-d', E: 'rank-e' };
  return classes[tier?.toUpperCase()] || 'rank-e';
}

export function getRankTierLabel(tier) {
  const labels = { S: 'Mestre', A: 'Expert', B: 'Veterano', C: 'Aprendiz', D: 'Iniciante', E: 'Novato' };
  return labels[tier?.toUpperCase()] || tier;
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
    ready: 'Pronto',
    completed: 'Concluído',
    available: 'Disponível',
    borrowed: 'Emprestado',
    online: 'Online',
    offline: 'Offline',
  };
  return labels[status?.toLowerCase()] || status;
}

export function getMemberById(id) {
  return members.find((member) => member.id === id);
}

export function getMemberByName(name) {
  return members.find((member) => member.characterName === name || member.username === name);
}

export function getOnlineMembers() {
  return members.filter((member) => member.activityStatus === 'online');
}

export function getMembersByClanType(clanType) {
  return members.filter((member) => member.clanType === clanType);
}

export function getMembersByProfession(profession, minTier = 'E') {
  const tierOrder = { S: 6, A: 5, B: 4, C: 3, D: 2, E: 1 };
  const minValue = tierOrder[minTier] || 1;
  return members.filter((member) => {
    const level = member.professions[profession];
    return level && tierOrder[level.tier] >= minValue;
  });
}

export function getAvailablePokemons(filters = {}) {
  return pokemonLoans.filter((pokemon) => {
    if (filters.type && !pokemon.type.includes(filters.type)) return false;
    if (filters.minLevel && pokemon.level < filters.minLevel) return false;
    if (filters.utility && !pokemon.utility.includes(filters.utility)) return false;
    if (filters.status && pokemon.status !== filters.status) return false;
    if (filters.ownerId && pokemon.ownerId !== filters.ownerId) return false;
    return true;
  });
}

export function getItemRequestsByStatus(status) {
  return status ? itemRequests.filter((request) => request.status === status) : itemRequests;
}

export function getItemRequestsForMember(memberId) {
  return itemRequests.filter((request) => request.targetId === memberId || request.requesterId === memberId);
}

export function getPokemonLoansForMember(memberId) {
  return pokemonLoans.filter((pokemon) => pokemon.ownerId === memberId || pokemon.borrowerId === memberId);
}
