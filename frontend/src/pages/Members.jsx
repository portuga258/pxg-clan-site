import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { apiRequest, toMember } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import {
  Search,
  Filter,
  ChevronDown,
  User,
  Trophy,
  Sparkles,
  Wheat,
  Crown,
  Shield,
} from '../lib/icons';
import { professionOrder, getClanTypeName } from '../data/mockData';
import {
  Card,
  CardContent,
  Badge,
  ClanBadge,
  RankTierBadge,
  Avatar,
  Button,
  Input,
  Dropdown,
  Section,
  Grid,
} from '../components/ui';

export function Members() {
  const { token } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [clanFilter, setClanFilter] = useState('all');
  const [professionFilter, setProfessionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('level');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiRequest('/characters?limit=100')
      .then((result) => {
        if (active) setMembers(result.data.map(toMember));
      })
      .catch((error) => {
        if (active) setLoadError(`Não foi possível carregar os membros: ${error.message}`);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [token]);

  const clans = [...new Set(members.map(m => m.clanType))];
  const professions = professionOrder;

  const filteredMembers = useMemo(() => {
    return members
      .filter(member => {
        const matchesSearch = member.characterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.vocation.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesClan = clanFilter === 'all' || member.clanType === clanFilter;
        const matchesProfession = professionFilter === 'all' ||
          (member.professions[professionFilter] && member.professions[professionFilter].level > 0);

        return matchesSearch && matchesClan && matchesProfession;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'level':
            return b.level - a.level;
          case 'name':
            return a.characterName.localeCompare(b.characterName);
          case 'joinDate':
            return new Date(a.joinDate) - new Date(b.joinDate);
          case 'stylist':
            return (b.professions.stylist?.level || 0) - (a.professions.stylist?.level || 0);
          case 'adventurer':
            return (b.professions.adventurer?.level || 0) - (a.professions.adventurer?.level || 0);
          default:
            return 0;
        }
      });
  }, [searchQuery, clanFilter, professionFilter, sortBy]);

  const onlineCount = members.filter(m => m.activityStatus === 'online').length;

  const sortOptions = [
    { key: 'level', label: 'Level (Maior)' },
    { key: 'name', label: 'Nome (A-Z)' },
    { key: 'joinDate', label: 'Mais Antigos' },
    { key: 'stylist', label: 'Stylist Level' },
    { key: 'adventurer', label: 'Adventurer Level' },
  ];

  const clanFilterItems = [
    { key: 'all', label: 'Todos os Clans' },
    ...clans.map(c => ({ key: c, label: getClanTypeName(c) })),
  ];

  const professionFilterItems = [
    { key: 'all', label: 'Todas Profissões' },
    ...professions.map(p => ({ key: p, label: p.charAt(0).toUpperCase() + p.slice(1) })),
  ];

  return (
    <div className="min-h-screen">
      <Section
        title="👥 Fichas dos Personagens"
        description="Dossiê completo de todos os membros do clan Lá Eles"
        action={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
          </div>
        }
      >
        {/* Search & Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pxg-text-muted" />
              <Input
                placeholder="Buscar por nome, nick, vocação..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dropdown
              trigger={
                <Button variant="secondary" className="whitespace-nowrap">
                  <ChevronDown className="w-4 h-4" />
                  Ordenar: {sortOptions.find(o => o.key === sortBy)?.label}
                </Button>
              }
              items={sortOptions.map(o => ({ key: o.key, label: o.label, onClick: () => setSortBy(o.key) }))}
            />
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 p-4 bg-pxg-bg-tertiary/30 rounded-lg animate-slide-down">
              <Dropdown
                trigger={
                  <Button variant="secondary" size="sm">
                    <ChevronDown className="w-4 h-4" />
                    Clan: {clanFilterItems.find(i => i.key === clanFilter)?.label}
                  </Button>
                }
                items={clanFilterItems.map(i => ({ key: i.key, label: i.label, onClick: () => setClanFilter(i.key) }))}
              />
              <Dropdown
                trigger={
                  <Button variant="secondary" size="sm">
                    <ChevronDown className="w-4 h-4" />
                    Profissão: {professionFilterItems.find(i => i.key === professionFilter)?.label}
                  </Button>
                }
                items={professionFilterItems.map(i => ({ key: i.key, label: i.label, onClick: () => setProfessionFilter(i.key) }))}
              />
              <Button variant="ghost" size="sm" onClick={() => { setClanFilter('all'); setProfessionFilter('all'); setSearchQuery(''); }}>
                Limpar filtros
              </Button>
            </div>
          )}

          {/* Results Count */}
          <p className="text-body-sm text-pxg-text-secondary">
            {filteredMembers.length} de {members.length} membros
            {onlineCount > 0 && <span className="ml-2 flex items-center gap-1 text-pxg-accent-neonGreen"><span className="w-2 h-2 rounded-full bg-current animate-pulse" /> {onlineCount} online</span>}
          </p>
          {loadError && <p className="mt-2 text-body-sm text-pxg-accent-neonRed" role="alert">{loadError}</p>}
        </div>

        {/* Members Grid */}
        <Grid columns={1} sm={2} lg={3} xl={4}>
          {filteredMembers.map((member) => (
            <Link key={member.id} to={`/members/${member.id}`}>
              <Card className="h-full hover group cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={member.characterName}
                      clanType={member.clanType}
                      size="md"
                      status={member.activityStatus}
                      vocation={member.vocation}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-semibold text-body text-pxg-text-primary group-hover:text-pxg-accent-neonGreen transition-colors">
                          {member.characterName}
                        </h3>
                        {member.badges.includes('leader') && <Badge variant="leader">Líder</Badge>}
                        {member.badges.includes('officer') && <Badge variant="officer">Officer</Badge>}
                        {member.badges.includes('master-crafter') && <Badge variant="master-crafter">Master Crafter</Badge>}
                      </div>
                      <p className="text-caption text-pxg-text-muted mt-0.5">{member.vocation} • Level {member.level}</p>
                      <ClanBadge clanType={member.clanType} className="mt-1" />
                    </div>
                  </div>

                  {/* Top Profession */}
                  <div className="mt-4 pt-3 border-t border-pxg-border-subtle/30">
                    <p className="text-caption text-pxg-text-muted mb-2">Principais Profissões</p>
                    <div className="flex flex-wrap gap-1.5">
                      {professionOrder
                        .filter(p => member.professions[p] && member.professions[p].level > 0)
                        .sort((a, b) => (member.professions[b]?.level || 0) - (member.professions[a]?.level || 0))
                        .slice(0, 3)
                        .map((prof) => {
                          const data = member.professions[prof];
                          return (
                            <Badge key={prof} variant={data.tier === 'S' ? 'master-crafter' : 'default'} className="text-[10px] px-2 py-1">
                              <RankTierBadge tier={data.tier} className="text-[10px] px-1.5 py-0.5" />
                              {prof.charAt(0).toUpperCase() + prof.slice(1)} {data.level}
                            </Badge>
                          );
                        })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {!loading && filteredMembers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <User className="w-12 h-12 mx-auto text-pxg-text-muted mb-4" />
              <p className="text-pxg-text-secondary">
                {members.length ? 'Nenhum membro encontrado com esses filtros' : 'Ainda não há membros cadastrados.'}
              </p>
              {!members.length && (
                <Button asChild className="mt-4"><Link to="/register">Criar uma conta</Link></Button>
              )}
            </div>
          )}
        </Grid>
      </Section>
    </div>
  );
}