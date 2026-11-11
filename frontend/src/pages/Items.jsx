import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { formatRelativeTime } from '../lib/utils';

// Inline SVG icons to avoid build issues
const Icons = {
  Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Filter: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  ShoppingCart: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a2 2 0 00-2-2H6a2 2 0 00-2 2v4m0 0H4m12 0l-2.5 7.5A2 2 0 0115.5 21H5.5A2 2 0 013 18.5V7m14 0H5m0 0a2 2 0 012-2h10a2 2 0 012 2" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Package: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  User: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Clock: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  CheckCircle: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Loader2: () => <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  AlertTriangle: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  XCircle: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>,
  Send: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  RotateCcw: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  MoreHorizontal: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2" /><circle cx="19" cy="12" r="1" stroke="currentColor" strokeWidth="2" /><circle cx="5" cy="12" r="1" stroke="currentColor" strokeWidth="2" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  MapPin: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  CheckCircle2: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  XCircle2: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Package2: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
};
import { itemRequests, members, itemCategories, getItemRequestsByStatus, getMemberById } from '../data/mockData';
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
  Select,
  Textarea,
  Section,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui';

const statusConfig = {
  open: { icon: AlertTriangle, color: 'text-pxg-accent-cyan', label: 'Aberto', variant: 'open' },
  collecting: { icon: Loader2, color: 'text-pxg-accent-gold', label: 'Em Coleta', variant: 'collecting' },
  ready: { icon: CheckCircle, color: 'text-pxg-accent-neonGreen', label: 'Pronto p/ Entrega', variant: 'ready' },
  completed: { icon: XCircle, color: 'text-pxg-text-muted', label: 'Concluído', variant: 'completed' },
};

export function Items() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'collect' | 'deliver' | 'complete' | 'cancel'
  const [actionNotes, setActionNotes] = useState('');
  const [newRequestModalOpen, setNewRequestModalOpen] = useState(false);
  const [newRequestForm, setNewRequestForm] = useState({
    targetId: '',
    itemName: '',
    itemCategory: 'hunt-loot',
    quantity: 1,
    purpose: '',
    huntSource: '',
    professionRequired: '',
    minProfessionLevel: 0,
    notes: '',
  });

  const filteredRequests = useMemo(() => {
    let requests = statusFilter === 'all' ? itemRequests : getItemRequestsByStatus(statusFilter);
    if (searchQuery) {
      requests = requests.filter(r =>
        r.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.purpose.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [statusFilter, searchQuery]);

  const stats = {
    open: itemRequests.filter(r => r.status === 'open').length,
    collecting: itemRequests.filter(r => r.status === 'collecting').length,
    ready: itemRequests.filter(r => r.status === 'ready').length,
    completed: itemRequests.filter(r => r.status === 'completed').length,
  };

  const handleStatusAction = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setActionModalOpen(true);
    setActionNotes('');
  };

  const handleConfirmAction = () => {
    console.log('Action:', actionType, 'Request:', selectedRequest, 'Notes:', actionNotes);
    setActionModalOpen(false);
    setSelectedRequest(null);
  };

  const handleNewRequestSubmit = () => {
    console.log('New request:', newRequestForm);
    setNewRequestModalOpen(false);
    setNewRequestForm({
      targetId: '',
      itemName: '',
      itemCategory: 'hunt-loot',
      quantity: 1,
      purpose: '',
      huntSource: '',
      professionRequired: '',
      minProfessionLevel: 0,
      notes: '',
    });
  };

  const getNextStatus = (currentStatus) => {
    const flow = ['open', 'collecting', 'ready', 'completed'];
    const currentIndex = flow.indexOf(currentStatus);
    return currentIndex < flow.length - 1 ? flow[currentIndex + 1] : currentStatus;
  };

  const getActionLabel = (action) => {
    const labels = {
      collect: 'Iniciar Coleta',
      deliver: 'Marcar como Pronto',
      complete: 'Confirmar Entrega',
      cancel: 'Cancelar Pedido',
    };
    return labels[action] || action;
  };

  return (
    <div className="min-h-screen">
      <Section
        title="🛒 Requisição de Itens de Hunt"
        description="Loot & Supply Pipeline - Organize coletas e entregas de itens entre membros"
        action={
          <Button asChild>
            <Link to="/items/new">
              <Plus className="w-4 h-4 mr-1" />
              Novo Pedido
            </Link>
          </Button>
        }
      >
        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="font-display font-bold text-display-lg text-pxg-accent-cyan">{stats.open}</p>
              <p className="text-caption text-pxg-text-muted">Abertos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="font-display font-bold text-display-lg text-pxg-accent-gold">{stats.collecting}</p>
              <p className="text-caption text-pxg-text-muted">Em Coleta</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="font-display font-bold text-display-lg text-pxg-accent-neonGreen">{stats.ready}</p>
              <p className="text-caption text-pxg-text-muted">Prontos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="font-display font-bold text-display-lg text-pxg-text-muted">{stats.completed}</p>
              <p className="text-caption text-pxg-text-muted">Concluídos</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pxg-text-muted" />
            <Input
              placeholder="Buscar item, solicitante, alvo, propósito..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dropdown
            trigger={
              <Button variant="secondary">
                <ChevronDown className="w-4 h-4" />
                Status: {statusFilter === 'all' ? 'Todos' : statusConfig[statusFilter]?.label}
              </Button>
            }
            items={[
              { key: 'all', label: 'Todos' },
              { key: 'open', label: 'Abertos' },
              { key: 'collecting', label: 'Em Coleta' },
              { key: 'ready', label: 'Prontos' },
              { key: 'completed', label: 'Concluídos' },
            ].map(i => ({
              key: i.key,
              label: i.label,
              onClick: () => setStatusFilter(i.key)
            }))}
          />
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'table' ? 'primary' : 'secondary'} onClick={() => setViewMode('table')}>
              Tabela
            </Button>
            <Button variant={viewMode === 'cards' ? 'primary' : 'secondary'} onClick={() => setViewMode('cards')}>
              Cards
            </Button>
          </div>
        </div>

        {/* Requests List */}
        {viewMode === 'table' ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Alvo (Coletor)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-pxg-text-primary">{request.itemName}</p>
                          <p className="text-caption text-pxg-text-muted truncate max-w-xs">{request.purpose}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="text-[10px] px-2 py-1">
                          {itemCategories.find(c => c.id === request.itemCategory)?.name || request.itemCategory}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-pxg-text-primary">{request.collectedQuantity}/{request.quantity}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar name={request.requesterName} size="xs" clanType={getMemberById(request.requesterId)?.clanType} />
                          <span className="text-body-sm font-medium text-pxg-text-primary">{request.requesterName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar name={request.targetName} size="xs" clanType={getMemberById(request.targetId)?.clanType} />
                          <span className="text-body-sm font-medium text-pxg-text-primary">{request.targetName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[request.status]?.variant || 'default'}>
                          {statusConfig[request.status]?.label || request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="progress-bar h-1.5">
                            <div
                              className="progress-fill"
                              style={{ width: `${(request.collectedQuantity / request.quantity) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          }
                          items={[
                            request.status === 'open' && { key: 'collect', label: 'Iniciar Coleta', icon: Loader2, onClick: () => handleStatusAction(request, 'collect') },
                            request.status === 'collecting' && { key: 'deliver', label: 'Marcar como Pronto', icon: CheckCircle, onClick: () => handleStatusAction(request, 'deliver') },
                            request.status === 'ready' && { key: 'complete', label: 'Confirmar Entrega', icon: Package, onClick: () => handleStatusAction(request, 'complete') },
                            request.status !== 'completed' && { key: 'cancel', label: 'Cancelar', icon: XCircle, danger: true, onClick: () => handleStatusAction(request, 'cancel') },
                          ].filter(Boolean).map(i => ({
                            key: i.key,
                            label: i.label,
                            icon: i.icon,
                            danger: i.danger,
                            onClick: () => i.onClick()
                          }))}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Grid columns={1} sm={2} lg={3}>
            {filteredRequests.map((request) => (
              <Card key={request.id} hover>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-body text-pxg-text-primary truncate">{request.itemName}</h3>
                      <p className="text-caption text-pxg-text-secondary">{request.purpose}</p>
                    </div>
                    <Badge variant={statusConfig[request.status]?.variant || 'default'}>
                      {statusConfig[request.status]?.label || request.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-body-sm mb-4">
                    <div className="flex items-center gap-2 text-pxg-text-secondary">
                      <span className="font-medium text-pxg-text-primary">{request.collectedQuantity}/{request.quantity}</span>
                      <span>unidades</span>
                    </div>
                    <div className="flex items-center gap-2 text-pxg-text-secondary">
                      <ShoppingCart className="w-4 h-4" />
                      <span>{itemCategories.find(c => c.id === request.itemCategory)?.name || request.itemCategory}</span>
                    </div>
                    <div className="flex items-center gap-2 text-pxg-text-secondary">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{request.huntSource}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-caption text-pxg-text-muted">Progresso</span>
                      <span className="text-caption font-mono text-pxg-text-primary">
                        {Math.round((request.collectedQuantity / request.quantity) * 100)}%
                      </span>
                    </div>
                    <div className="progress-bar h-2">
                      <div
                        className="progress-fill"
                        style={{ width: `${(request.collectedQuantity / request.quantity) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="flex items-center gap-3 mb-4 pt-3 border-t border-pxg-border-subtle/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-caption text-pxg-text-muted">Solicitante</p>
                      <div className="flex items-center gap-2">
                        <Avatar name={request.requesterName} size="sm" clanType={getMemberById(request.requesterId)?.clanType} />
                        <span className="font-medium text-pxg-text-primary">{request.requesterName}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <ArrowRight className="w-4 h-4 text-pxg-text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-caption text-pxg-text-muted">Coletor</p>
                      <div className="flex items-center gap-2">
                        <Avatar name={request.targetName} size="sm" clanType={getMemberById(request.targetId)?.clanType} />
                        <span className="font-medium text-pxg-text-primary">{request.targetName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {request.status === 'open' && (
                      <Button size="sm" onClick={() => handleStatusAction(request, 'collect')}>
                        <Loader2 className="w-3 h-3 mr-1" />
                        Iniciar Coleta
                      </Button>
                    )}
                    {request.status === 'collecting' && (
                      <Button variant="secondary" size="sm" onClick={() => handleStatusAction(request, 'deliver')}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Pronto
                      </Button>
                    )}
                    {request.status === 'ready' && (
                      <Button size="sm" onClick={() => handleStatusAction(request, 'complete')}>
                        <Package className="w-3 h-3 mr-1" />
                        Entregar
                      </Button>
                    )}
                    {request.status !== 'completed' && (
                      <Button variant="ghost" size="sm" onClick={() => handleStatusAction(request, 'cancel')}>
                        <XCircle className="w-3 h-3 mr-1" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredRequests.length === 0 && (
              <div className="col-span-full text-center py-12">
                <ShoppingCart className="w-12 h-12 mx-auto text-pxg-text-muted mb-4" />
                <p className="text-pxg-text-secondary">Nenhum pedido encontrado</p>
              </div>
            )}
          </Grid>
        )}

        {/* Action Modal */}
        <Modal
          isOpen={actionModalOpen}
          onClose={() => setActionModalOpen(false)}
          title={getActionLabel(actionType)}
          description={selectedRequest ? `Pedido: ${selectedRequest.itemName} (${selectedRequest.collectedQuantity}/${selectedRequest.quantity})` : ''}
          size="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-pxg-bg-tertiary/30 rounded-lg">
              <p className="text-body-sm text-pxg-text-secondary">
                <strong>Solicitante:</strong> {selectedRequest?.requesterName}<br />
                <strong>Coletor:</strong> {selectedRequest?.targetName}<br />
                <strong>Item:</strong> {selectedRequest?.itemName}<br />
                <strong>Quantidade:</strong> {selectedRequest?.collectedQuantity}/{selectedRequest?.quantity}
              </p>
            </div>
            <Textarea
              label="Observações (opcional)"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="Adicione notas sobre a coleta/entrega..."
              rows={3}
            />
          </div>
          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setActionModalOpen(false)}>Cancelar</Button>
            <Button variant={actionType === 'cancel' ? 'danger' : 'primary'} onClick={handleConfirmAction}>
              {getActionLabel(actionType)}
            </Button>
          </div>
        </Modal>

        {/* New Request Modal */}
        <Modal
          isOpen={newRequestModalOpen}
          onClose={() => setNewRequestModalOpen(false)}
          title="Novo Pedido de Item"
          description="Crie uma requisição de item para a hunt"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Coletor Alvo *"
                value={newRequestForm.targetId}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, targetId: e.target.value })}
                options={members.map(m => ({ value: m.id, label: `${m.characterName} (Lv.${m.level})` }))}
                placeholder="Selecione quem vai coletar"
              />
              <Select
                label="Categoria *"
                value={newRequestForm.itemCategory}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, itemCategory: e.target.value })}
                options={itemCategories.map(c => ({ value: c.id, label: c.name }))}
                placeholder="Categoria do item"
              />
            </div>
            <Input
              label="Nome do Item *"
              value={newRequestForm.itemName}
              onChange={(e) => setNewRequestForm({ ...newRequestForm, itemName: e.target.value })}
              placeholder="Ex: Dark Orbs, Fire Stones, Food Bags..."
            />
            <div className="grid sm:grid-cols-3 gap-4">
              <Input
                label="Quantidade *"
                type="number"
                value={newRequestForm.quantity}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, quantity: parseInt(e.target.value) || 1 })}
                min={1}
              />
              <Select
                label="Profissão Necessária"
                value={newRequestForm.professionRequired}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, professionRequired: e.target.value })}
                options={[
                  { value: '', label: 'Nenhuma' },
                  { value: 'engineer', label: 'Engenheiro' },
                  { value: 'professor', label: 'Professor' },
                  { value: 'stylist', label: 'Estilista' },
                  { value: 'adventurer', label: 'Aventureiro' },
                ]}
                placeholder="Profissão"
              />
              <Input
                label="Level Mín. Profissão"
                type="number"
                value={newRequestForm.minProfessionLevel}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, minProfessionLevel: parseInt(e.target.value) || 0 })}
                min={0}
                max={100}
              />
            </div>
            <Input
              label="Origem (Hunt/Fonte)"
              value={newRequestForm.huntSource}
              onChange={(e) => setNewRequestForm({ ...newRequestForm, huntSource: e.target.value })}
              placeholder="Ex: Roshamuul, Ferumbras Tower, Boss Drop, Craft..."
            />
            <Textarea
              label="Finalidade *"
              value={newRequestForm.purpose}
              onChange={(e) => setNewRequestForm({ ...newRequestForm, purpose: e.target.value })}
              placeholder="Ex: Craft Stylist - Dark Set, Evolução Charizard, Addon Druid..."
              rows={2}
            />
            <Textarea
              label="Observações"
              value={newRequestForm.notes}
              onChange={(e) => setNewRequestForm({ ...newRequestForm, notes: e.target.value })}
              placeholder="Detalhes adicionais..."
              rows={2}
            />
          </div>
          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setNewRequestModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleNewRequestSubmit}>
              <Send className="w-4 h-4 mr-1" />
              Criar Pedido
            </Button>
          </div>
        </Modal>
      </Section>
    </div>
  );
}