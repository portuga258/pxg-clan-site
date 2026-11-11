import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { formatDate } from '../lib/utils';
import { apiRequest, toMember } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import {
  ChevronLeft,
  User,
  Award,
  Briefcase,
  Clock,
  MapPin,
  Sword,
  Sparkles,
  Shield,
  Crown,
  MessageSquare,
  Package,
  ShoppingCart,
  Calendar,
} from '../lib/icons';
import { professionInfo, professionOrder } from '../data/mockData';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  ClanBadge,
  Avatar,
  Button,
  SkillProgress,
  Section,
  Grid,
  GlassPanel,
  Input,
  Modal,
  Select,
  Textarea,
} from '../components/ui';

const clanOptions = [
  { value: 'malefic', label: 'Malefic' },
  { value: 'naturia', label: 'Naturia' },
  { value: 'wingeon', label: 'Wingeon' },
  { value: 'seavell', label: 'Seavell' },
  { value: 'volcanic', label: 'Volcanic' },
  { value: 'orebound', label: 'Orebound' },
  { value: 'psycraft', label: 'Psycraft' },
  { value: 'gardsen', label: 'Gardsen' },
];

const professionTiers = [
  { value: 'E', label: 'E — Novato' },
  { value: 'D', label: 'D — Iniciante' },
  { value: 'C', label: 'C — Aprendiz' },
  { value: 'B', label: 'B — Veterano' },
  { value: 'A', label: 'A — Expert' },
  { value: 'S', label: 'S — Mestre' },
];

export function MemberDetail() {
  const { id } = useParams();
  const { token, user, updateCharacter, switchCharacter, refreshAccount } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileForm, setProfileForm] = useState(null);
  const [isAddCharacterOpen, setIsAddCharacterOpen] = useState(false);
  const [newCharacterForm, setNewCharacterForm] = useState({
    name: '',
    level: 1,
    vocation: '',
    clan_type: '',
  });
  const [savingCharacter, setSavingCharacter] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [discordNotice, setDiscordNotice] = useState('');
  const [discordLinkError, setDiscordLinkError] = useState('');
  const [linkingDiscord, setLinkingDiscord] = useState(false);

  useEffect(() => {
    const status = searchParams.get('discord');
    if (!status) return;

    const messages = {
      linked: 'Discord vinculado ao seu perfil.',
      already_linked: 'Esta conta do Discord já está vinculada a outro perfil.',
      already_connected: 'Seu perfil já está vinculado a outra conta do Discord.',
      cancelled: 'A vinculação com Discord foi cancelada.',
      failed: 'Não foi possível vincular o Discord. Tente novamente.',
    };
    const message = messages[status] || messages.failed;
    setDiscordNotice(message);
    setDiscordLinkError(status !== 'linked');
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete('discord');
      return next;
    }, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiRequest(`/characters/${encodeURIComponent(id)}`)
      .then((character) => {
        if (active) setMember(toMember(character));
      })
      .catch((error) => {
        if (active) setLoadError(error.status === 404 ? '' : error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id, token]);

  if (loading) {
    return <Section><p className="py-12 text-center text-pxg-text-secondary">Carregando perfil...</p></Section>;
  }

  if (!member) {
    return (
      <Section title="Membro não encontrado">
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-pxg-text-muted mb-4" />
          <h2 className="text-display-sm font-display font-semibold text-pxg-text-primary mb-2">Membro não encontrado</h2>
          <p className="text-pxg-text-secondary">{loadError || 'O membro solicitado não existe ou foi removido.'}</p>
          <Button asChild className="mt-4">
            <Link to="/members">Voltar para Membros</Link>
          </Button>
        </div>
      </Section>
    );
  }

  const professions = professionOrder
    .filter(p => member.professions[p] && member.professions[p].level > 0)
    .map(p => ({ key: p, ...member.professions[p] }));

  const favoriteHunts = member.favoriteHunts || [];
  const accountCharacters = user?.characters || [];
  const isOwnProfile = accountCharacters.some((character) => character.id === member.id)
    || user?.character?.id === member.id;

  function openProfileEditor() {
    setProfileError('');
    setProfileForm({
      level: member.level,
      vocation: member.vocation === 'Não informada' ? '' : member.vocation,
      clan_type: member.clanType || '',
      activity_status: member.activityStatus,
      peak_hours: member.peakHours || '',
      favorite_hunts: favoriteHunts.join(', '),
      bio: member.bio || '',
      professions: professionOrder.map((name) => ({
        name,
        level: member.professions[name]?.level || 0,
        tier: member.professions[name]?.tier || 'E',
      })),
    });
    setIsEditOpen(true);
  }

  async function linkDiscord() {
    setLinkingDiscord(true);
    setDiscordNotice('');
    setDiscordLinkError('');
    try {
      const result = await apiRequest('/auth/discord/link', { token, method: 'POST' });
      window.location.assign(result.authorization_url);
    } catch (error) {
      setDiscordNotice(error.message);
      setDiscordLinkError(true);
      setLinkingDiscord(false);
    }
  }

  async function addCharacter(event) {
    event.preventDefault();
    setSavingCharacter(true);
    setAccountError('');
    try {
      const result = await apiRequest('/characters/me', {
        token,
        method: 'POST',
        body: JSON.stringify({
          ...newCharacterForm,
          level: Number(newCharacterForm.level),
          clan_type: newCharacterForm.clan_type || '',
        }),
      });
      await refreshAccount();
      switchCharacter(result.character.id);
      setIsAddCharacterOpen(false);
      setNewCharacterForm({ name: '', level: 1, vocation: '', clan_type: '' });
      navigate(`/members/${result.character.id}`);
    } catch (error) {
      setAccountError(error.message);
    } finally {
      setSavingCharacter(false);
    }
  }

  async function makePrimaryCharacter(characterId) {
    setAccountError('');
    try {
      await apiRequest(`/characters/${encodeURIComponent(characterId)}/primary`, {
        token,
        method: 'PUT',
      });
      await refreshAccount();
      switchCharacter(characterId);
    } catch (error) {
      setAccountError(error.message);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError('');
    try {
      const result = await apiRequest(`/characters/${encodeURIComponent(member.id)}`, {
        token,
        method: 'PUT',
        body: JSON.stringify({
          level: Number(profileForm.level),
          vocation: profileForm.vocation,
          clan_type: profileForm.clan_type || null,
          activity_status: profileForm.activity_status,
          peak_hours: profileForm.peak_hours,
          favorite_hunts: profileForm.favorite_hunts.split(',').map((hunt) => hunt.trim()).filter(Boolean),
          bio: profileForm.bio,
          professions: profileForm.professions.map((profession) => ({
            ...profession,
            level: Number(profession.level),
          })),
        }),
      });
      setMember(toMember(result.character));
      updateCharacter(result.character);
      setIsEditOpen(false);
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <div className="min-h-screen">
      {discordNotice && (
        <div className={`container-pxg pt-4 text-body-sm ${discordLinkError ? 'text-pxg-accent-neonRed' : 'text-pxg-accent-neonGreen'}`} role={discordLinkError ? 'alert' : 'status'}>
          {discordNotice}
        </div>
      )}
      <Section
        title=""
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" asChild>
              <Link to="/members">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Voltar
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link to={`/items/request?target=${member.id}`}>
                <ShoppingCart className="w-4 h-4 mr-1" />
                Requisitar Item
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link to={`/loans/request?target=${member.id}`}>
                <Package className="w-4 h-4 mr-1" />
                Pedir Empréstimo
              </Link>
            </Button>
            {isOwnProfile && (
              <Button onClick={openProfileEditor}>Editar meu perfil</Button>
            )}
            {isOwnProfile && !member.discordId && (
              <Button variant="secondary" onClick={linkDiscord} disabled={linkingDiscord}>
                {linkingDiscord ? 'Conectando...' : 'Vincular Discord'}
              </Button>
            )}
          </div>
        }
      >
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              <Avatar
                name={member.characterName}
                clanType={member.clanType}
                size="xl"
                status={member.activityStatus}
                vocation={member.vocation}
                showStatus
              />
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap mb-3">
                  <h1 className="font-display font-bold text-display-lg text-pxg-text-primary">
                    {member.characterName}
                  </h1>
                  {member.badges.includes('leader') && <Badge variant="leader"><Crown className="w-3 h-3 mr-1" /> Líder</Badge>}
                  {member.badges.includes('officer') && <Badge variant="officer"><Shield className="w-3 h-3 mr-1" /> Officer</Badge>}
                  {member.badges.includes('master-crafter') && <Badge variant="master-crafter"><Sparkles className="w-3 h-3 mr-1" /> Master Crafter</Badge>}
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-6 text-body-sm text-pxg-text-secondary flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    Level {member.level}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Sword className="w-4 h-4" />
                    {member.vocation}
                  </span>
                  <ClanBadge clanType={member.clanType} />
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Membro desde {formatDate(member.joinDate).split(',')[0]}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
                {member.discordId && (
                  <Button asChild variant="secondary">
                    <a href={`https://discord.com/users/${member.discordId}`} target="_blank" rel="noopener noreferrer">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {member.discordUsername ? `Discord · ${member.discordUsername}` : 'Discord'}
                    </a>
                  </Button>
                )}
                <Button asChild>
                  <Link to={`/items/request?target=${member.id}`}>
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Requisitar Item
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to={`/loans/request?target=${member.id}`}>
                    <Package className="w-4 h-4 mr-1" />
                    Pedir Pokémon
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity & Hunts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-display-sm flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-pxg-accent-cyan" />
                  Atividade & Hunts Frequentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-caption text-pxg-text-muted mb-1">Status</p>
                    <Badge variant={member.activityStatus}>
                      {member.activityStatus === 'online' ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-caption text-pxg-text-muted mb-1">Horário de Pico</p>
                    <p className="text-body font-medium text-pxg-text-primary">{member.peakHours || 'Não informado'}</p>
                  </div>
                </div>

                {favoriteHunts.length > 0 && (
                  <div className="mt-4">
                    <p className="text-caption text-pxg-text-muted mb-2">Hunts Frequentes</p>
                    <div className="flex flex-wrap gap-2">
                      {favoriteHunts.map((hunt) => (
                        <Badge key={hunt} variant="default" className="bg-pxg-bg-tertiary border-pxg-border-subtle text-pxg-text-secondary">
                          {hunt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {member.bio && (
                  <div className="mt-4 p-4 bg-pxg-bg-tertiary/30 rounded-lg">
                    <p className="text-body-sm text-pxg-text-secondary italic">"{member.bio}"</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-display-sm flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-pxg-accent-gold" />
                  Profissões & Progresso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {professions.map((prof) => (
                    <SkillProgress
                      key={prof.key}
                      profession={prof.key}
                      level={prof.level}
                      tier={prof.tier}
                      maxLevel={120}
                    />
                  ))}
                  {professions.length === 0 && (
                    <p className="text-center text-pxg-text-muted py-8">Nenhuma profissão registrada ainda</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-display-sm flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-pxg-accent-neonGreen" />
                  Resumo Rápido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Grid columns={2} sm={4}>
                  <GlassPanel className="text-center">
                    <p className="font-display font-bold text-display-md text-pxg-accent-neonGreen">{member.level}</p>
                    <p className="text-caption text-pxg-text-muted">Level Atual</p>
                  </GlassPanel>
                  <GlassPanel className="text-center">
                    <p className="font-display font-bold text-display-md text-pxg-accent-gold">
                      {professions.reduce((sum, p) => sum + p.level, 0)}
                    </p>
                    <p className="text-caption text-pxg-text-muted">Total Prof Levels</p>
                  </GlassPanel>
                  <GlassPanel className="text-center">
                    <p className="font-display font-bold text-display-md text-pxg-accent-cyan">
                      {professions.filter(p => p.tier === 'S' || p.tier === 'A').length}
                    </p>
                    <p className="text-caption text-pxg-text-muted">Profissões Tier S/A</p>
                  </GlassPanel>
                  <GlassPanel className="text-center">
                    <p className="font-display font-bold text-display-md text-pxg-accent-cyan">
                      {professions.length}
                    </p>
                    <p className="text-caption text-pxg-text-muted">Profissões Ativas</p>
                  </GlassPanel>
                </Grid>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-display-sm">Ações</CardTitle>
                <CardDescription>Interaja com este membro</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Button fullWidth asChild>
                  <Link to={`/items/request?target=${member.id}`}>
                    <span className="flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Requisitar Item de Hunt
                    </span>
                  </Link>
                </Button>
                <Button variant="secondary" fullWidth asChild>
                  <Link to={`/loans/request?target=${member.id}`}>
                    <span className="flex items-center justify-center gap-2">
                      <Package className="w-4 h-4" />
                      Solicitar Empréstimo de Pokémon
                    </span>
                  </Link>
                </Button>
                {member.discordId && (
                  <Button variant="ghost" fullWidth asChild>
                    <a href={`https://discord.com/users/${member.discordId}`} target="_blank" rel="noopener noreferrer">
                      <span className="flex items-center justify-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Enviar Mensagem no Discord
                      </span>
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Member Since */}
            <Card>
              <CardHeader>
                <CardTitle className="text-display-sm">Informações</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-pxg-bg-tertiary/30">
                    <div className="w-8 h-8 rounded-lg bg-pxg-accent-purple/20 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-pxg-accent-cyan" />
                    </div>
                    <div>
                      <p className="text-caption text-pxg-text-muted">Entrou no Clan</p>
                      <p className="font-medium text-pxg-text-primary">{formatDate(member.joinDate).split(',')[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-pxg-bg-tertiary/30">
                    <div className="w-8 h-8 rounded-lg bg-pxg-accent-purple/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-pxg-accent-cyan" />
                    </div>
                    <div>
                      <p className="text-caption text-pxg-text-muted">Nick no Jogo</p>
                      <p className="font-medium text-pxg-text-primary">{member.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-pxg-bg-tertiary/30">
                    <div className="w-8 h-8 rounded-lg bg-pxg-accent-purple/20 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-pxg-accent-cyan" />
                    </div>
                    <div>
                      <p className="text-caption text-pxg-text-muted">Discord</p>
                      {member.discordId ? (
                        <a
                          className="font-medium text-pxg-accent-cyan hover:underline"
                          href={`https://discord.com/users/${member.discordId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {member.discordUsername || member.discordId}
                        </a>
                      ) : (
                        <p className="font-medium text-pxg-text-muted">Não vinculado</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
      {isOwnProfile && (
        <div className="container-pxg pb-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-display-sm">Personagens desta conta</CardTitle>
                  <p className="mt-1 text-body-sm text-pxg-text-secondary">
                    Alterne entre seus personagens; o Discord vinculado aparece em todos os perfis.
                  </p>
                </div>
                <Button onClick={() => { setAccountError(''); setIsAddCharacterOpen(true); }}>
                  Adicionar personagem
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {accountError && <p className="text-body-sm text-pxg-accent-neonRed" role="alert">{accountError}</p>}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {accountCharacters.map((character) => (
                  <div key={character.id} className="flex items-center justify-between gap-3 rounded-lg border border-pxg-border-subtle bg-pxg-bg-tertiary/30 p-3">
                    <Link
                      to={`/members/${character.id}`}
                      onClick={() => switchCharacter(character.id)}
                      className="min-w-0 flex-1"
                    >
                      <p className="truncate font-medium text-pxg-text-primary hover:text-pxg-accent-cyan">
                        {character.name}
                      </p>
                      <p className="text-caption text-pxg-text-muted">Level {character.level}</p>
                    </Link>
                    {character.is_primary ? (
                      <Badge>Principal</Badge>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => makePrimaryCharacter(character.id)}>
                        Tornar principal
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <Modal
        isOpen={isAddCharacterOpen}
        onClose={() => setIsAddCharacterOpen(false)}
        title="Adicionar personagem à conta"
        description="O novo personagem terá um perfil próprio e compartilhará o Discord vinculado à conta."
      >
        <form onSubmit={addCharacter} className="space-y-4">
          <Input
            label="Nome do personagem PXG *"
            value={newCharacterForm.name}
            onChange={(event) => setNewCharacterForm({ ...newCharacterForm, name: event.target.value })}
            minLength={2}
            maxLength={32}
            required
          />
          <Input
            label="Level"
            type="number"
            min={1}
            max={10000}
            value={newCharacterForm.level}
            onChange={(event) => setNewCharacterForm({ ...newCharacterForm, level: event.target.value })}
            required
          />
          <Input
            label="Vocação"
            value={newCharacterForm.vocation}
            onChange={(event) => setNewCharacterForm({ ...newCharacterForm, vocation: event.target.value })}
            maxLength={60}
          />
          <Select
            label="Clã"
            value={newCharacterForm.clan_type}
            onChange={(event) => setNewCharacterForm({ ...newCharacterForm, clan_type: event.target.value })}
            options={[{ value: '', label: 'Não informado' }, ...clanOptions]}
          />
          <p className="text-caption text-pxg-text-muted">
            O site não verifica automaticamente a propriedade do personagem dentro do jogo.
          </p>
          {accountError && <p className="text-body-sm text-pxg-accent-neonRed" role="alert">{accountError}</p>}
          <div className="modal-footer">
            <Button type="button" variant="ghost" onClick={() => setIsAddCharacterOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={savingCharacter}>
              {savingCharacter ? 'Adicionando...' : 'Adicionar personagem'}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar meu perfil PXG"
        description="Atualize seus dados de jogo e profissões."
        size="full"
        className="profile-editor-modal"
      >
        {profileForm && (
          <form onSubmit={saveProfile} className="profile-editor-form">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Level do personagem"
                type="number"
                min={1}
                max={10000}
                value={profileForm.level}
                onChange={(event) => setProfileForm({ ...profileForm, level: event.target.value })}
                required
              />
              <Input
                label="Vocação"
                value={profileForm.vocation}
                onChange={(event) => setProfileForm({ ...profileForm, vocation: event.target.value })}
                maxLength={60}
              />
              <Select
                label="Clã"
                value={profileForm.clan_type}
                onChange={(event) => setProfileForm({ ...profileForm, clan_type: event.target.value })}
                options={[{ value: '', label: 'Não informado' }, ...clanOptions]}
              />
              <Select
                label="Status"
                value={profileForm.activity_status}
                onChange={(event) => setProfileForm({ ...profileForm, activity_status: event.target.value })}
                options={[
                  { value: 'online', label: 'Online' },
                  { value: 'offline', label: 'Offline' },
                ]}
              />
              <Input
                label="Horário de pico"
                value={profileForm.peak_hours}
                onChange={(event) => setProfileForm({ ...profileForm, peak_hours: event.target.value })}
                maxLength={100}
                placeholder="Ex.: noites e fins de semana"
              />
              <Input
                label="Hunts favoritas (separadas por vírgula)"
                value={profileForm.favorite_hunts}
                onChange={(event) => setProfileForm({ ...profileForm, favorite_hunts: event.target.value })}
                placeholder="Ex.: Nightmare, Outland"
              />
            </div>
            <div>
              <h3 className="mb-2 font-display font-semibold text-pxg-text-primary">Profissões</h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {profileForm.professions.map((profession, index) => (
                  <div key={profession.name} className="grid grid-cols-2 gap-2 rounded-lg border border-pxg-border-subtle/30 p-2">
                    <Input
                      label={`${professionInfo[profession.name].name} · level`}
                      type="number"
                      min={0}
                      max={120}
                      value={profession.level}
                      onChange={(event) => {
                        const professions = [...profileForm.professions];
                        professions[index] = { ...profession, level: event.target.value };
                        setProfileForm({ ...profileForm, professions });
                      }}
                      required
                    />
                    <Select
                      id={`profession-${profession.name}-tier`}
                      label="Tier"
                      value={profession.tier}
                      onChange={(event) => {
                        const professions = [...profileForm.professions];
                        professions[index] = { ...profession, tier: event.target.value };
                        setProfileForm({ ...profileForm, professions });
                      }}
                      options={professionTiers}
                    />
                  </div>
                ))}
              </div>
            </div>
            <Textarea
              label="Sobre mim"
              value={profileForm.bio}
              onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })}
              maxLength={500}
              rows={2}
            />
            {profileError && <p className="text-body-sm text-pxg-accent-neonRed" role="alert">{profileError}</p>}
            <div className="modal-footer">
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={savingProfile}>{savingProfile ? 'Salvando...' : 'Salvar perfil'}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}