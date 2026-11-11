import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home, Members, MemberDetail, Loans, Items } from './pages';

function App() {
  // Mock user - in real app this would come from auth context
  const user = {
    characterName: 'Portugap',
    clanType: 'malefic',
    level: 487,
    activityStatus: 'online',
    badges: ['leader'],
  };

  return (
    <BrowserRouter>
      <Layout user={user} onLogout={() => {}}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/:id" element={<MemberDetail />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/items" element={<Items />} />
          <Route path="/items/new" element={<Items />} />
          <Route path="/items/request" element={<Items />} />
          <Route path="/loans/request" element={<Loans />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;