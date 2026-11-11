import 'dotenv/config';
import { db } from './database.js';

const now = Math.floor(Date.now() / 1000);

db.prepare(`
  INSERT INTO clan_info (
    id, name, tag, slogan, emblem, recruitment_status,
    founded_date, max_members, discord_url, updated_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    tag = excluded.tag,
    slogan = excluded.slogan,
    emblem = excluded.emblem,
    recruitment_status = excluded.recruitment_status,
    founded_date = excluded.founded_date,
    max_members = excluded.max_members,
    updated_at = excluded.updated_at
`).run(
  'main',
  'Lá Eles',
  'LAELES',
  'Se marcar bobeira na hunt... Lá Eles!',
  '👻',
  'open',
  Math.floor(new Date('2024-01-15').getTime() / 1000),
  50,
  null,
  now
);

console.log('Informações do clan atualizadas sem alterar contas ou dados reais.');
db.close();
