import { useParams, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { formatDate } from '../lib/utils';
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
  Wheat,
  MessageSquare,
  Send,
  Package,
  ShoppingCart,
  Calendar,
} from '../lib/icons';
import { members, getMemberById, professionOrder, getClanTypeName, getProfessionName } from '../data/mockData';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  ClanBadge,
  RankTierBadge,
  Avatar,
  Button,
  Progress,
  Section,
  Grid,
  GlassPanel,
} from '../components/ui';

export function MemberDetail() {
  const { id } = useParams();
  const member = getMemberById(id);

  if (!member) {
    return (
      <Section title="Membro não encontrado">
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-pxg-text-muted mb-4" />
          <h2 className="text-display-sm font-display font-semibold text-pxg-text-primary mb-2">Membro não encontrado</h2>
          <p className="text-pxg-text-secondary">O membro solicitado não existe ou foi removido.</p>
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
                <Button asChild variant="secondary">
                  <Link to={`https://discord.com/users/${member.discordId?.split('#')[0]}`} target="_blank" rel="noopener">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Discord
                  </Link>
                </Button>
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
                    <Progress.SkillProgress
                      key={prof.key}
                      profession={prof.key}
                      level={prof.level}
                      tier={prof.tier}
                      maxLevel={100}
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
                <Button variant="ghost" fullWidth asChild>
                  <Link to={`https://discord.com/users/${member.discordId?.split('#')[0]}`} target="_blank" rel="noopener">
                    <span className="flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Enviar Mensagem no Discord
                    </span>
                  </Link>
                </Button>
                <Button variant="ghost" fullWidth asChild>
                  <Link to={`/members/${member.id}/history`}>
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Ver Histórico de Trocas
                    </span>
                  </Link>
                </Button>
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
    </div>
  );
}