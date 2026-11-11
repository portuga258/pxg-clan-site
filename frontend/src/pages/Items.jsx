import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import itemCatalog from '../data/pxgItemCatalog.json';
import { apiRequest, toMember } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { itemCategories } from '../data/mockData';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Modal,
  Section,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '../components/ui';

const pageSize = 30;
const statusNames = {
  open: 'Aberto',
  collecting: 'Em coleta',
  ready: 'Pronto para entrega',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

function mapRequest(request) {
  return {
    ...request,
    requesterName: request.requester_name,
    targetName: request.target_name,
    collectedQuantity: request.collected_quantity,
    createdAt: request.created_at,
  };
}

function CatalogItemImage({ item }) {
  const [failed, setFailed] = useState(false);

  if (!item.imageUrl || failed) {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-pxg-border-subtle bg-pxg-bg-tertiary text-caption font-semibold text-pxg-text-muted" aria-label="Imagem indisponível">
        PXG
      </span>
    );
  }

  return (
    <img
      src={item.imageUrl}
      alt={item.name}
      loading="lazy"
      decoding="async"
      className="h-12 w-12 shrink-0 rounded-lg border border-pxg-border-subtle bg-pxg-bg-tertiary object-contain p-1"
      onError={() => setFailed(true)}
    />
  );
}

export function Items() {
  const { user, token } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [requestSearch, setRequestSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [catalogPage, setCatalogPage] = useState(0);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [form, setForm] = useState({
    itemName: '',
    itemCategory: 'hunt-loot',
    targetId: searchParams.get('target') || '',
    quantity: 1,
    purpose: '',
    huntSource: '',
    notes: '',
  });

  const characterId = user?.character?.id;
  const otherMembers = members.filter((member) => member.id !== characterId);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest('/characters?limit=100'),
      token ? apiRequest('/item-requests?limit=100', { token }) : Promise.resolve({ data: [] }),
    ]).then(([memberResult, requestResult]) => {
      if (!active) return;
      setMembers(memberResult.data.map(toMember));
      setRequests(requestResult.data.map(mapRequest));
      setPageError('');
    }).catch((error) => {
      if (active) setPageError(`Não foi possível carregar os dados: ${error.message}`);
    });

    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    const target = searchParams.get('target');
    const shouldOpen = location.pathname === '/items/new' || location.pathname === '/items/request';
    if (shouldOpen && token) {
      setForm((current) => ({ ...current, targetId: target || current.targetId }));
      setIsRequestOpen(true);
    }
  }, [location.pathname, searchParams, token]);

  const filteredCatalog = useMemo(() => {
    const normalized = catalogSearch.trim().toLocaleLowerCase('pt-BR');
    return itemCatalog.items.filter((item) =>
      !normalized || item.name.toLocaleLowerCase('pt-BR').includes(normalized)
    );
  }, [catalogSearch]);

  const catalogPageItems = filteredCatalog.slice(catalogPage * pageSize, (catalogPage + 1) * pageSize);
  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const term = requestSearch.trim().toLocaleLowerCase('pt-BR');
    const matchesSearch = !term || [
      request.item_name,
      request.requesterName,
      request.targetName,
      request.purpose,
    ].some((value) => value?.toLocaleLowerCase('pt-BR').includes(term));
    return matchesStatus && matchesSearch;
  });

  function openRequest(itemName = '') {
    setRequestError('');
    setForm((current) => ({
      ...current,
      itemName,
      targetId: searchParams.get('target') || current.targetId || otherMembers[0]?.id || '',
    }));
    setIsRequestOpen(true);
  }

  async function submitRequest(event) {
    event.preventDefault();
    if (!characterId) {
      setRequestError('Seu perfil ainda não tem um personagem vinculado. Saia e entre novamente ou contate a liderança.');
      return;
    }

    setSubmitting(true);
    setRequestError('');
    try {
      const result = await apiRequest('/item-requests', {
        token,
        method: 'POST',
        body: JSON.stringify({
          requester_id: characterId,
          target_id: form.targetId,
          item_name: form.itemName,
          item_category: form.itemCategory,
          quantity: Number(form.quantity),
          purpose: form.purpose,
          hunt_source: form.huntSource,
          notes: form.notes,
        }),
      });
      setRequests((current) => [{
        ...mapRequest(result.request),
        requesterName: user.character.name,
        targetName: members.find((member) => member.id === form.targetId)?.characterName,
      }, ...current]);
      setIsRequestOpen(false);
      setForm((current) => ({ ...current, itemName: '', purpose: '', huntSource: '', notes: '', quantity: 1 }));
    } catch (error) {
      setRequestError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function updateRequest(request, status) {
    setPageError('');
    try {
      const result = await apiRequest(`/item-requests/${encodeURIComponent(request.id)}/status`, {
        token,
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setRequests((current) => current.map((item) =>
        item.id === request.id ? mapRequest({ ...request, ...result.request }) : item
      ));
    } catch (error) {
      setPageError(`Não foi possível atualizar o pedido: ${error.message}`);
    }
  }

  return (
    <div className="container-pxg py-8">
      {pageError && <p className="mb-4 text-body-sm text-pxg-accent-neonRed" role="alert">{pageError}</p>}

      <Section
        title="📦 Catálogo completo de itens PXG"
        description={`Pesquise ${itemCatalog.items.length.toLocaleString('pt-BR')} itens listados nos índices oficiais da Wiki e solicite a outro jogador.`}
        action={
          user
            ? <Button onClick={() => openRequest()}>Novo pedido</Button>
            : <Button asChild><Link to="/login">Entre para solicitar</Link></Button>
        }
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            aria-label="Pesquisar itens PXG"
            placeholder="Pesquisar item pelo nome..."
            value={catalogSearch}
            onChange={(event) => {
              setCatalogSearch(event.target.value);
              setCatalogPage(0);
            }}
          />
          <a
            className="text-body-sm text-pxg-accent-cyan hover:underline"
            href={itemCatalog.source}
            target="_blank"
            rel="noopener noreferrer"
          >
            Fonte: Wiki oficial (itens atualizados em {new Date(itemCatalog.fetchedAt).toLocaleDateString('pt-BR')})
          </a>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Índice da Wiki</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalogPageItems.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell>
                      <a href={item.wikiUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-pxg-text-primary hover:text-pxg-accent-cyan">
                        <CatalogItemImage item={item} />
                        <span>{item.name}</span>
                      </a>
                    </TableCell>
                    <TableCell className="text-pxg-text-secondary">{item.categories[0]}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="secondary" onClick={() => openRequest(item.name)} disabled={!user}>
                        Solicitar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {catalogPageItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-pxg-text-secondary">
                      Nenhum item encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="mt-4 flex items-center justify-between text-body-sm text-pxg-text-secondary">
          <span>
            {filteredCatalog.length
              ? `${catalogPage * pageSize + 1}–${Math.min((catalogPage + 1) * pageSize, filteredCatalog.length)} de ${filteredCatalog.length}`
              : '0 itens'}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCatalogPage((page) => Math.max(0, page - 1))}
              disabled={catalogPage === 0}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCatalogPage((page) => page + 1)}
              disabled={(catalogPage + 1) * pageSize >= filteredCatalog.length}
            >
              Próxima
            </Button>
          </div>
        </div>
      </Section>

      <Section
        title="Pedidos entre jogadores"
        description={user ? 'Acompanhe pedidos e atualize o andamento dos que envolvem seu personagem.' : 'Entre para visualizar os pedidos do clan.'}
        className="mt-8"
      >
        {user ? (
          <>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <Input
                aria-label="Pesquisar pedidos"
                placeholder="Buscar item, solicitante ou coletor..."
                value={requestSearch}
                onChange={(event) => setRequestSearch(event.target.value)}
              />
              <Select
                aria-label="Filtrar pedidos por status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                options={[
                  { value: 'all', label: 'Todos os status' },
                  ...Object.entries(statusNames).map(([value, label]) => ({ value, label })),
                ]}
              />
            </div>
            <div className="space-y-3">
              {filteredRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-pxg-text-primary">{request.item_name} × {request.quantity}</h3>
                      <p className="text-body-sm text-pxg-text-secondary">
                        {request.requesterName} pediu para {request.targetName}
                        {request.purpose ? ` · ${request.purpose}` : ''}
                      </p>
                      <p className="text-caption text-pxg-text-muted">
                        Coletado: {request.collectedQuantity}/{request.quantity}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={request.status}>{statusNames[request.status] || request.status}</Badge>
                      {request.target_id === characterId && request.status === 'open' && (
                        <Button size="sm" onClick={() => updateRequest(request, 'collecting')}>Iniciar coleta</Button>
                      )}
                      {request.target_id === characterId && request.status === 'collecting' && (
                        <Button size="sm" onClick={() => updateRequest(request, 'ready')}>Marcar pronto</Button>
                      )}
                      {request.requester_id === characterId && request.status === 'ready' && (
                        <Button size="sm" onClick={() => updateRequest(request, 'completed')}>Confirmar entrega</Button>
                      )}
                      {(request.requester_id === characterId || request.target_id === characterId) &&
                        !['completed', 'cancelled'].includes(request.status) && (
                          <Button size="sm" variant="danger" onClick={() => updateRequest(request, 'cancelled')}>Cancelar</Button>
                        )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredRequests.length === 0 && (
                <Card><CardContent className="py-8 text-center text-pxg-text-secondary">Ainda não há pedidos.</CardContent></Card>
              )}
            </div>
          </>
        ) : (
          <Card><CardContent className="py-8 text-center text-pxg-text-secondary">
            <Link className="text-pxg-accent-cyan hover:underline" to="/login">Entre na sua conta</Link> para acessar os pedidos.
          </CardContent></Card>
        )}
      </Section>

      <Modal
        isOpen={isRequestOpen}
        onClose={() => setIsRequestOpen(false)}
        title="Solicitar item a outro jogador"
        description="O jogador escolhido receberá o pedido na lista do clan."
        size="lg"
      >
        <form onSubmit={submitRequest} className="space-y-4">
          <Input
            label="Item *"
            list="pxg-item-names"
            value={form.itemName}
            onChange={(event) => setForm({ ...form, itemName: event.target.value })}
            placeholder="Digite para buscar no catálogo completo"
            required
          />
          <datalist id="pxg-item-names">
            {itemCatalog.items.map((item) => <option key={item.name} value={item.name} />)}
          </datalist>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Solicitar para *"
              value={form.targetId}
              onChange={(event) => setForm({ ...form, targetId: event.target.value })}
              options={otherMembers.map((member) => ({ value: member.id, label: `${member.characterName} (Lv. ${member.level})` }))}
              placeholder="Escolha outro jogador"
              required
              disabled={!otherMembers.length}
            />
            <Select
              label="Categoria *"
              value={form.itemCategory}
              onChange={(event) => setForm({ ...form, itemCategory: event.target.value })}
              options={itemCategories.map(({ id, name }) => ({ value: id, label: name }))}
              required
            />
          </div>
          {!otherMembers.length && (
            <p className="text-body-sm text-pxg-text-secondary">
              Ainda não há outro jogador cadastrado para receber pedidos. Compartilhe a página de cadastro com o clan.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Quantidade *"
              type="number"
              min={1}
              max={100000}
              value={form.quantity}
              onChange={(event) => setForm({ ...form, quantity: event.target.value })}
              required
            />
            <Input
              label="Hunt / origem"
              value={form.huntSource}
              onChange={(event) => setForm({ ...form, huntSource: event.target.value })}
              maxLength={120}
            />
          </div>
          <Textarea
            label="Finalidade *"
            value={form.purpose}
            onChange={(event) => setForm({ ...form, purpose: event.target.value })}
            maxLength={500}
            required
          />
          <Textarea
            label="Observações"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            maxLength={500}
          />
          {requestError && <p className="text-body-sm text-pxg-accent-neonRed" role="alert">{requestError}</p>}
          <div className="modal-footer">
            <Button type="button" variant="ghost" onClick={() => setIsRequestOpen(false)}>Voltar</Button>
            <Button type="submit" disabled={submitting || !otherMembers.length}>
              {submitting ? 'Enviando...' : 'Enviar pedido'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
