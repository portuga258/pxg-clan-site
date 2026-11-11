const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    headers,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || data.message || `A solicitação falhou (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export function toMember(character) {
  const professions = Object.fromEntries(
    (character.professions || []).map((profession) => [profession.name, profession])
  );

  return {
    id: character.id,
    username: character.name,
    characterName: character.name,
    level: character.level,
    clanType: character.clan_type,
    vocation: character.vocation || 'Não informada',
    activityStatus: character.activity_status || 'offline',
    peakHours: character.peak_hours,
    favoriteHunts: character.favorite_hunts || [],
    professions,
    badges: character.discord_role === 'leader' ? ['leader'] : character.discord_role === 'officer' ? ['officer'] : [],
    joinDate: character.join_date ? new Date(character.join_date * 1000).toISOString() : character.created_at,
    discordId: character.discord_id,
    bio: character.bio,
    email: character.email,
  };
}
