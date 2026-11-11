import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home, Members, MemberDetail, Loans, Items } from './pages';

function App() {
  const user = {
    characterName: 'Portugap',
    clanType: 'malefic',
    level: 487,
    activityStatus: 'online',
    badges: ['leader'],
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout user={user} onLogout={() => {}} />}>
          <Route path="/" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/:id" element={<MemberDetail />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/items" element={<Items />} />
          <Route path="/items/new" element={<Items />} />
          <Route path="/items/request" element={<Items />} />
          <Route path="/loans/request" element={<Loans />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;