import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
  Search,
  Filter,
  ChevronDown,
  Package,
  User,
  Clock,
  ArrowRight,
  Check,
  X,
  AlertTriangle,
  Star,
  Zap,
  Shield,
  Heart,
} from '../lib/icons';
import { pokemonLoans, members, pokemonTypes, pokemonUtilities, getAvailablePokemons, getMemberById } from '../data/mockData';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  ClanBadge,
  Avatar,
  Button,
  Input,
  Dropdown,
  Modal,
  Section,
  Grid,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui';

const typeColors = {
  Normal: 'bg-gray-600 text-gray-100',
  Fire: 'bg-red-600 text-red-50',
  Water: 'bg-blue-600 text-blue-50',
  Electric: 'bg-yellow-500 text-yellow-50',
  Grass: 'bg-green-600 text-green-50',
  Ice: 'bg-cyan-400 text-cyan-50',
  Fighting: 'bg-orange-600 text-orange-50',
  Poison: 'bg-purple-600 text-purple-50',
  Ground: 'bg-amber-700 text-amber-50',
  Flying: 'bg-indigo-400 text-indigo-50',
  Psychic: 'bg-pink-600 text-pink-50',
  Bug: 'bg-lime-600 text-lime-50',
  Rock: 'bg-stone-600 text-stone-50',
  Ghost: 'bg-violet-700 text-violet-50',
  Dragon: 'bg-indigo-700 text-indigo-50',
  Dark: 'bg-gray-800 text-gray-100',
  Steel: 'bg-slate-500 text-slate-50',
  Fairy: 'bg-rose-400 text-rose-50',
};

const utilityIcons = {
  Blocker: Shield,
  Hiker: Zap,
  Fly: Zap,
  Surf: Heart,
  Healer: Heart,
  Support: Star,
  'High DPS': Zap,
  Tank: Shield,
  Speed: Zap,
  Catcher: Star,
};

export function Loans() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [utilityFilter, setUtilityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestQuantity, setRequestQuantity] = useState(1);
  const [requestNotes, setRequestNotes] = useState('');

  const filteredPokemons = useMemo(() => {
    return getAvailablePokemons({
      type: typeFilter !== 'all' ? typeFilter : undefined,
      utility: utilityFilter !== 'all' ? utilityFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    }).filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, typeFilter, utilityFilter, statusFilter]);

  const availableCount = pokemonLoans.filter(p => p.status === 'available').length;
  const borrowedCount = pokemonLoans.filter(p => p.status === 'borrowed').length;

  const handleRequest = (pokemon) => {
    setSelectedPokemon(pokemon);
    setRequestModalOpen(true);
    setRequestQuantity(1);
    setRequestNotes('');
  };

  const handleConfirmRequest = () => {
    // Here would be API call to request loan
    console.log('Requesting loan:', selectedPokemon, requestQuantity, requestNotes);
    setRequestModalOpen(false);
    setSelectedPokemon(null);
    // Show success toast
  };

  return (
    <div className="min-h-screen">
      <Section
        title="📦 Sistema de Empréstimo de Pokémon"
        description="Registry de pokémons disponíveis para empréstimo entre membros do clan"
        action={
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4" />
              Filtros
            </Button>
            <Button asChild>
              <Link to="/loans/add">
                <Package className="w-4 h-4 mr-1" />
                Adicionar Pokémon
              </Link>
            </Button>
          </div>
        }
      >
        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="font-display font-bold text-display-lg text-pxg-accent-neonGreen">{availableCount}</p>
              <p className="text-caption text-pxg-text-muted">Disponíveis</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="font-display font-bold text-display-lg text-pxg-accent-neonRed">{borrowedCount}</p>
              <p className="text-caption text-pxg-text-muted">Emprestados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="font-display font-bold text-display-lg text-pxg-accent-cyan">{pokemonLoans.length}</p>
              <p className="text-caption text-pxg-text-muted">Total no Registry</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pxg-text-muted" />
              <Input
                placeholder="Buscar Pokémon, dono, tipo, utilidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'cards' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('cards')}
                className="whitespace-nowrap"
              >
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'primary' : 'secondary'}
                onClick={() => setViewMode('table')}
                className="whitespace-nowrap"
              >
                Tabela
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-3 p-4 bg-pxg-bg-tertiary/30 rounded-lg animate-slide-down">
              <Dropdown
                trigger={
                  <Button variant="secondary" size="sm">
                    <ChevronDown className="w-4 h-4" />
                    Tipo: {typeFilter === 'all' ? 'Todos' : typeFilter}
                  </Button>
                }
                items={[{ key: 'all', label: 'Todos os Tipos' }, ...pokemonTypes.map(t => ({ key: t, label: t }))].map(i => ({
                  key: i.key,
                  label: i.label,
                  onClick: () => setTypeFilter(i.key)
                }))}
              />
              <Dropdown
                trigger={
                  <Button variant="secondary" size="sm">
                    <ChevronDown className="w-4 h-4" />
                    Utilidade: {utilityFilter === 'all' ? 'Todas' : utilityFilter}
                  </Button>
                }
                items={[{ key: 'all', label: 'Todas Utilidades' }, ...pokemonUtilities.map(u => ({ key: u, label: u }))].map(i => ({
                  key: i.key,
                  label: i.label,
                  onClick: () => setUtilityFilter(i.key)
                }))}
              />
              <Dropdown
                trigger={
                  <Button variant="secondary" size="sm">
                    <ChevronDown className="w-4 h-4" />
                    Status: {statusFilter === 'all' ? 'Todos' : statusFilter}
                  </Button>
                }
                items={[
                  { key: 'all', label: 'Todos' },
                  { key: 'available', label: 'Disponíveis' },
                  { key: 'borrowed', label: 'Emprestados' },
                ].map(i => ({
                  key: i.key,
                  label: i.label,
                  onClick: () => setStatusFilter(i.key)
                }))}
              />
              <Button variant="ghost" size="sm" onClick={() => { setTypeFilter('all'); setUtilityFilter('all'); setStatusFilter('all'); setSearchQuery(''); }}>
                Limpar
              </Button>
            </div>
          )}

          <p className="text-body-sm text-pxg-text-secondary">
            {filteredPokemons.length} de {pokemonLoans.length} pokémons
          </p>
        </div>

        {/* Pokemon List */}
        {viewMode === 'cards' ? (
          <Grid columns={1} sm={2} lg={3}>
            {filteredPokemons.map((pokemon) => (
              <Card key={pokemon.id} hover className="h-full flex flex-col">
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pxg-accent-purple to-pxg-accent-cyan flex items-center justify-center text-3xl">
                        {getPokemonEmoji(pokemon.name)}
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-body text-pxg-text-primary">{pokemon.name}</h3>
                        <p className="text-caption text-pxg-text-muted">Level {pokemon.level}</p>
                      </div>
                    </div>
                    <Badge variant={pokemon.status === 'available' ? 'available' : 'borrowed'}>
                      {pokemon.status === 'available' ? 'Disponível' : 'Emprestado'}
                    </Badge>
                  </div>

                  {/* Types */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {pokemon.type.map((type) => (
                      <span
                        key={type}
                        className={cn('px-2 py-0.5 rounded text-[10px] font-medium', typeColors[type] || 'bg-gray-600 text-gray-100')}
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  {/* Utilities */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {pokemon.utility.slice(0, 4).map((util) => {
                      const Icon = utilityIcons[util];
                      return (
                        <Badge key={util} variant="default" className="bg-pxg-bg-tertiary border-pxg-border-subtle text-pxg-text-secondary text-[10px] px-2 py-1 flex items-center gap-1">
                          {Icon && <Icon className="w-3 h-3" />}
                          {util}
                        </Badge>
                      );
                    })}
                    {pokemon.utility.length > 4 && (
                      <Badge variant="default" className="bg-pxg-bg-tertiary border-pxg-border-subtle text-pxg-text-secondary text-[10px] px-2 py-1">
                        +{pokemon.utility.length - 4} mais
                      </Badge>
                    )}
                  </div>

                  {/* Owner */}
                  <div className="flex items-center gap-2 mb-4 pt-3 border-t border-pxg-border-subtle/30">
                    <Avatar name={pokemon.ownerName} size="sm" clanType={getMemberById(pokemon.ownerId)?.clanType} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-pxg-text-primary text-body-sm truncate">{pokemon.ownerName}</p>
                      <p className="text-caption text-pxg-text-muted">Dono do Pokémon</p>
                    </div>
                  </div>

                  {/* Status Details */}
                  {pokemon.status === 'borrowed' && (
                    <div className="mb-4 p-3 bg-pxg-accent-neonRed/10 border border-pxg-accent-neonRed/20 rounded-lg">
                      <div className="flex items-center gap-2 text-body-sm">
                        <ArrowRight className="w-4 h-4 text-pxg-accent-neonRed" />
                        <span className="text-pxg-text-secondary">Emprestado para</span>
                        <strong className="text-pxg-accent-neonRed">{pokemon.borrowerName}</strong>
                      </div>
                      <p className="text-caption text-pxg-text-muted mt-1">
                        Devolução prevista: {pokemon.expectedReturn ? new Date(pokemon.expectedReturn).toLocaleDateString('pt-BR') : 'Não definida'}
                      </p>
                    </div>
                  )}

                  <div className="mt-auto">
                    {pokemon.status === 'available' ? (
                      <Button fullWidth onClick={() => handleRequest(pokemon)}>
                        <span className="flex items-center justify-center gap-2">
                          <Package className="w-4 h-4" />
                          Solicitar Empréstimo
                        </span>
                      </Button>
                    ) : (
                      <Button variant="secondary" fullWidth disabled>
                        <span className="flex items-center justify-center gap-2">
                          <X className="w-4 h-4" />
                          Indisponível
                        </span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredPokemons.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Package className="w-12 h-12 mx-auto text-pxg-text-muted mb-4" />
                <p className="text-pxg-text-secondary">Nenhum Pokémon encontrado com esses filtros</p>
              </div>
            )}
          </Grid>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pokémon</TableHead>
                    <TableHead>Tipos</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Utilidades</TableHead>
                    <TableHead>Dono</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPokemons.map((pokemon) => (
                    <TableRow key={pokemon.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getPokemonEmoji(pokemon.name)}</span>
                          <div>
                            <p className="font-medium text-pxg-text-primary">{pokemon.name}</p>
                            <p className="text-caption text-pxg-text-muted">Lv.{pokemon.level}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {pokemon.type.map((type) => (
                            <span key={type} className={cn('px-2 py-0.5 rounded text-[10px] font-medium', typeColors[type])}>
                              {type}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>Lv.{pokemon.level}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {pokemon.utility.slice(0, 3).map((util) => (
                            <Badge key={util} variant="default" className="text-[10px] px-2 py-1">
                              {util}
                            </Badge>
                          ))}
                          {pokemon.utility.length > 3 && <Badge variant="default" className="text-[10px] px-2 py-1">+{pokemon.utility.length - 3}</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar name={pokemon.ownerName} size="xs" clanType={getMemberById(pokemon.ownerId)?.clanType} />
                          <span className="text-body-sm font-medium text-pxg-text-primary">{pokemon.ownerName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={pokemon.status === 'available' ? 'available' : 'borrowed'}>
                          {pokemon.status === 'available' ? 'Disponível' : 'Emprestado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {pokemon.status === 'available' ? (
                          <Button size="sm" onClick={() => handleRequest(pokemon)}>
                            Solicitar
                          </Button>
                        ) : (
                          <Badge variant="borrowed" className="text-[10px]">Indisponível</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Request Modal */}
        <Modal
          isOpen={requestModalOpen}
          onClose={() => setRequestModalOpen(false)}
          title="Solicitar Empréstimo"
          description={`Você está pedindo emprestado: ${selectedPokemon?.name} (Lv.${selectedPokemon?.level})`}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="label">Duração do empréstimo (dias)</label>
              <Input
                type="number"
                value={requestQuantity}
                onChange={(e) => setRequestQuantity(parseInt(e.target.value) || 1)}
                min={1}
                max={30}
              />
            </div>
            <div>
              <label className="label">Observações (opcional)</label>
              <Input
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                placeholder="Ex: Preciso para quest do Ferumbras, hunt na Roshamuul..."
              />
            </div>
            <div className="p-3 bg-pxg-bg-tertiary/30 rounded-lg text-body-sm text-pxg-text-secondary">
              <p><strong>Dono:</strong> {selectedPokemon?.ownerName}</p>
              <p><strong>Pokémon:</strong> {selectedPokemon?.name} (Level {selectedPokemon?.level})</p>
              <p><strong>Utilidades:</strong> {selectedPokemon?.utility.join(', ')}</p>
            </div>
          </div>
          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setRequestModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleConfirmRequest} loading={false}>
              <Send className="w-4 h-4 mr-1" />
              Enviar Solicitação
            </Button>
          </div>
        </Modal>
      </Section>
    </div>
  );
}

function getPokemonEmoji(name) {
  const emojis = {
    Gengar: '👻',
    Blissey: '💗',
    Charizard: '🐉',
    Garchomp: '🦈',
    Torkoal: '🐢',
    Pelipper: '🐦',
    Breloom: '🍄',
    Excadrill: '🦡',
  };
  return emojis[name] || '❓';
}