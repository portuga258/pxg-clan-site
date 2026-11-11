import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '../components/ui';
import { clanInfo } from '../data/mockData';

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

export function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    character_name: '',
    level: 1,
    vocation: '',
    clan_type: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        await register({ ...form, level: Number(form.level) });
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-pxg py-12">
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle className="text-display-md">
            {isRegister ? 'Criar conta' : 'Entrar'}
          </CardTitle>
          <p className="text-body-sm text-pxg-text-secondary">
            {clanInfo.name} · A conta cria um perfil de personagem para você.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <Input
                  label="Nome do personagem PXG *"
                  value={form.character_name}
                  onChange={(event) => setForm({ ...form, character_name: event.target.value })}
                  minLength={2}
                  maxLength={32}
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Level"
                    type="number"
                    min={1}
                    max={10000}
                    value={form.level}
                    onChange={(event) => setForm({ ...form, level: event.target.value })}
                    required
                  />
                  <Input
                    label="Vocação"
                    value={form.vocation}
                    onChange={(event) => setForm({ ...form, vocation: event.target.value })}
                    maxLength={60}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="clan-type">Clã do personagem</label>
                  <select
                    className="input"
                    id="clan-type"
                    value={form.clan_type}
                    onChange={(event) => setForm({ ...form, clan_type: event.target.value })}
                  >
                    <option value="">Não informado</option>
                    {clanOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <Input
              label="E-mail *"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
            <Input
              label="Senha *"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={isRegister ? 10 : undefined}
              helperText={isRegister ? 'Use pelo menos 10 caracteres.' : undefined}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
            {isRegister && (
              <p className="text-caption text-pxg-text-muted">
                O perfil informado não é verificado automaticamente dentro do jogo.
              </p>
            )}
            {error && <p className="text-body-sm text-pxg-accent-neonRed" role="alert">{error}</p>}
            <Button className="w-full" type="submit" disabled={submitting}>
              {submitting ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}
            </Button>
          </form>
          <p className="mt-5 text-center text-body-sm text-pxg-text-secondary">
            {isRegister ? 'Já tem conta? ' : 'Ainda não tem conta? '}
            <Link className="text-pxg-accent-cyan hover:underline" to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Entrar' : 'Criar conta'}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
