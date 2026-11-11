import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home, Members, MemberDetail, Loans, Items } from './pages';
import { AuthPage } from './pages/Auth';
import { AuthProvider, useAuth } from './lib/AuthContext';

function AppRoutes() {
  const { user, logout } = useAuth();
  const navUser = user
    ? {
        characterName: user.character?.name || user.username,
        characterId: user.character?.id,
        clanType: user.character?.clan_type,
        level: user.character?.level,
        activityStatus: user.character?.activity_status || 'offline',
        characters: user.characters || [],
      }
    : null;

  return (
    <Routes>
      <Route element={<Layout user={navUser} onLogout={logout} />}>
        <Route path="/" element={<Home />} />
        <Route path="/members" element={<Members />} />
        <Route path="/members/:id" element={<MemberDetail />} />
        <Route path="/loans" element={<Loans />} />
        <Route path="/loans/add" element={<Loans />} />
        <Route path="/loans/request" element={<Loans />} />
        <Route path="/requests" element={<Items />} />
        <Route path="/items" element={<Items />} />
        <Route path="/items/new" element={<Items />} />
        <Route path="/items/request" element={<Items />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;