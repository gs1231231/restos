'use client';

import { useState } from 'react';

type Segment = 'VIP' | 'REGULAR' | 'NEW';

interface LoyaltyTx { date: string; type: 'EARNED' | 'REDEEMED'; points: number; ref: string; }
interface OrderHistory { id: string; date: string; items: number; total: number; }
interface Customer {
  id: string; name: string; phone: string; email: string;
  totalOrders: number; totalSpend: number; loyaltyPoints: number;
  lastVisit: string; segment: Segment; birthday: string; anniversary: string;
  orders: OrderHistory[]; loyaltyTxns: LoyaltyTx[];
}

const SEGMENT_COLORS: Record<Segment, { bg: string; text: string }> = {
  VIP: { bg: '#fef3c7', text: '#92400e' },
  REGULAR: { bg: '#dbeafe', text: '#1e40af' },
  NEW: { bg: '#d1fae5', text: '#065f46' },
};

const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'C001', name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@email.com', totalOrders: 47, totalSpend: 28500, loyaltyPoints: 1420, lastVisit: '2026-04-09', segment: 'VIP', birthday: '15-Mar', anniversary: '22-Nov',
    orders: [{ id: 'ORD-201', date: '2026-04-09', items: 4, total: 1250 }, { id: 'ORD-185', date: '2026-04-05', items: 3, total: 890 }, { id: 'ORD-170', date: '2026-03-28', items: 5, total: 1650 }],
    loyaltyTxns: [{ date: '2026-04-09', type: 'EARNED', points: 125, ref: 'ORD-201' }, { date: '2026-04-05', type: 'EARNED', points: 89, ref: 'ORD-185' }, { date: '2026-03-20', type: 'REDEEMED', points: 500, ref: 'Discount' }] },
  { id: 'C002', name: 'Priya Patel', phone: '9823456789', email: 'priya.p@email.com', totalOrders: 32, totalSpend: 19200, loyaltyPoints: 960, lastVisit: '2026-04-08', segment: 'VIP', birthday: '08-Jul', anniversary: '',
    orders: [{ id: 'ORD-198', date: '2026-04-08', items: 2, total: 780 }], loyaltyTxns: [{ date: '2026-04-08', type: 'EARNED', points: 78, ref: 'ORD-198' }] },
  { id: 'C003', name: 'Amit Verma', phone: '9812345670', email: 'amit.v@email.com', totalOrders: 15, totalSpend: 8900, loyaltyPoints: 445, lastVisit: '2026-04-06', segment: 'REGULAR', birthday: '20-Jan', anniversary: '14-Feb',
    orders: [{ id: 'ORD-190', date: '2026-04-06', items: 6, total: 2100 }], loyaltyTxns: [{ date: '2026-04-06', type: 'EARNED', points: 210, ref: 'ORD-190' }] },
  { id: 'C004', name: 'Sneha Gupta', phone: '9898765432', email: 'sneha@email.com', totalOrders: 8, totalSpend: 4200, loyaltyPoints: 210, lastVisit: '2026-04-03', segment: 'REGULAR', birthday: '12-Sep', anniversary: '',
    orders: [{ id: 'ORD-178', date: '2026-04-03', items: 3, total: 650 }], loyaltyTxns: [{ date: '2026-04-03', type: 'EARNED', points: 65, ref: 'ORD-178' }] },
  { id: 'C005', name: 'Vikram Singh', phone: '9845671234', email: 'vikram.s@email.com', totalOrders: 3, totalSpend: 1850, loyaltyPoints: 92, lastVisit: '2026-04-01', segment: 'NEW', birthday: '05-Dec', anniversary: '30-Apr',
    orders: [{ id: 'ORD-165', date: '2026-04-01', items: 8, total: 1850 }], loyaltyTxns: [{ date: '2026-04-01', type: 'EARNED', points: 92, ref: 'ORD-165' }] },
  { id: 'C006', name: 'Kavita Reddy', phone: '9867890123', email: 'kavita@email.com', totalOrders: 22, totalSpend: 13400, loyaltyPoints: 670, lastVisit: '2026-04-07', segment: 'VIP', birthday: '18-May', anniversary: '25-Dec',
    orders: [{ id: 'ORD-195', date: '2026-04-07', items: 2, total: 520 }], loyaltyTxns: [{ date: '2026-04-07', type: 'EARNED', points: 52, ref: 'ORD-195' }] },
  { id: 'C007', name: 'Deepak Joshi', phone: '9834567890', email: 'deepak.j@email.com', totalOrders: 11, totalSpend: 6700, loyaltyPoints: 335, lastVisit: '2026-04-04', segment: 'REGULAR', birthday: '28-Aug', anniversary: '',
    orders: [{ id: 'ORD-180', date: '2026-04-04', items: 4, total: 1100 }], loyaltyTxns: [{ date: '2026-04-04', type: 'EARNED', points: 110, ref: 'ORD-180' }] },
  { id: 'C008', name: 'Nisha Kapoor', phone: '9811223344', email: 'nisha.k@email.com', totalOrders: 2, totalSpend: 1200, loyaltyPoints: 60, lastVisit: '2026-03-30', segment: 'NEW', birthday: '01-Nov', anniversary: '',
    orders: [{ id: 'ORD-155', date: '2026-03-30', items: 2, total: 600 }], loyaltyTxns: [{ date: '2026-03-30', type: 'EARNED', points: 60, ref: 'ORD-155' }] },
  { id: 'C009', name: 'Suresh Menon', phone: '9877654321', email: 'suresh.m@email.com', totalOrders: 19, totalSpend: 11500, loyaltyPoints: 575, lastVisit: '2026-04-09', segment: 'REGULAR', birthday: '14-Apr', anniversary: '10-Jun',
    orders: [{ id: 'ORD-200', date: '2026-04-09', items: 3, total: 920 }], loyaltyTxns: [{ date: '2026-04-09', type: 'EARNED', points: 92, ref: 'ORD-200' }] },
  { id: 'C010', name: 'Anjali Nair', phone: '9866543210', email: 'anjali@email.com', totalOrders: 1, totalSpend: 450, loyaltyPoints: 22, lastVisit: '2026-04-10', segment: 'NEW', birthday: '22-Feb', anniversary: '',
    orders: [{ id: 'ORD-205', date: '2026-04-10', items: 1, total: 450 }], loyaltyTxns: [{ date: '2026-04-10', type: 'EARNED', points: 22, ref: 'ORD-205' }] },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<Segment | 'ALL'>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', phone: '', email: '', birthday: '', anniversary: '' });

  const filtered = customers.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchSeg = segmentFilter === 'ALL' || c.segment === segmentFilter;
    return matchSearch && matchSeg;
  });

  const selected = customers.find(c => c.id === selectedId);
  const totalSpend = customers.reduce((s, c) => s + c.totalSpend, 0);
  const totalLoyalty = customers.reduce((s, c) => s + c.loyaltyPoints, 0);

  const kpis = [
    { label: 'Total Customers', value: customers.length.toString(), color: '#6366f1' },
    { label: 'VIP Customers', value: customers.filter(c => c.segment === 'VIP').length.toString(), color: '#f59e0b' },
    { label: 'Avg Spend', value: `₹${Math.round(totalSpend / customers.length).toLocaleString()}`, color: '#10b981' },
    { label: 'Loyalty Pts Issued', value: totalLoyalty.toLocaleString(), color: '#ec4899' },
  ];

  const handleAddCustomer = () => {
    const newC: Customer = {
      id: 'C' + String(customers.length + 1).padStart(3, '0'),
      name: addForm.name, phone: addForm.phone, email: addForm.email,
      totalOrders: 0, totalSpend: 0, loyaltyPoints: 0,
      lastVisit: '-', segment: 'NEW', birthday: addForm.birthday, anniversary: addForm.anniversary,
      orders: [], loyaltyTxns: [],
    };
    setCustomers(prev => [...prev, newC]);
    setShowAddModal(false);
    setAddForm({ name: '', phone: '', email: '', birthday: '', anniversary: '' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Customers</h1>
        <button onClick={() => setShowAddModal(true)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          + Add Customer
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

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: '8px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14 }} />
        {(['ALL', 'VIP', 'REGULAR', 'NEW'] as const).map(seg => (
          <button key={seg} onClick={() => setSegmentFilter(seg)} style={{
            padding: '6px 14px', borderRadius: 20, border: segmentFilter === seg ? '2px solid #6366f1' : '1px solid #e2e8f0',
            background: segmentFilter === seg ? '#eef2ff' : '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600,
            color: segmentFilter === seg ? '#6366f1' : '#64748b',
          }}>{seg}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Customer Table */}
        <div style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Name', 'Phone', 'Orders', 'Spend', 'Points', 'Last Visit', 'Segment'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', borderBottom: '1px solid #e2e8f0', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const sc = SEGMENT_COLORS[c.segment];
                  return (
                    <tr key={c.id} onClick={() => setSelectedId(c.id)} style={{ cursor: 'pointer', background: selectedId === c.id ? '#f0f4ff' : 'transparent' }}>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#1e293b' }}>{c.name}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{c.phone}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{c.totalOrders}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>₹{c.totalSpend.toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{c.loyaltyPoints}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{c.lastVisit}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: sc.bg, color: sc.text }}>{c.segment}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ width: 340, flexShrink: 0, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#1e293b' }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{selected.phone}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{selected.email}</div>
              </div>
              <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#94a3b8' }}>x</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#6366f1' }}>{selected.totalOrders}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Orders</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>₹{selected.totalSpend.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Spend</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>{selected.loyaltyPoints}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Points</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                {(() => { const sc = SEGMENT_COLORS[selected.segment]; return <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.text }}>{selected.segment}</span>; })()}
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Segment</div>
              </div>
            </div>

            {/* Special Dates */}
            {(selected.birthday || selected.anniversary) && (
              <div style={{ marginBottom: 16, padding: 10, background: '#fffbeb', borderRadius: 8, fontSize: 12 }}>
                {selected.birthday && <div style={{ color: '#92400e' }}>Birthday: <strong>{selected.birthday}</strong></div>}
                {selected.anniversary && <div style={{ color: '#92400e' }}>Anniversary: <strong>{selected.anniversary}</strong></div>}
              </div>
            )}

            {/* Order History */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Recent Orders</div>
              {selected.orders.map(o => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                  <div><span style={{ fontWeight: 600 }}>{o.id}</span> <span style={{ color: '#94a3b8' }}>{o.date}</span></div>
                  <div style={{ fontWeight: 600 }}>₹{o.total}</div>
                </div>
              ))}
            </div>

            {/* Loyalty Transactions */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Loyalty History</div>
              {selected.loyaltyTxns.map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                  <div><span style={{ color: '#94a3b8' }}>{t.date}</span> <span style={{ color: '#64748b' }}>{t.ref}</span></div>
                  <div style={{ fontWeight: 600, color: t.type === 'EARNED' ? '#10b981' : '#ef4444' }}>
                    {t.type === 'EARNED' ? '+' : '-'}{t.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Add Customer</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>x</button>
            </div>
            {[
              { label: 'Name', key: 'name' },
              { label: 'Phone', key: 'phone' },
              { label: 'Email', key: 'email' },
              { label: 'Birthday (e.g. 15-Mar)', key: 'birthday' },
              { label: 'Anniversary (e.g. 22-Nov)', key: 'anniversary' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input value={addForm[f.key as keyof typeof addForm]} onChange={e => setAddForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
            <button onClick={handleAddCustomer} disabled={!addForm.name || !addForm.phone} style={{
              width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
              background: !addForm.name || !addForm.phone ? '#cbd5e1' : '#6366f1',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: !addForm.name || !addForm.phone ? 'not-allowed' : 'pointer',
            }}>Add Customer</button>
          </div>
        </div>
      )}
    </div>
  );
}
