import React, { useState } from 'react';
import { AlertTriangle, Plus, Trash2, Edit, Search } from 'lucide-react';

export default function Items() {
  const [items, setItems] = useState([
    { id: 1, name: 'Exemplo de Item PXG', category: 'Equipamento', quantity: 10 }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div style={{ padding: '20px', color: '#fff', backgroundColor: '#1a1a1a', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Gerenciamento de Itens do Clan</h2>
        <button style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Adicionar Item
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#222', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #333' }}>
        <AlertTriangle size={24} color="#facc15" />
        <span>Componente de itens carregado com sucesso e pronto para uso!</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#2a2a2a', padding: '10px 15px', borderRadius: '6px', marginBottom: '20px' }}>
        <Search size={18} color="#888" />
        <input 
          type="text" 
          placeholder="Pesquisar itens..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%' }}
        />
      </div>

      <div style={{ background: '#222', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#2a2a2a', borderBottom: '1px solid #333' }}>
              <th style={{ padding: '12px' }}>Nome</th>
              <th style={{ padding: '12px' }}>Categoria</th>
              <th style={{ padding: '12px' }}>Quantidade</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '12px' }}>{item.name}</td>
                <td style={{ padding: '12px' }}>{item.category}</td>
                <td style={{ padding: '12px' }}>{item.quantity}</td>
                <td style={{ padding: '12px', textAlign: 'right', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer' }}><Edit size={18} /></button>
                  <button style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}