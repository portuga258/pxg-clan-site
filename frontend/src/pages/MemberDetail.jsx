import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const { token, user, updateCharacter } = useAuth();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileForm, setProfileForm] = useState(null);

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
  const isOwnProfile = user?.character?.id === member.id;

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
                      Discord
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
                      <p className="font-medium text-pxg-text-primary truncate">{member.discordId}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar meu perfil PXG"
        description="Atualize seus dados de jogo e os níveis das profissões."
        size="xl"
      >
        {profileForm && (
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
              <h3 className="mb-3 font-display font-semibold text-pxg-text-primary">Níveis das profissões</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {profileForm.professions.map((profession, index) => (
                  <div key={profession.name} className="grid grid-cols-2 gap-3">
                    <Input
                      label={`${professionInfo[profession.name].name} — level`}
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