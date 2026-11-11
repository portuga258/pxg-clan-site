import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { pokemonTypes, pokemonUtilities } from '../data/mockData';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Modal,
  Section,
  Textarea,
} from '../components/ui';

const statusNames = {
  available: 'Disponível',
  pending: 'Aguardando aprovação',
  borrowed: 'Emprestado',
};

function splitValues(value) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export function Loans() {
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loans, setLoans] = useState([]);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    types: '',
    level: '',
    utilities: '',
    moveset: '',
    held_item: '',
    ability: '',
    description: '',
  });
  const characterId = user?.character?.id;
  const isFormOpen = location.pathname === '/loans/add' && Boolean(token);

  const fetchLoans = useCallback(async () => {
    if (!token) return [];
    const params = new URLSearchParams({ limit: '100' });
    const target = searchParams.get('target');
    if (target) params.set('owner_id', target);
    const result = await apiRequest(`/pokemon-loans?${params}`, { token });
    return result.data;
  }, [searchParams, token]);

  const loadLoans = useCallback(async () => {
    setLoans(await fetchLoans());
  }, [fetchLoans]);

  useEffect(() => {
    let active = true;
    fetchLoans()
      .then((result) => { if (active) setLoans(result); })
      .catch((loadError) => { if (active) setError(loadError.message); });
    return () => { active = false; };
  }, [fetchLoans]);

  const filteredLoans = loans.filter((loan) =>
    [loan.name, loan.owner_name, loan.borrower_name, ...(loan.types || [])]
      .some((value) => value?.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))
  );

  async function refreshAfter(action) {
    setError('');
    try {
      await action();
      await loadLoans();
    } catch (actionError) {
      setError(actionError.message);
    }
  }

  async function addPokemon(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await apiRequest('/pokemon-loans', {
        token,
        method: 'POST',
        body: JSON.stringify({
          ...form,
          level: Number(form.level),
          owner_id: characterId,
          types: splitValues(form.types),
          utilities: splitValues(form.utilities),
          moveset: splitValues(form.moveset),
        }),
      });
      navigate('/loans');
      setForm({ name: '', types: '', level: '', utilities: '', moveset: '', held_item: '', ability: '', description: '' });
      await loadLoans();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-pxg py-8">
      {error && <p className="mb-4 text-body-sm text-pxg-accent-neonRed" role="alert">{error}</p>}
      <Section
        title="📦 Empréstimos de Pokémon"
        description="Ofereça seus Pokémon ao clan, solicite empréstimos e acompanhe devoluções."
        action={user
          ? <Button onClick={() => navigate('/loans/add')}>Adicionar Pokémon</Button>
          : <Button asChild><Link to="/login">Entre para participar</Link></Button>}
      >
        {user ? (
          <>
            <Input
              aria-label="Pesquisar Pokémon"
              placeholder="Buscar Pokémon, dono ou tipo..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="mb-4"
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredLoans.map((loan) => {
                const isOwner = loan.owner_id === characterId;
                const isBorrower = loan.borrower_id === characterId;
                return (
                  <Card key={loan.id}>
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-display font-semibold text-display-sm text-pxg-text-primary">{loan.name}</h2>
                          <p className="text-body-sm text-pxg-text-secondary">Level {loan.level} · Dono: {loan.owner_name}</p>
                        </div>
                        <Badge variant={loan.status === 'available' ? 'available' : loan.status === 'borrowed' ? 'borrowed' : 'collecting'}>
                          {statusNames[loan.status]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(loan.types || []).map((type) => <Badge key={type}>{type}</Badge>)}
                        {(loan.utilities || []).map((utility) => <Badge key={utility} variant="default">{utility}</Badge>)}
                      </div>
                      {loan.description && <p className="text-body-sm text-pxg-text-secondary">{loan.description}</p>}
                      {loan.borrower_name && (
                        <p className="text-body-sm text-pxg-text-secondary">Solicitante: {loan.borrower_name}</p>
                      )}
                      {loan.expected_return_at && (
                        <p className="text-caption text-pxg-text-muted">
                          Devolver até {new Date(loan.expected_return_at * 1000).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {loan.status === 'available' && !isOwner && (
                          <Button size="sm" onClick={() => refreshAfter(() => apiRequest(`/pokemon-loans/${encodeURIComponent(loan.id)}/request`, {
                            token,
                            method: 'POST',
                            body: JSON.stringify({}),
                          }))}>
                            Solicitar empréstimo
                          </Button>
                        )}
                        {loan.status === 'pending' && isOwner && (
                          <Button size="sm" onClick={() => refreshAfter(() => apiRequest(`/pokemon-loans/${encodeURIComponent(loan.id)}/approve`, { token, method: 'PUT' }))}>
                            Aprovar pedido
                          </Button>
                        )}
                        {loan.status === 'borrowed' && (isOwner || isBorrower) && (
                          <Button size="sm" variant="secondary" onClick={() => refreshAfter(() => apiRequest(`/pokemon-loans/${encodeURIComponent(loan.id)}/return`, { token, method: 'PUT' }))}>
                            Registrar devolução
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {filteredLoans.length === 0 && (
              <Card><CardContent className="py-10 text-center text-pxg-text-secondary">
                Não há Pokémon cadastrados para empréstimo{search ? ' com essa busca' : ''}.
              </CardContent></Card>
            )}
          </>
        ) : (
          <Card><CardContent className="py-10 text-center text-pxg-text-secondary">
            Entre ou crie uma conta para ver os empréstimos reais cadastrados pelo clan.
          </CardContent></Card>
        )}
      </Section>

      <Modal
        isOpen={isFormOpen}
        onClose={() => navigate('/loans')}
        title="Adicionar Pokémon ao registro"
        description="Informe dados do Pokémon que você disponibiliza para o clan."
      >
        <form className="space-y-4" onSubmit={addPokemon}>
          <Input label="Pokémon *" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Level *" type="number" min={1} max={1000} value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })} required />
            <Input label="Tipos * (separados por vírgula)" value={form.types} onChange={(event) => setForm({ ...form, types: event.target.value })} placeholder={pokemonTypes.slice(0, 2).join(', ')} required />
          </div>
          <Input label="Utilidades * (separadas por vírgula)" value={form.utilities} onChange={(event) => setForm({ ...form, utilities: event.target.value })} placeholder={pokemonUtilities.slice(0, 3).join(', ')} required />
          <Input label="Moveset (separado por vírgula)" value={form.moveset} onChange={(event) => setForm({ ...form, moveset: event.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Held item" value={form.held_item} onChange={(event) => setForm({ ...form, held_item: event.target.value })} />
            <Input label="Habilidade" value={form.ability} onChange={(event) => setForm({ ...form, ability: event.target.value })} />
          </div>
          <Textarea label="Descrição" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={500} />
          <div className="modal-footer">
            <Button type="button" variant="ghost" onClick={() => navigate('/loans')}>Cancelar</Button>
            <Button type="submit" disabled={submitting || !characterId}>{submitting ? 'Salvando...' : 'Disponibilizar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
