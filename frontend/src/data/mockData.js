// Mock data for PXG Clan Site
// This simulates the backend data structure
// Based on official PXG Wiki: https://wiki.pokexgames.com/

export const clanInfo = {
  name: 'Lá Eles',
  tag: 'LAELES',
  slogan: 'Se marcar bobeira na hunt... Lá Eles!',
  emblem: '👻', // Gengar
  recruitmentStatus: 'open', // 'open' | 'closed'
  foundedDate: '2024-01-15',
  memberCount: 47,
  maxMembers: 50,
  discordUrl: 'https://discord.gg/pxg-clan',
};

export const announcements = [
  {
    id: '1',
    title: '🎉 Evento de Bônus de XP - Fim de Semana',
    content: 'Pessoal, teremos bônus de 50% XP neste fim de semana (sábado e domingo). Organizem suas hunts em grupo para maximizar o ganho! Lembrem-se de usar Food Bags.',
    author: 'Portugap',
    authorRole: 'leader',
    createdAt: '2026-11-08T14:30:00Z',
    pinned: true,
    type: 'event',
  },
  {
    id: '2',
    title: '📋 Regras Atualizadas de Hunt em Party',
    content: 'Atualizamos as regras de divisão de loot em party. Agora itens de boss (chance < 1%) vão para o membro que precisar para quest/addon. Demais itens: roll livre.',
    author: 'ShadowMaster',
    authorRole: 'officer',
    createdAt: '2026-11-05T10:00:00Z',
    pinned: true,
    type: 'rule',
  },
  {
    id: '3',
    title: '🔧 Manutenção do Site - 12/11',
    content: 'O site ficará indisponível na terça-feira (12/11) das 02:00 às 04:00 para deploy da nova versão do sistema de empréstimos.',
    author: 'TechSupport',
    authorRole: 'officer',
    createdAt: '2026-11-10T18:00:00Z',
    pinned: false,
    type: 'maintenance',
  },
];

export const members = [
  {
    id: '1',
    username: 'Portugap',
    characterName: 'Portugap',
    level: 487,
    clanType: 'malefic',
    vocation: 'Elder Druid',
    activityStatus: 'online',
    peakHours: '20h-23h (BRT)',
    favoriteHunts: ['Roshamuul', 'Grim Reaper', 'Ferumbras Tower'],
    professions: {
      engineer: { level: 100, tier: 'S', rank: 'Master', progress: 100, skill: 120 },
      adventurer: { level: 95, tier: 'A', rank: 'Expert', progress: 90, skill: 95 },
      stylist: { level: 88, tier: 'A', rank: 'Expert', progress: 85, skill: 90 },
      professor: { level: 45, tier: 'C', rank: 'Apprentice', progress: 40, skill: 55 },
    },
    badges: ['leader', 'master-crafter'],
    joinDate: '2024-01-15',
    discordId: 'portugap#1234',
    bio: 'Fundador do clan. Especialista em hunts de alto nível e craft de Engenheiro/Estilista. Rank S em Engenheiro.',
  },
  {
    id: '2',
    username: 'ShadowMaster',
    characterName: 'ShadowMaster',
    level: 452,
    clanType: 'malefic',
    vocation: 'Master Sorcerer',
    activityStatus: 'online',
    peakHours: '19h-22h (BRT)',
    favoriteHunts: ['Oramond Dungeon', 'Drefia', 'Library'],
    professions: {
      engineer: { level: 92, tier: 'A', rank: 'Expert', progress: 88, skill: 92 },
      adventurer: { level: 85, tier: 'A', rank: 'Expert', progress: 75, skill: 85 },
      stylist: { level: 78, tier: 'B', rank: 'Veteran', progress: 65, skill: 78 },
      professor: { level: 60, tier: 'B', rank: 'Journeyman', progress: 55, skill: 60 },
    },
    badges: ['officer', 'master-crafter'],
    joinDate: '2024-02-10',
    discordId: 'shadowmaster#5678',
    bio: 'Officer responsável por organização de hunts em grupo. Engenheiro e Aventureiro avançados.',
  },
  {
    id: '3',
    username: 'NightHunter',
    characterName: 'NightHunter',
    level: 428,
    clanType: 'naturia',
    vocation: 'Royal Paladin',
    activityStatus: 'offline',
    peakHours: '14h-18h (BRT)',
    favoriteHunts: ['Oramond West', 'Seacrest Grounds', 'Edron Dragon Lair', 'Mapas de Aventureiro'],
    professions: {
      engineer: { level: 50, tier: 'C', rank: 'Apprentice', progress: 50, skill: 50 },
      adventurer: { level: 100, tier: 'S', rank: 'Master', progress: 100, skill: 110 },
      stylist: { level: 45, tier: 'C', rank: 'Apprentice', progress: 30, skill: 45 },
      professor: { level: 88, tier: 'A', rank: 'Expert', progress: 85, skill: 88 },
    },
    badges: ['master-crafter'],
    joinDate: '2024-03-22',
    discordId: 'nighthunter#9012',
    bio: 'Aventureiro Rank S (Master). Foca em mapas de aventureiro, dungeons semanais e coleta para o clan. Professor avançado.',
  },
  {
    id: '4',
    username: 'ArcaneBlade',
    characterName: 'ArcaneBlade',
    level: 398,
    clanType: 'psycraft',
    vocation: 'Elite Knight',
    activityStatus: 'online',
    peakHours: '21h-01h (BRT)',
    favoriteHunts: ['Kulag', 'Demona', 'Hellgate'],
    professions: {
      engineer: { level: 82, tier: 'B', rank: 'Veteran', progress: 70, skill: 82 },
      adventurer: { level: 75, tier: 'B', rank: 'Veteran', progress: 68, skill: 75 },
      stylist: { level: 38, tier: 'C', rank: 'Apprentice', progress: 25, skill: 38 },
      professor: { level: 30, tier: 'D', rank: 'Novice', progress: 20, skill: 30 },
    },
    badges: [],
    joinDate: '2024-05-14',
    discordId: 'arcaneblade#3456',
    bio: 'Tank principal do clan. Engenheiro e Aventureiro para equipamentos e mapas.',
  },
  {
    id: '5',
    username: 'MysticHealer',
    characterName: 'MysticHealer',
    level: 367,
    clanType: 'seavell',
    vocation: 'Elder Druid',
    activityStatus: 'offline',
    peakHours: '16h-20h (BRT)',
    favoriteHunts: ['Feyrist', 'Roshamuul', 'Grim Reaper', 'Nightmare World'],
    professions: {
      engineer: { level: 40, tier: 'C', rank: 'Apprentice', progress: 35, skill: 40 },
      adventurer: { level: 55, tier: 'C', rank: 'Apprentice', progress: 45, skill: 55 },
      stylist: { level: 85, tier: 'A', rank: 'Expert', progress: 80, skill: 85 },
      professor: { level: 80, tier: 'B', rank: 'Veteran', progress: 72, skill: 80 },
    },
    badges: [],
    joinDate: '2024-07-08',
    discordId: 'mystichealer#7890',
    bio: 'Healer e Estilista Expert. Fornece addons, roupas e itens de coleção. Professor avançado para Philosopher Stone.',
  },
  {
    id: '6',
    username: 'FireWalker',
    characterName: 'FireWalker',
    level: 345,
    clanType: 'volcanic',
    vocation: 'Master Sorcerer',
    activityStatus: 'online',
    peakHours: '22h-02h (BRT)',
    favoriteHunts: ['Roshamuul', 'Ferumbras Tower', 'Hellgate', 'Volcanic Hunt'],
    professions: {
      engineer: { level: 65, tier: 'B', rank: 'Journeyman', progress: 62, skill: 65 },
      adventurer: { level: 72, tier: 'B', rank: 'Veteran', progress: 62, skill: 72 },
      stylist: { level: 28, tier: 'D', rank: 'Novice', progress: 15, skill: 28 },
      professor: { level: 25, tier: 'D', rank: 'Novice', progress: 10, skill: 25 },
    },
    badges: [],
    joinDate: '2024-09-30',
    discordId: 'firewalker#2345',
    bio: 'Mage DPS. Engenheiro para Pokébolas exclusivas. Aventureiro para mapas e dungeons.',
  },
  {
    id: '7',
    username: 'IronFist',
    characterName: 'IronFist',
    level: 312,
    clanType: 'orebound',
    vocation: 'Elite Knight',
    activityStatus: 'offline',
    peakHours: '18h-22h (BRT)',
    favoriteHunts: ['Oramond Dungeon', 'Drefia', 'Kulag', 'Minérios NW'],
    professions: {
      engineer: { level: 100, tier: 'S', rank: 'Master', progress: 100, skill: 115 },
      adventurer: { level: 68, tier: 'B', rank: 'Veteran', progress: 58, skill: 68 },
      stylist: { level: 15, tier: 'E', rank: 'Novice', progress: 5, skill: 15 },
      professor: { level: 90, tier: 'A', rank: 'Expert', progress: 88, skill: 90 },
    },
    badges: ['master-crafter'],
    joinDate: '2025-01-18',
    discordId: 'ironfist#6789',
    bio: 'Engenheiro Rank S (Master) - Hacker/Mechanic. Crafta Pokébolas exclusivas e itens de Rank S. Professor Expert.',
  },
  {
    id: '8',
    username: 'WindRunner',
    characterName: 'WindRunner',
    level: 289,
    clanType: 'wingeon',
    vocation: 'Royal Paladin',
    activityStatus: 'online',
    peakHours: '20h-23h (BRT)',
    favoriteHunts: ['Seacrest Grounds', 'Feyrist', 'Edron Dragon Lair', 'Monumentos NW'],
    professions: {
      engineer: { level: 30, tier: 'D', rank: 'Novice', progress: 25, skill: 30 },
      adventurer: { level: 62, tier: 'C', rank: 'Journeyman', progress: 50, skill: 62 },
      stylist: { level: 75, tier: 'B', rank: 'Veteran', progress: 70, skill: 75 },
      professor: { level: 40, tier: 'C', rank: 'Apprentice', progress: 35, skill: 40 },
    },
    badges: [],
    joinDate: '2025-03-25',
    discordId: 'windrunner#0123',
    bio: 'Estilista Veteran - Designer/Decorator. Coleta Style Points, Logs e recursos de Monumentos no Nightmare World.',
  },
];

export const pokemonLoans = [
  {
    id: '1',
    name: 'Gengar',
    type: ['Ghost', 'Poison'],
    level: 100,
    utility: ['Blocker', 'Hiker', 'High DPS'],
    ownerId: '1',
    ownerName: 'Portugap',
    status: 'available',
    borrowerId: null,
    borrowerName: null,
    requestedAt: null,
    expectedReturn: null,
    description: 'Gengar level 100 com moveset otimizado para block e DPS. Ideal para Roshamuul e Ferumbras.',
    moveset: ['Shadow Ball', 'Sludge Bomb', 'Focus Blast', 'Destiny Bond'],
    heldItem: 'Spell Tag',
    ability: 'Cursed Body',
  },
  {
    id: '2',
    name: 'Blissey',
    type: ['Normal'],
    level: 100,
    utility: ['Healer', 'Support', 'Tank'],
    ownerId: '5',
    ownerName: 'MysticHealer',
    status: 'borrowed',
    borrowerId: '4',
    borrowerName: 'ArcaneBlade',
    requestedAt: '2026-11-08T15:30:00Z',
    expectedReturn: '2026-11-15T15:30:00Z',
    description: 'Blissey level 100 com Soft-Boiled e Heal Bell. Perfeita para hunts longas sem healer dedicado.',
    moveset: ['Soft-Boiled', 'Heal Bell', 'Seismic Toss', 'Toxic'],
    heldItem: 'Leftovers',
    ability: 'Natural Cure',
  },
  {
    id: '3',
    name: 'Charizard',
    type: ['Fire', 'Flying'],
    level: 95,
    utility: ['Hiker', 'Fly', 'Fire DPS'],
    ownerId: '6',
    ownerName: 'FireWalker',
    status: 'available',
    borrowerId: null,
    borrowerName: null,
    requestedAt: null,
    expectedReturn: null,
    description: 'Charizard com Fly e Blast Burn. Útil para quests que precisam de Fly e hunts de Fire.',
    moveset: ['Blast Burn', 'Air Slash', 'Dragon Claw', 'Roost'],
    heldItem: 'Charcoal',
    ability: 'Solar Power',
  },
  {
    id: '4',
    name: 'Garchomp',
    type: ['Dragon', 'Ground'],
    level: 98,
    utility: ['High DPS', 'Ground Immunity', 'Speed'],
    ownerId: '2',
    ownerName: 'ShadowMaster',
    status: 'available',
    borrowerId: null,
    borrowerName: null,
    requestedAt: null,
    expectedReturn: null,
    description: 'Garchomp level 98 com Outrage e Earthquake. DPS absurdo em hunts de Dragon/Ground.',
    moveset: ['Outrage', 'Earthquake', 'Stone Edge', 'Swords Dance'],
    heldItem: 'Choice Scarf',
    ability: 'Sand Veil',
  },
  {
    id: '5',
    name: 'Torkoal',
    type: ['Fire'],
    level: 85,
    utility: ['Sun Setter', 'Tank', 'Fire Support'],
    ownerId: '6',
    ownerName: 'FireWalker',
    status: 'available',
    borrowerId: null,
    borrowerName: null,
    requestedAt: null,
    expectedReturn: null,
    description: 'Torkoal com Drought para ativar Solar Power em Charizard/Venusaur. Tank de Fire.',
    moveset: ['Eruption', 'Yawn', 'Protect', 'Rapid Spin'],
    heldItem: 'Heat Rock',
    ability: 'Drought',
  },
  {
    id: '6',
    name: 'Pelipper',
    type: ['Water', 'Flying'],
    level: 88,
    utility: ['Rain Setter', 'Fly', 'Water Support'],
    ownerId: '5',
    ownerName: 'MysticHealer',
    status: 'available',
    borrowerId: null,
    borrowerName: null,
    requestedAt: null,
    expectedReturn: null,
    description: 'Pelipper com Drizzle para hunts de Water. Também tem Fly para quests.',
    moveset: ['Hurricane', 'Scald', 'Roost', 'U-turn'],
    heldItem: 'Damp Rock',
    ability: 'Drizzle',
  },
  {
    id: '7',
    name: 'Breloom',
    type: ['Grass', 'Fighting'],
    level: 92,
    utility: ['Spore', 'Technician', 'Priority'],
    ownerId: '8',
    ownerName: 'WindRunner',
    status: 'available',
    borrowerId: null,
    borrowerName: null,
    requestedAt: null,
    expectedReturn: null,
    description: 'Breloom com Spore (100% sleep) e Mach Punch priority. Ótimo para capturar pokémons.',
    moveset: ['Spore', 'Mach Punch', 'Bullet Seed', 'Rock Tomb'],
    heldItem: 'Focus Sash',
    ability: 'Technician',
  },
  {
    id: '8',
    name: 'Excadrill',
    type: ['Ground', 'Steel'],
    level: 94,
    utility: ['Rapid Spin', 'Mold Breaker', 'Ground/Steel DPS'],
    ownerId: '7',
    ownerName: 'IronFist',
    status: 'borrowed',
    borrowerId: '3',
    borrowerName: 'NightHunter',
    requestedAt: '2026-11-09T10:00:00Z',
    expectedReturn: '2026-11-12T10:00:00Z',
    description: 'Excadrill com Rapid Spin para remover hazards e Mold Breaker para ignorar abilidades.',
    moveset: ['Rapid Spin', 'Earthquake', 'Iron Head', 'Rock Slide'],
    heldItem: 'Air Balloon',
    ability: 'Mold Breaker',
  },
];

export const itemRequests = [
  {
    id: '1',
    requesterId: '4',
    requesterName: 'ArcaneBlade',
    targetId: '3',
    targetName: 'NightHunter',
    itemName: 'Dark Orbs',
    itemCategory: 'hunt-loot',
    quantity: 50,
    purpose: 'Craft Estilista - Dark Set (Rank S)',
    huntSource: 'Roshamuul / Grim Reaper (Nightmare World)',
    professionRequired: 'adventurer',
    minProfessionLevel: 80,
    status: 'collecting',
    createdAt: '2026-11-08T16:45:00Z',
    updatedAt: '2026-11-09T09:20:00Z',
    collectedQuantity: 23,
    notes: 'Preciso para completar o Dark Set do Estilista Rank S. NightHunter farma Roshamuul NW.',
  },
  {
    id: '2',
    requesterId: '6',
    requesterName: 'FireWalker',
    targetId: '1',
    targetName: 'Portugap',
    itemName: 'Fire Stones',
    itemCategory: 'evolution-stone',
    quantity: 10,
    purpose: 'Evolução Charizard Y',
    huntSource: 'Volcanic Hunt / Boss Drop',
    professionRequired: 'engineer',
    minProfessionLevel: 60,
    status: 'open',
    createdAt: '2026-11-09T11:30:00Z',
    updatedAt: '2026-11-09T11:30:00Z',
    collectedQuantity: 0,
    notes: 'Boss da Volcanic Hunt dropa. Portugap faz essa hunt frequentemente.',
  },
  {
    id: '3',
    requesterId: '7',
    requesterName: 'IronFist',
    targetId: '8',
    targetName: 'WindRunner',
    itemName: 'Style Points',
    itemCategory: 'craft-material',
    quantity: 500,
    purpose: 'Craft Estilista - Purpleheart Log (Rank S)',
    huntSource: 'Monumentos Nightmare World / Desenhar Pokémon',
    professionRequired: 'stylist',
    minProfessionLevel: 70,
    status: 'ready',
    createdAt: '2026-11-07T14:20:00Z',
    updatedAt: '2026-11-09T08:00:00Z',
    collectedQuantity: 500,
    notes: 'WindRunner coletou nos Monumentos NW. Aguardando entrega.',
  },
  {
    id: '4',
    requesterId: '5',
    requesterName: 'MysticHealer',
    targetId: '2',
    targetName: 'ShadowMaster',
    itemName: 'Corrupted Iron Ore',
    itemCategory: 'craft-material',
    quantity: 100,
    purpose: 'Craft Engenheiro Rank S - Pokébolas Exclusivas',
    huntSource: 'Minérios Nightmare World (Iron Vein)',
    professionRequired: 'engineer',
    minProfessionLevel: 90,
    status: 'open',
    createdAt: '2026-11-09T18:15:00Z',
    updatedAt: '2026-11-09T18:15:00Z',
    collectedQuantity: 0,
    notes: 'Minérios da NW. ShadowMaster tem Engenheiro Rank S e farma lá.',
  },
  {
    id: '5',
    requesterId: '3',
    requesterName: 'NightHunter',
    targetId: '1',
    targetName: 'Portugap',
    itemName: 'Philosopher Stone',
    itemCategory: 'craft-material',
    quantity: 5,
    purpose: 'Craft Professor - High Tech Device',
    huntSource: 'Dungeons Acadêmico / Philosopher Stone Craft',
    professionRequired: 'professor',
    minProfessionLevel: 80,
    status: 'completed',
    createdAt: '2026-11-03T10:00:00Z',
    updatedAt: '2026-11-06T16:30:00Z',
    collectedQuantity: 5,
    notes: 'Entregue pelo Portugap. Professor Expert craftou. Obrigado!',
  },
  {
    id: '6',
    requesterId: '8',
    requesterName: 'WindRunner',
    targetId: '5',
    targetName: 'MysticHealer',
    itemName: 'Nightmare Style Points',
    itemCategory: 'craft-material',
    quantity: 1000,
    purpose: 'Craft Estilista Rank S - Nightmare Style Points',
    huntSource: 'Desenhar Pokémon NW / Hunts Fortes NW',
    professionRequired: 'stylist',
    minProfessionLevel: 80,
    status: 'collecting',
    createdAt: '2026-11-09T20:00:00Z',
    updatedAt: '2026-11-10T07:45:00Z',
    collectedQuantity: 450,
    notes: 'MysticHealer farma NW Style Points em hunts fortes. Preciso até sexta.',
  },
];

// As 4 profissões oficiais do PXG (conforme wiki.pokexgames.com/Profissões)
export const professionOrder = ['engineer', 'professor', 'stylist', 'adventurer'];

export const professionInfo = {
  engineer: {
    name: 'Engenheiro',
    icon: '⚙️',
    description: 'Especialista em tecnologia e produção de objetos mecânicos e eletrônicos. Cria Pokébolas, itens essenciais e Pokébolas exclusivas em Rank S.',
    resources: ['Minérios', 'Corrupted Iron Ore', 'Crypto Diamond Token', 'Tech Data'],
    specializations: ['Hacker', 'Mechanic'],
    npcs: ['Machvise (TC)', 'Kobain (NW)', 'Billy (NW)'],
    rankSRequirements: 'Skill 100 + Level 300 + Quest Introdução NW',
    colors: { primary: '#0369a1', secondary: '#bae6fd' }, // Blue tech theme
  },
  professor: {
    name: 'Professor',
    icon: '📚',
    description: 'Mestre no conhecimento acadêmico. Cria Philosopher Stone, gerencia Estudantes, explora Dungeons Acadêmico.',
    resources: ['Philosopher Stone', 'Estudantes', 'Dungeons Acadêmico'],
    specializations: [],
    npcs: [],
    rankSRequirements: 'Skill 100 + Level 300',
    colors: { primary: '#7c3aed', secondary: '#ddd6fe' }, // Purple academic theme
  },
  stylist: {
    name: 'Estilista',
    icon: '🎨',
    description: 'Mestre na arte da criação de roupas e objetos. Cria addons, roupas, Toys, Figures, itens de mobilidade (Snowboard, Wingsuit). Ativa itens de coleção.',
    resources: ['Style Points', 'Logs', 'Purpleheart Log', 'Nightmare Style Points', 'Drawing Clipboards'],
    specializations: ['Designer', 'Decorator'],
    npcs: ['Luna (TC)', 'Luna (NW)', 'Lillian (NW)'],
    rankSRequirements: 'Skill 100 + Level 300 + Quest Introdução NW',
    colors: { primary: '#ec4899', secondary: '#fce7f3' }, // Pink creative theme
  },
  adventurer: {
    name: 'Aventureiro',
    icon: '🗺️',
    description: 'Explorador nato. Cria Mapas de Aventureiro, acessa Dungeons Semanais, Cozinheiro, Dungeons de Arqueólogo. Foca em exploração e coleta.',
    resources: ['Mapas', 'Dungeons Semanais', 'Cozinheiro', 'Dungeons Arqueólogo'],
    specializations: [],
    npcs: [],
    rankSRequirements: 'Skill 100 + Level 300',
    colors: { primary: '#059669', secondary: '#a7f3d0' }, // Green explorer theme
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
  'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
];

export const pokemonUtilities = [
  'Blocker', 'Hiker', 'Fly', 'Surf', 'Healer', 'Support',
  'High DPS', 'Tank', 'Speed', 'Catcher', 'Sun Setter', 'Rain Setter',
  'Sand Setter', 'Hail Setter', 'Hazard Removal', 'Priority', 'Status Inflictor'
];

// Tabela de ranks oficial do PXG (idêntica para todas as 4 profissões)
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

export function getRankTierLabel(tier) {
  const labels = {
    S: 'Mestre',
    A: 'Expert',
    B: 'Veterano',
    C: 'Aprendiz',
    D: 'Iniciante',
    E: 'Novato',
  };
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
    ready: 'Pronto p/ Entrega',
    completed: 'Concluído',
    available: 'Disponível',
    borrowed: 'Emprestado',
    online: 'Online',
    offline: 'Offline',
  };
  return labels[status?.toLowerCase()] || status;
}

// Helper functions
export function getMemberById(id) {
  return members.find(m => m.id === id);
}

export function getMemberByName(name) {
  return members.find(m => m.characterName === name || m.username === name);
}

export function getOnlineMembers() {
  return members.filter(m => m.activityStatus === 'online');
}

export function getMembersByClanType(clanType) {
  return members.filter(m => m.clanType === clanType);
}

export function getMembersByProfession(profession, minTier = 'E') {
  const tierOrder = { S: 6, A: 5, B: 4, C: 3, D: 2, E: 1 };
  const minValue = tierOrder[minTier] || 1;
  return members.filter(m => {
    const prof = m.professions[profession];
    return prof && tierOrder[prof.tier] >= minValue;
  });
}

export function getAvailablePokemons(filters = {}) {
  return pokemonLoans.filter(p => {
    if (filters.type && !p.type.includes(filters.type)) return false;
    if (filters.minLevel && p.level < filters.minLevel) return false;
    if (filters.utility && !p.utility.includes(filters.utility)) return false;
    if (filters.status && p.status !== filters.status) return false;
    if (filters.ownerId && p.ownerId !== filters.ownerId) return false;
    return true;
  });
}

export function getItemRequestsByStatus(status) {
  if (!status) return itemRequests;
  return itemRequests.filter(r => r.status === status);
}

export function getItemRequestsForMember(memberId) {
  return itemRequests.filter(r => r.targetId === memberId || r.requesterId === memberId);
}

export function getPokemonLoansForMember(memberId) {
  return pokemonLoans.filter(p => p.ownerId === memberId || p.borrowerId === memberId);
}