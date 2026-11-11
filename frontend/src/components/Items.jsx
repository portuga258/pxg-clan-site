import React from 'react';
import { AlertTriangle, Plus, Trash2, Edit } from 'lucide-react';

export default function Items() {
  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <h2>Gerenciamento de Itens do Clan</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#222', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
        <AlertTriangle size={24} color="#facc15" />
        <span>Componente de itens carregado com sucesso!</span>
      </div>
    </div>
  );
}