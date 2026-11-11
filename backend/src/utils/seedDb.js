import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../data/pxg-clan.db');
const db = new Database(dbPath);

console.log('Seeding database with mock data...');

const now = Math.floor(Date.now() / 1000);
const oneDay = 86400;

// Clear existing data (except clan_info)
const tables = ['professions', 'characters', 'users', 'pokemon_loans', 'item_requests', 'announcements'];
tables.forEach(table => {
  db.prepare(`DELETE FROM ${table}`).run();
});

// Insert Clan Info
db.prepare(`
  INSERT OR REPLACE INTO clan_info (id, name, tag, slogan, emblem, recruitment_status, founded_date, max_members, discord_url, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run('main', 'Lá Eles', 'LAELES', 'Se marcar bobeira na hunt... Lá Eles!', '👻', 'open', Math.floor(new Date('2024-01-15').getTime() / 1000), 50, 'https://discord.gg/pxg-clan', now);

// Insert Users (Discord users)
const users = [
  { id: uuidv4(), discord_id: '123456789012345678', username: 'Portugap', discriminator: '1234', role: 'leader' },
  { id: uuidv4(), discord_id: '234567890123456789', username: 'ShadowMaster', discriminator: '5678', role: 'officer' },
  { id: uuidv4(), discord_id: '345678901234567890', username: 'NightHunter', discriminator: '9012', role: 'member' },
  { id: uuidv4(), discord_id: '456789012345678901', username: 'ArcaneBlade', discriminator: '3456', role: 'member' },
  { id: uuidv4(), discord_id: '567890123456789012', username: 'MysticHealer', discriminator: '7890', role: 'member' },
  { id: uuidv4(), discord_id: '678901234567890123', username: 'FireWalker', discriminator: '2345', role: 'member' },
  { id: uuidv4(), discord_id: '789012345678901234', username: 'IronFist', discriminator: '6789', role: 'member' },
  { id: uuidv4(), discord_id: '890123456789012345', username: 'WindRunner', discriminator: '0123', role: 'member' },
];

const insertUser = db.prepare(`
  INSERT INTO users (id, discord_id, username, discriminator, role, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

users.forEach(u => {
  insertUser.run(u.id, u.discord_id, u.username, u.discriminator, u.role, now - Math.floor(Math.random() * 365 * oneDay));
});

// Map discord_id to user_id for characters
const userMap = {};
users.forEach(u => { userMap[u.username] = u.id; });

// Insert Characters
const characters = [
  { id: uuidv4(), user_id: userMap['Portugap'], name: 'Portugap', level: 487, vocation: 'Elder Druid', clan_type: 'malefic', activity_status: 'online', peak_hours: '20h-23h (BRT)', favorite_hunts: JSON.stringify(['Roshamuul', 'Grim Reaper', 'Ferumbras Tower']), bio: 'Fundador do clan. Especialista em hunts de alto nível e craft de Stylist.', join_date: Math.floor(new Date('2024-01-15').getTime() / 1000) },
  { id: uuidv4(), user_id: userMap['ShadowMaster'], name: 'ShadowMaster', level: 452, vocation: 'Master Sorcerer', clan_type: 'malefic', activity_status: 'online', peak_hours: '19h-22h (BRT)', favorite_hunts: JSON.stringify(['Oramond Dungeon', 'Drefia', 'Library']), bio: 'Officer responsável por organização de hunts em grupo e mediação de conflitos.', join_date: Math.floor(new Date('2024-02-10').getTime() / 1000) },
  { id: uuidv4(), user_id: userMap['NightHunter'], name: 'NightHunter', level: 428, vocation: 'Royal Paladin', clan_type: 'naturia', activity_status: 'offline', peak_hours: '14h-18h (BRT)', favorite_hunts: JSON.stringify(['Oramond West', 'Seacrest Grounds', 'Edron Dragon Lair']), bio: 'Farmer oficial do clan. Foca em coletar recursos para craft da galera.', join_date: Math.floor(new Date('2024-03-22').getTime() / 1000) },
  { id: uuidv4(), user_id: userMap['ArcaneBlade'], name: 'ArcaneBlade', level: 398, vocation: 'Elite Knight', clan_type: 'psycraft', activity_status: 'online', peak_hours: '21h-01h (BRT)', favorite_hunts: JSON.stringify(['Kulag', 'Demona', 'Hellgate']), bio: 'Tank principal do clan. Adora blockar em hunts de team.', join_date: Math.floor(new Date('2024-05-14').getTime() / 1000) },
  { id: uuidv4(), user_id: userMap['MysticHealer'], name: 'MysticHealer', level: 367, vocation: 'Elder Druid', clan_type: 'seavell', activity_status: 'offline', peak_hours: '16h-20h (BRT)', favorite_hunts: JSON.stringify(['Feyrist', 'Roshamuul', 'Grim Reaper']), bio: 'Healer e alchemist. Fornece potions e runas para o clan.', join_date: Math.floor(new Date('2024-07-08').getTime() / 1000) },
  { id: uuidv4(), user_id: userMap['FireWalker'], name: 'FireWalker', level: 345, vocation: 'Master Sorcerer', clan_type: 'volcanic', activity_status: 'online', peak_hours: '22h-02h (BRT)', favorite_hunts: JSON.stringify(['Roshamuul', 'Ferumbras Tower', 'Hellgate']), bio: 'Mage DPS. Especialista em UE em hunts grandes.', join_date: Math.floor(new Date('2024-09-30').getTime() / 1000) },
  { id: uuidv4(), user_id: userMap['IronFist'], name: 'IronFist', level: 312, vocation: 'Elite Knight', clan_type: 'orebound', activity_status: 'offline', peak_hours: '18h-22h (BRT)', favorite_hunts: JSON.stringify(['Oramond Dungeon', 'Drefia', 'Kulag']), bio: 'Engineer master. Crafta itens de equipamento para o clan.', join_date: Math.floor(new Date('2025-01-18').getTime() / 1000) },
  { id: uuidv4(), user_id: userMap['WindRunner'], name: 'WindRunner', level: 289, vocation: 'Royal Paladin', clan_type: 'wingeon', activity_status: 'online', peak_hours: '20h-23h (BRT)', favorite_hunts: JSON.stringify(['Seacrest Grounds', 'Feyrist', 'Edron Dragon Lair']), bio: 'Breeder do clan. Cuida de mounts e pokémons de empréstimo.', join_date: Math.floor(new Date('2025-03-25').getTime() / 1000) },
];

const insertCharacter = db.prepare(`
  INSERT INTO characters (id, user_id, name, level, vocation, clan_type, activity_status, peak_hours, favorite_hunts, bio, join_date, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const charMap = {};
characters.forEach(c => {
  insertCharacter.run(c.id, c.user_id, c.name, c.level, c.vocation, c.clan_type, c.activity_status, c.peak_hours, c.favorite_hunts, c.bio, c.join_date, now);
  charMap[c.name] = c.id;
});

// Insert Professions
const professionData = {
  'Portugap': { stylist: { level: 100, tier: 'S', rank: 'Master', progress: 100 }, adventurer: { level: 85, tier: 'A', rank: 'Expert', progress: 75 }, engineer: { level: 42, tier: 'C', rank: 'Apprentice', progress: 40 } },
  'ShadowMaster': { stylist: { level: 92, tier: 'A', rank: 'Expert', progress: 88 }, adventurer: { level: 78, tier: 'B', rank: 'Veteran', progress: 65 }, engineer: { level: 60, tier: 'B', rank: 'Journeyman', progress: 55 } },
  'NightHunter': { stylist: { level: 45, tier: 'C', rank: 'Apprentice', progress: 30 }, adventurer: { level: 95, tier: 'A', rank: 'Expert', progress: 92 }, farmer: { level: 88, tier: 'A', rank: 'Expert', progress: 85 } },
  'ArcaneBlade': { stylist: { level: 38, tier: 'C', rank: 'Apprentice', progress: 25 }, adventurer: { level: 82, tier: 'B', rank: 'Veteran', progress: 70 }, engineer: { level: 75, tier: 'B', rank: 'Journeyman', progress: 68 } },
  'MysticHealer': { stylist: { level: 67, tier: 'B', rank: 'Journeyman', progress: 60 }, adventurer: { level: 55, tier: 'C', rank: 'Apprentice', progress: 45 }, alchemist: { level: 80, tier: 'B', rank: 'Veteran', progress: 72 } },
  'FireWalker': { stylist: { level: 28, tier: 'D', rank: 'Novice', progress: 15 }, adventurer: { level: 72, tier: 'B', rank: 'Veteran', progress: 62 }, engineer: { level: 45, tier: 'C', rank: 'Apprentice', progress: 35 } },
  'IronFist': { stylist: { level: 15, tier: 'E', rank: 'Novice', progress: 5 }, adventurer: { level: 68, tier: 'B', rank: 'Veteran', progress: 58 }, engineer: { level: 90, tier: 'A', rank: 'Expert', progress: 88 } },
  'WindRunner': { stylist: { level: 22, tier: 'D', rank: 'Novice', progress: 10 }, adventurer: { level: 62, tier: 'C', rank: 'Journeyman', progress: 50 }, breeder: { level: 75, tier: 'B', rank: 'Veteran', progress: 70 } },
};

const insertProfession = db.prepare(`
  INSERT INTO professions (id, character_id, name, level, tier, rank, progress, experience, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

Object.entries(professionData).forEach(([charName, profs]) => {
  const charId = charMap[charName];
  Object.entries(profs).forEach(([profName, data]) => {
    insertProfession.run(uuidv4(), charId, profName, data.level, data.tier, data.rank, data.progress, data.level * 1000, now);
  });
});

// Insert Pokemon Loans
const pokemonLoans = [
  { id: uuidv4(), name: 'Gengar', types: JSON.stringify(['Ghost', 'Poison']), level: 100, utilities: JSON.stringify(['Blocker', 'Hiker', 'High DPS']), moveset: JSON.stringify(['Shadow Ball', 'Sludge Bomb', 'Focus Blast', 'Destiny Bond']), held_item: 'Spell Tag', ability: 'Cursed Body', description: 'Gengar level 100 com moveset otimizado para block e DPS. Ideal para Roshamuul e Ferumbras.', owner_id: charMap['Portugap'], status: 'available' },
  { id: uuidv4(), name: 'Blissey', types: JSON.stringify(['Normal']), level: 100, utilities: JSON.stringify(['Healer', 'Support', 'Tank']), moveset: JSON.stringify(['Soft-Boiled', 'Heal Bell', 'Seismic Toss', 'Toxic']), held_item: 'Leftovers', ability: 'Natural Cure', description: 'Blissey level 100 com Soft-Boiled e Heal Bell. Perfeita para hunts longas sem healer dedicado.', owner_id: charMap['MysticHealer'], borrower_id: charMap['ArcaneBlade'], status: 'borrowed', requested_at: now - 2 * oneDay, expected_return_at: now + 5 * oneDay },
  { id: uuidv4(), name: 'Charizard', types: JSON.stringify(['Fire', 'Flying']), level: 95, utilities: JSON.stringify(['Hiker', 'Fly', 'Fire DPS']), moveset: JSON.stringify(['Blast Burn', 'Air Slash', 'Dragon Claw', 'Roost']), held_item: 'Charcoal', ability: 'Solar Power', description: 'Charizard com Fly e Blast Burn. Útil para quests que precisam de Fly e hunts de Fire.', owner_id: charMap['FireWalker'], status: 'available' },
  { id: uuidv4(), name: 'Garchomp', types: JSON.stringify(['Dragon', 'Ground']), level: 98, utilities: JSON.stringify(['High DPS', 'Ground Immunity', 'Speed']), moveset: JSON.stringify(['Outrage', 'Earthquake', 'Stone Edge', 'Swords Dance']), held_item: 'Choice Scarf', ability: 'Sand Veil', description: 'Garchomp level 98 com Outrage e Earthquake. DPS absurdo em hunts de Dragon/Ground.', owner_id: charMap['ShadowMaster'], status: 'available' },
  { id: uuidv4(), name: 'Torkoal', types: JSON.stringify(['Fire']), level: 85, utilities: JSON.stringify(['Sun Setter', 'Tank', 'Fire Support']), moveset: JSON.stringify(['Eruption', 'Yawn', 'Protect', 'Rapid Spin']), held_item: 'Heat Rock', ability: 'Drought', description: 'Torkoal com Drought para ativar Solar Power em Charizard/Venusaur. Tank de Fire.', owner_id: charMap['FireWalker'], status: 'available' },
  { id: uuidv4(), name: 'Pelipper', types: JSON.stringify(['Water', 'Flying']), level: 88, utilities: JSON.stringify(['Rain Setter', 'Fly', 'Water Support']), moveset: JSON.stringify(['Hurricane', 'Scald', 'Roost', 'U-turn']), held_item: 'Damp Rock', ability: 'Drizzle', description: 'Pelipper com Drizzle para hunts de Water. Também tem Fly para quests.', owner_id: charMap['MysticHealer'], status: 'available' },
  { id: uuidv4(), name: 'Breloom', types: JSON.stringify(['Grass', 'Fighting']), level: 92, utilities: JSON.stringify(['Spore', 'Technician', 'Priority']), moveset: JSON.stringify(['Spore', 'Mach Punch', 'Bullet Seed', 'Rock Tomb']), held_item: 'Focus Sash', ability: 'Technician', description: 'Breloom com Spore (100% sleep) e Mach Punch priority. Ótimo para capturar pokémons.', owner_id: charMap['WindRunner'], status: 'available' },
  { id: uuidv4(), name: 'Excadrill', types: JSON.stringify(['Ground', 'Steel']), level: 94, utilities: JSON.stringify(['Rapid Spin', 'Mold Breaker', 'Ground/Steel DPS']), moveset: JSON.stringify(['Rapid Spin', 'Earthquake', 'Iron Head', 'Rock Slide']), held_item: 'Air Balloon', ability: 'Mold Breaker', description: 'Excadrill com Rapid Spin para remover hazards e Mold Breaker para ignorar abilidades.', owner_id: charMap['IronFist'], borrower_id: charMap['NightHunter'], status: 'borrowed', requested_at: now - 1 * oneDay, expected_return_at: now + 2 * oneDay },
];

const insertPokemon = db.prepare(`
  INSERT INTO pokemon_loans (id, name, types, level, utilities, moveset, held_item, ability, description, owner_id, borrower_id, status, requested_at, expected_return_at, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

pokemonLoans.forEach(p => {
  insertPokemon.run(p.id, p.name, p.types, p.level, p.utilities, p.moveset, p.held_item, p.ability, p.description, p.owner_id, p.borrower_id || null, p.status, p.requested_at || null, p.expected_return_at || null, now);
});

// Insert Item Requests
const itemRequests = [
  { id: uuidv4(), requester_id: charMap['ArcaneBlade'], target_id: charMap['NightHunter'], item_name: 'Dark Orbs', item_category: 'hunt-loot', quantity: 50, collected_quantity: 23, purpose: 'Craft Stylist - Dark Set', hunt_source: 'Roshamuul / Grim Reaper', profession_required: 'stylist', min_profession_level: 60, status: 'collecting', notes: 'Preciso para completar o Dark Set do Stylist. Qualquer quantidade ajuda!', created_at: now - 3 * oneDay, updated_at: now - 1 * oneDay },
  { id: uuidv4(), requester_id: charMap['FireWalker'], target_id: charMap['Portugap'], item_name: 'Fire Stones', item_category: 'evolution-stone', quantity: 10, collected_quantity: 0, purpose: 'Evolução Charizard Y', hunt_source: 'Volcanic Hunt / Boss Drop', profession_required: 'engineer', min_profession_level: 40, status: 'open', notes: 'Boss da Volcanic Hunt dropa. Portugap faz essa hunt frequentemente.', created_at: now - 2 * oneDay, updated_at: now - 2 * oneDay },
  { id: uuidv4(), requester_id: charMap['IronFist'], target_id: charMap['WindRunner'], item_name: 'Food Bags', item_category: 'consumable', quantity: 100, collected_quantity: 100, purpose: 'Craft Engineer - Energy Modules', hunt_source: 'Oramond Dungeon / Drefia', profession_required: 'farmer', min_profession_level: 50, status: 'ready', notes: 'WindRunner já coletou tudo. Aguardando entrega.', created_at: now - 4 * oneDay, updated_at: now - 1 * oneDay },
  { id: uuidv4(), requester_id: charMap['MysticHealer'], target_id: charMap['ShadowMaster'], item_name: 'Life Crystals', item_category: 'boss-loot', quantity: 5, collected_quantity: 0, purpose: 'Addon Druid - Life Set', hunt_source: 'Ferumbras Tower / Boss', profession_required: 'alchemist', min_profession_level: 70, status: 'open', notes: 'Drop raro do Ferumbras. ShadowMaster costuma ir nessa torre.', created_at: now - 1 * oneDay, updated_at: now - 1 * oneDay },
  { id: uuidv4(), requester_id: charMap['NightHunter'], target_id: charMap['Portugap'], item_name: 'Dragon Scales', item_category: 'hunt-loot', quantity: 30, collected_quantity: 30, purpose: 'Craft Adventurer - Dragon Armor', hunt_source: 'Edron Dragon Lair / Seacrest', profession_required: 'adventurer', min_profession_level: 55, status: 'completed', notes: 'Entregue pelo Portugap. Obrigado!', created_at: now - 8 * oneDay, updated_at: now - 5 * oneDay, completed_at: now - 5 * oneDay },
  { id: uuidv4(), requester_id: charMap['WindRunner'], target_id: charMap['MysticHealer'], item_name: 'Mana Potions (Great)', item_category: 'consumable', quantity: 200, collected_quantity: 87, purpose: 'Stock para hunts da semana', hunt_source: 'Alchemist Craft / Shop', profession_required: 'alchemist', min_profession_level: 60, status: 'collecting', notes: 'MysticHealer está craftando. Preciso até sexta.', created_at: now - 1 * oneDay, updated_at: now - 0.5 * oneDay },
];

const insertItemRequest = db.prepare(`
  INSERT INTO item_requests (id, requester_id, target_id, item_name, item_category, quantity, collected_quantity, purpose, hunt_source, profession_required, min_profession_level, status, notes, created_at, updated_at, completed_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

itemRequests.forEach(r => {
  insertItemRequest.run(r.id, r.requester_id, r.target_id, r.item_name, r.item_category, r.quantity, r.collected_quantity, r.purpose, r.hunt_source, r.profession_required, r.min_profession_level, r.status, r.notes, r.created_at, r.updated_at, r.completed_at || null);
});

// Insert Announcements
const announcements = [
  { id: uuidv4(), author_id: charMap['Portugap'], title: '🎉 Evento de Bônus de XP - Fim de Semana', content: 'Pessoal, teremos bônus de 50% XP neste fim de semana (sábado e domingo). Organizem suas hunts em grupo para maximizar o ganho! Lembrem-se de usar Food Bags.', type: 'event', pinned: 1, created_at: now - 3 * oneDay },
  { id: uuidv4(), author_id: charMap['ShadowMaster'], title: '📋 Regras Atualizadas de Hunt em Party', content: 'Atualizamos as regras de divisão de loot em party. Agora itens de boss (chance < 1%) vão para o membro que precisar para quest/addon. Demais itens: roll livre.', type: 'rule', pinned: 1, created_at: now - 6 * oneDay },
  { id: uuidv4(), author_id: charMap['IronFist'], title: '🔧 Manutenção do Site - 12/11', content: 'O site ficará indisponível na terça-feira (12/11) das 02:00 às 04:00 para deploy da nova versão do sistema de empréstimos.', type: 'maintenance', pinned: 0, created_at: now - 1 * oneDay },
];

const insertAnnouncement = db.prepare(`
  INSERT INTO announcements (id, author_id, title, content, type, pinned, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

announcements.forEach(a => {
  insertAnnouncement.run(a.id, a.author_id, a.title, a.content, a.type, a.pinned, a.created_at);
});

console.log('Database seeded successfully!');
console.log(`- ${users.length} users`);
console.log(`- ${characters.length} characters`);
console.log(`- ${Object.values(professionData).reduce((sum, p) => sum + Object.keys(p).length, 0)} professions`);
console.log(`- ${pokemonLoans.length} pokemon loans`);
console.log(`- ${itemRequests.length} item requests`);
console.log(`- ${announcements.length} announcements`);

db.close();