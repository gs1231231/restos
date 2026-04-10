'use client';

import { useState } from 'react';

type InvTab = 'stock' | 'lowStock' | 'purchaseOrders' | 'suppliers';
type AdjType = 'IN' | 'OUT' | 'WASTE';
type POStatus = 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

interface InvItem {
  id: string; name: string; category: string; currentStock: number; minStock: number;
  unit: string; costPerUnit: number;
}

interface PurchaseOrder {
  id: string; supplier: string; items: number; total: number; date: string; status: POStatus;
}

interface Supplier {
  id: string; name: string; phone: string; email: string; category: string; lastOrder: string;
}

const PO_COLORS: Record<POStatus, { bg: string; text: string }> = {
  DRAFT: { bg: '#f1f5f9', text: '#475569' },
  ORDERED: { bg: '#dbeafe', text: '#1e40af' },
  RECEIVED: { bg: '#d1fae5', text: '#065f46' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b' },
};

const INITIAL_ITEMS: InvItem[] = [
  { id: 'INV01', name: 'Basmati Rice', category: 'Grains', currentStock: 45, minStock: 20, unit: 'kg', costPerUnit: 85 },
  { id: 'INV02', name: 'Cooking Oil (Sunflower)', category: 'Oils', currentStock: 8, minStock: 10, unit: 'L', costPerUnit: 150 },
  { id: 'INV03', name: 'Onion', category: 'Vegetables', currentStock: 30, minStock: 15, unit: 'kg', costPerUnit: 35 },
  { id: 'INV04', name: 'Tomato', category: 'Vegetables', currentStock: 12, minStock: 15, unit: 'kg', costPerUnit: 40 },
  { id: 'INV05', name: 'Chicken (Whole)', category: 'Meat', currentStock: 25, minStock: 10, unit: 'kg', costPerUnit: 220 },
  { id: 'INV06', name: 'Paneer', category: 'Dairy', currentStock: 5, minStock: 8, unit: 'kg', costPerUnit: 320 },
  { id: 'INV07', name: 'Ginger', category: 'Spices', currentStock: 3, minStock: 5, unit: 'kg', costPerUnit: 180 },
  { id: 'INV08', name: 'Garlic', category: 'Spices', currentStock: 4, minStock: 5, unit: 'kg', costPerUnit: 160 },
  { id: 'INV09', name: 'Cumin Seeds', category: 'Spices', currentStock: 2, minStock: 3, unit: 'kg', costPerUnit: 450 },
  { id: 'INV10', name: 'Turmeric Powder', category: 'Spices', currentStock: 3, minStock: 2, unit: 'kg', costPerUnit: 280 },
  { id: 'INV11', name: 'Cream (Fresh)', category: 'Dairy', currentStock: 6, minStock: 5, unit: 'L', costPerUnit: 240 },
  { id: 'INV12', name: 'Butter', category: 'Dairy', currentStock: 4, minStock: 5, unit: 'kg', costPerUnit: 480 },
  { id: 'INV13', name: 'Wheat Flour (Atta)', category: 'Grains', currentStock: 35, minStock: 20, unit: 'kg', costPerUnit: 45 },
  { id: 'INV14', name: 'Green Chilli', category: 'Vegetables', currentStock: 2, minStock: 3, unit: 'kg', costPerUnit: 60 },
  { id: 'INV15', name: 'Coriander Leaves', category: 'Vegetables', currentStock: 1, minStock: 2, unit: 'kg', costPerUnit: 100 },
];

const INITIAL_POS: PurchaseOrder[] = [
  { id: 'PO-001', supplier: 'Fresh Farms Ltd', items: 5, total: 12500, date: '2026-04-09', status: 'ORDERED' },
  { id: 'PO-002', supplier: 'Spice World', items: 3, total: 4800, date: '2026-04-08', status: 'RECEIVED' },
  { id: 'PO-003', supplier: 'Metro Wholesale', items: 8, total: 22000, date: '2026-04-07', status: 'RECEIVED' },
  { id: 'PO-004', supplier: 'Dairy Fresh Co', items: 4, total: 8400, date: '2026-04-10', status: 'DRAFT' },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 'SUP01', name: 'Fresh Farms Ltd', phone: '9876001234', email: 'orders@freshfarms.in', category: 'Vegetables & Fruits', lastOrder: '2026-04-09' },
  { id: 'SUP02', name: 'Spice World', phone: '9876005678', email: 'sales@spiceworld.in', category: 'Spices & Condiments', lastOrder: '2026-04-08' },
  { id: 'SUP03', name: 'Metro Wholesale', phone: '9876009012', email: 'bulk@metro.in', category: 'Grains & General', lastOrder: '2026-04-07' },
  { id: 'SUP04', name: 'Dairy Fresh Co', phone: '9876003456', email: 'supply@dairyfresh.in', category: 'Dairy Products', lastOrder: '2026-04-06' },
  { id: 'SUP05', name: 'Al-Kabir Meats', phone: '9876007890', email: 'orders@alkabir.in', category: 'Meat & Poultry', lastOrder: '2026-04-05' },
];

export default function InventoryPage() {
  const [items, setItems] = useState<InvItem[]>(INITIAL_ITEMS);
  const [pos] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [activeTab, setActiveTab] = useState<InvTab>('stock');
  const [showAdjModal, setShowAdjModal] = useState(false);
  const [adjForm, setAdjForm] = useState({ itemId: '', type: 'IN' as AdjType, qty: '', reference: '' });

  const lowStockItems = items.filter(i => i.currentStock < i.minStock);
  const totalValue = items.reduce((s, i) => s + i.currentStock * i.costPerUnit, 0);

  const kpis = [
    { label: 'Total Items', value: items.length.toString(), color: '#6366f1' },
    { label: 'Low Stock Alerts', value: lowStockItems.length.toString(), color: '#ef4444' },
    { label: "Today's Consumption", value: '₹3,450', color: '#f59e0b' },
    { label: 'Stock Value', value: `₹${totalValue.toLocaleString()}`, color: '#10b981' },
  ];

  const TABS: { key: InvTab; label: string }[] = [
    { key: 'stock', label: 'Stock' },
    { key: 'lowStock', label: `Low Stock (${lowStockItems.length})` },
    { key: 'purchaseOrders', label: 'Purchase Orders' },
    { key: 'suppliers', label: 'Suppliers' },
  ];

  const handleAdjust = () => {
    const qty = parseInt(adjForm.qty) || 0;
    if (!adjForm.itemId || qty <= 0) return;
    setItems(prev => prev.map(item => {
      if (item.id !== adjForm.itemId) return item;
      const delta = adjForm.type === 'IN' ? qty : -qty;
      return { ...item, currentStock: Math.max(0, item.currentStock + delta) };
    }));
    setShowAdjModal(false);
    setAdjForm({ itemId: '', type: 'IN', qty: '', reference: '' });
  };

  const renderStockBar = (current: number, min: number) => {
    const pct = Math.min(100, (current / (min * 3)) * 100);
    const isLow = current < min;
    return (
      <div style={{ width: 80, height: 8, borderRadius: 4, background: '#f1f5f9', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 4, background: isLow ? '#ef4444' : pct > 60 ? '#10b981' : '#f59e0b' }} />
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Inventory</h1>
        <button onClick={() => setShowAdjModal(true)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Stock Adjustment
        </button>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 20 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: activeTab === t.key ? '#fff' : 'transparent',
            color: activeTab === t.key ? '#1e293b' : '#64748b',
            boxShadow: activeTab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Stock Tab */}
      {activeTab === 'stock' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Item', 'Category', 'Stock', 'Min', 'Unit', 'Cost/Unit', 'Level'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const isLow = item.currentStock < item.minStock;
                  return (
                    <tr key={item.id} style={{ background: isLow ? '#fef2f2' : 'transparent' }}>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#1e293b' }}>{item.name}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>{item.category}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: isLow ? '#ef4444' : '#1e293b' }}>{item.currentStock}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#94a3b8' }}>{item.minStock}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>{item.unit}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>₹{item.costPerUnit}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>{renderStockBar(item.currentStock, item.minStock)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Low Stock Tab */}
      {activeTab === 'lowStock' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {lowStockItems.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>All items are adequately stocked.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#fef2f2' }}>
                    {['Item', 'Category', 'Current', 'Min Required', 'Deficit', 'Action'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#991b1b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #fecaca' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map(item => (
                    <tr key={item.id}>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#1e293b' }}>{item.name}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>{item.category}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#ef4444' }}>{item.currentStock} {item.unit}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{item.minStock} {item.unit}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#ef4444' }}>{item.minStock - item.currentStock} {item.unit}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                        <button style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#6366f1', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Create PO</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Purchase Orders Tab */}
      {activeTab === 'purchaseOrders' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['PO #', 'Supplier', 'Items', 'Total', 'Date', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pos.map(po => {
                const sc = PO_COLORS[po.status];
                return (
                  <tr key={po.id}>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#1e293b' }}>{po.id}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{po.supplier}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{po.items}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#1e293b' }}>₹{po.total.toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#64748b' }}>{po.date}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: sc.bg, color: sc.text }}>{po.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {INITIAL_SUPPLIERS.map(s => (
            <div key={s.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{s.name}</div>
              <div style={{ fontSize: 12, color: '#6366f1', marginBottom: 8 }}>{s.category}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Phone: {s.phone}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Email: {s.email}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>Last Order: {s.lastOrder}</div>
            </div>
          ))}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Stock Adjustment</h2>
              <button onClick={() => setShowAdjModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>x</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Item</label>
              <select value={adjForm.itemId} onChange={e => setAdjForm(prev => ({ ...prev, itemId: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box', background: '#fff' }}>
                <option value="">Select item...</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.name} ({i.currentStock} {i.unit})</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Type</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['IN', 'OUT', 'WASTE'] as AdjType[]).map(t => (
                  <button key={t} onClick={() => setAdjForm(prev => ({ ...prev, type: t }))} style={{
                    flex: 1, padding: '8px 0', borderRadius: 8, border: adjForm.type === t ? '2px solid #6366f1' : '1px solid #d1d5db',
                    background: adjForm.type === t ? '#eef2ff' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    color: adjForm.type === t ? '#6366f1' : '#64748b',
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Quantity</label>
              <input type="number" value={adjForm.qty} onChange={e => setAdjForm(prev => ({ ...prev, qty: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Reference / Note</label>
              <input value={adjForm.reference} onChange={e => setAdjForm(prev => ({ ...prev, reference: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleAdjust} disabled={!adjForm.itemId || !adjForm.qty} style={{
              width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
              background: !adjForm.itemId || !adjForm.qty ? '#cbd5e1' : '#6366f1',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: !adjForm.itemId || !adjForm.qty ? 'not-allowed' : 'pointer',
            }}>Apply Adjustment</button>
          </div>
        </div>
      )}
    </div>
  );
}
