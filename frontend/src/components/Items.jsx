import React from 'react';
import { AlertTriangle, Plus, Trash2, Edit } from 'lucide-react';

export default function Items() {
  return (
    <div style={{ padding: '20px', color: '#fff' }}>
      <h2>Gerenciamento de Itens</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#333', padding: '15px', borderRadius: '8px' }}>
        <AlertTriangle size={24} color="#facc15" />
        <span>Sistema carregado com sucesso! O componente de itens está pronto.</span>
      </div>
    </div>
  );
}