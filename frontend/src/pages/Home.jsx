import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { formatRelativeTime } from '../lib/utils';
import {
  Trophy,
  TrendingUp,
  Users,
  Clock,
  MessageSquare,
  ChevronRight,
  Sparkles,
  Shield,
  Crown,
  Zap,
} from '../lib/icons';
import { clanInfo, announcements, members } from '../data/mockData';
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
  StatsCard,
  Section,
  Grid,
} from '../components/ui';

export function Home() {
  // Top members by level
  const topCombat = [...members]
    .sort((a, b) => b.level - a.level)
    .slice(0, 5);

  // Top members by profession (Stylist)
  const topStylist = [...members]
    .filter(m => m.professions.stylist)
    .sort((a, b) => b.professions.stylist.level - a.professions.stylist.level)
    .slice(0, 5);

  // Recent announcements
  const recentAnnouncements = announcements
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const stats = [
    {
      label: 'Membros Ativos',
      value: members.filter(m => m.activityStatus === 'online').length,
      change: '+3 esta semana',
      trend: 'up',
      icon: Users,
    },
    {
      label: 'Level Médio',
      value: Math.round(members.reduce((sum, m) => sum + m.level, 0) / members.length),
      change: '+12 vs mês passado',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      label: 'Pokémons Emprestados',
      value: 8,
      change: '2 empréstimos ativos',
      trend: 'up',
      icon: Sparkles,
    },
    {
      label: 'Pedidos de Itens',
      value: 12,
      change: '5 em andamento',
      trend: 'up',
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <div className="absolute inset-0 bg-gradient-to-br from-pxg-accent-purple/20 via-transparent to-pxg-accent-cyan/10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%270 0 400 400%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noiseFilter%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noiseFilter)%27 opacity=%270.03%27/%3E%3C/svg%3E')]" />

        <div className="container-pxg relative py-20 lg:py-32">
          <div className="max-w-4xl animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pxg-accent-purple to-pxg-accent-cyan flex items-center justify-center text-4xl shadow-neon-purple">
                {clanInfo.emblem}
              </div>
              <div>
                <h1 id="hero-title" className="font-display font-bold text-display-xl text-pxg-text-primary tracking-tight">
                  {clanInfo.name}
                </h1>
                <p className="text-body-lg text-pxg-text-secondary mt-1">{clanInfo.tag}</p>
              </div>
            </div>

            <p className="text-display-sm font-medium text-pxg-accent-neonGreen mb-6 italic">
              "{clanInfo.slogan}"
            </p>

            <p className="text-body-lg text-pxg-text-secondary max-w-2xl mb-8">
              Clan focado em progressão cooperativa, otimização de hunts e compartilhamento de recursos no PokéXGames.
              Junte-se a nós e evolua junto com a melhor comunidade do PXG!
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/members">
                  <span>Ver Membros</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link to={clanInfo.discordUrl} target="_blank" rel="noopener noreferrer">
                  <span>Entrar no Discord</span>
                </Link>
              </Button>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-4 mt-8 text-body-sm">
              <Badge variant={clanInfo.recruitmentStatus === 'open' ? 'available' : 'borrowed'} className="gap-1.5">
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                {clanInfo.recruitmentStatus === 'open' ? 'Recrutamento Aberto' : 'Recrutamento Fechado'}
              </Badge>
              <span className="text-pxg-text-muted flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {members.length}/{clanInfo.maxMembers} membros
              </span>
              <span className="text-pxg-text-muted flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Fundado em {new Date(clanInfo.foundedDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <Section className="py-6">
        <Grid columns={1} sm={2} lg={4}>
          {stats.map((stat, index) => (
            <StatsCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
              icon={<stat.icon className="w-6 h-6 text-pxg-accent-neonGreen" />}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </Grid>
      </Section>

      {/* Main Content Grid */}
      <div className="container-pxg pb-16">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Announcements & Rankings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Announcements */}
            <Section title="📢 Mural de Avisos" description="Últimas notícias e comunicados da liderança">
              <div className="space-y-3">
                {recentAnnouncements.map((announcement) => (
                  <Card key={announcement.id} hover className="group">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pxg-bg-tertiary flex items-center justify-center">
                          {announcement.type === 'event' && <Sparkles className="w-5 h-5 text-pxg-accent-gold" />}
                          {announcement.type === 'rule' && <Shield className="w-5 h-5 text-pxg-accent-cyan" />}
                          {announcement.type === 'maintenance' && <Zap className="w-5 h-5 text-pxg-accent-neonRed" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display font-semibold text-body text-pxg-text-primary">
                              {announcement.title}
                            </h3>
                            {announcement.pinned && (
                              <Badge variant="leader" className="flex-shrink-0">Fixado</Badge>
                            )}
                          </div>
                          <p className="text-body-sm text-pxg-text-secondary mt-1 line-clamp-2">
                            {announcement.content}
                          </p>
                          <div className="flex items-center gap-3 mt-3 text-caption text-pxg-text-muted">
                            <span className="flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              {announcement.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(announcement.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <div className="text-center pt-2">
                  <Button variant="ghost" asChild>
                    <Link to="/announcements">Ver todos os avisos</Link>
                  </Button>
                </div>
              </div>
            </Section>

            {/* Rankings */}
            <Section title="🏆 Ranking do Clan" description="Top membros por nível de combate e profissão">
              <div className="grid gap-6">
                {/* Combat Ranking */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-pxg-accent-gold" />
                        <CardTitle className="text-display-sm">Top Combate</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {topCombat.map((member, index) => (
                        <div key={member.id} className="flex items-center gap-3 group">
                          <div className={cn(
                            'w-8 h-8 flex items-center justify-center rounded-lg font-display font-bold text-pxg-bg-primary',
                            index === 0 ? 'bg-pxg-accent-gold' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-amber-600' :
                            'bg-pxg-bg-tertiary text-pxg-text-muted'
                          )}>
                            #{index + 1}
                          </div>
                          <Avatar name={member.characterName} clanType={member.clanType} size="sm" status={member.activityStatus} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-pxg-text-primary truncate">{member.characterName}</p>
                            <p className="text-caption text-pxg-text-muted">
                              Level {member.level} • {member.vocation}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-display font-bold text-body text-pxg-accent-neonGreen">Lv.{member.level}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Stylist Ranking */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-pxg-accent-cyan" />
                        <CardTitle className="text-display-sm">Top Stylist</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {topStylist.map((member, index) => (
                        <div key={member.id} className="flex items-center gap-3">
                          <div className={cn(
                            'w-8 h-8 flex items-center justify-center rounded-lg font-display font-bold text-pxg-bg-primary',
                            index === 0 ? 'bg-pxg-accent-gold' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-amber-600' :
                            'bg-pxg-bg-tertiary text-pxg-text-muted'
                          )}>
                            #{index + 1}
                          </div>
                          <Avatar name={member.characterName} clanType={member.clanType} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-pxg-text-primary truncate">{member.characterName}</p>
                            <div className="flex items-center gap-2">
                              <RankTierBadge tier={member.professions.stylist.tier} />
                              <span className="text-caption text-pxg-text-muted">Lv.{member.professions.stylist.level}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display font-bold text-body text-pxg-accent-cyan">
                              {member.professions.stylist.level}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Section>
          </div>

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-display-sm">Ações Rápidas</CardTitle>
                <CardDescription>Atalhos para as principais funcionalidades</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <Button variant="secondary" fullWidth asChild>
                  <Link to="/loans">
                    <span className="flex items-center justify-center gap-2">
                      <Package className="w-4 h-4" />
                      Ver Pokémons Disponíveis
                    </span>
                  </Link>
                </Button>
                <Button variant="secondary" fullWidth asChild>
                  <Link to="/items">
                    <span className="flex items-center justify-center gap-2">
                      <ShoppingCart className="w-4 h-4" />
                      Pedidos de Itens
                    </span>
                  </Link>
                </Button>
                <Button variant="secondary" fullWidth asChild>
                  <Link to="/members">
                    <span className="flex items-center justify-center gap-2">
                      <Users className="w-4 h-4" />
                      Ver Todos os Membros
                    </span>
                  </Link>
                </Button>
                <Button variant="ghost" fullWidth asChild>
                  <Link to={clanInfo.discordUrl} target="_blank" rel="noopener noreferrer">
                    <span className="flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Discord do Clan
                    </span>
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Clan Perks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-display-sm">Benefícios do Clan</CardTitle>
                <CardDescription>O que você ganha fazendo parte do Lá Eles</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {[
                  { icon: Sparkles, title: 'Pokémons Emprestados', desc: 'Acesso a pokémons high-level para quests e leveling' },
                  { icon: Shield, title: 'Hunts Organizadas', desc: 'Party garantida para Roshamuul, Ferumbras e bosses' },
                  { icon: Zap, title: 'Economia Compartilhada', desc: 'Sistema de requisição de itens e craft cooperativo' },
                  { icon: Crown, title: 'Suporte de Officers', desc: 'Ajuda com quests, addons e mecânicas do jogo' },
                ].map((perk) => (
                  <div key={perk.title} className="flex items-start gap-3 p-3 rounded-lg bg-pxg-bg-tertiary/30 hover:bg-pxg-bg-hover/50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-pxg-accent-purple/20 flex items-center justify-center">
                      <perk.icon className="w-4 h-4 text-pxg-accent-cyan" />
                    </div>
                    <div>
                      <p className="font-medium text-pxg-text-primary">{perk.title}</p>
                      <p className="text-caption text-pxg-text-secondary">{perk.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Online Members */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-pxg-accent-neonGreen animate-pulse" />
                    <CardTitle className="text-display-sm">Online Agora</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {members
                    .filter(m => m.activityStatus === 'online')
                    .slice(0, 8)
                    .map((member) => (
                      <Link key={member.id} to={`/members/${member.id}`} className="block">
                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-pxg-bg-hover/50 transition-colors group">
                          <Avatar name={member.characterName} clanType={member.clanType} size="sm" status="online" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-pxg-text-primary truncate group-hover:text-pxg-accent-neonGreen transition-colors">
                              {member.characterName}
                            </p>
                            <p className="text-caption text-pxg-text-muted truncate">
                              {member.vocation} • Lv.{member.level}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-pxg-text-muted group-hover:text-pxg-accent-neonGreen transition-colors opacity-0 group-hover:opacity-100" />
                        </div>
                      </Link>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}