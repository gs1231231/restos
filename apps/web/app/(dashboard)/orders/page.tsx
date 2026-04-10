'use client';

import { useState } from 'react';

/* ───── Types ───── */
type OrderStatus = 'NEW' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'SERVED';
type OrderType = 'Dine-In' | 'Takeaway' | 'Delivery' | 'Online';
type Platform = 'POS' | 'Zomato' | 'Swiggy' | 'ONDC';

interface OrderItem { name: string; qty: number; price: number; notes?: string }
interface Order {
  id: string; number: string; type: OrderType; platform: Platform;
  table?: string; status: OrderStatus; items: OrderItem[];
  total: number; captain: string; time: string; kotId: string;
  customer?: string;
}

/* ───── Sample Data ───── */
const SAMPLE_ORDERS: Order[] = [
  { id:'1', number:'#1001', type:'Dine-In', platform:'POS', table:'T-05', status:'NEW', items:[{name:'Butter Chicken',qty:2,price:380},{name:'Garlic Naan',qty:4,price:60},{name:'Dal Makhani',qty:1,price:280}], total:1300, captain:'Ravi', time:'2 min ago', kotId:'KOT-501', customer:'Walk-in' },
  { id:'2', number:'#1002', type:'Delivery', platform:'Zomato', status:'CONFIRMED', items:[{name:'Chicken Biryani',qty:2,price:350},{name:'Raita',qty:2,price:50}], total:800, captain:'System', time:'5 min ago', kotId:'KOT-502', customer:'Rahul S.' },
  { id:'3', number:'#1003', type:'Dine-In', platform:'POS', table:'T-12', status:'PREPARING', items:[{name:'Paneer Tikka',qty:1,price:320},{name:'Tandoori Roti',qty:6,price:40},{name:'Palak Paneer',qty:1,price:280},{name:'Jeera Rice',qty:1,price:180}], total:1020, captain:'Amit', time:'12 min ago', kotId:'KOT-503', customer:'Table 12' },
  { id:'4', number:'#1004', type:'Takeaway', platform:'POS', status:'READY', items:[{name:'Chole Bhature',qty:2,price:200},{name:'Lassi',qty:2,price:80}], total:560, captain:'Priya', time:'18 min ago', kotId:'KOT-504', customer:'Ankit M.' },
  { id:'5', number:'#1005', type:'Delivery', platform:'Swiggy', status:'PREPARING', items:[{name:'Mutton Rogan Josh',qty:1,price:450},{name:'Butter Naan',qty:3,price:60},{name:'Gulab Jamun',qty:2,price:60}], total:750, captain:'System', time:'8 min ago', kotId:'KOT-505', customer:'Neha P.' },
  { id:'6', number:'#1006', type:'Dine-In', platform:'POS', table:'T-03', status:'SERVED', items:[{name:'Fish Tikka',qty:1,price:380},{name:'Prawn Curry',qty:1,price:420},{name:'Steamed Rice',qty:2,price:150}], total:1100, captain:'Ravi', time:'35 min ago', kotId:'KOT-506', customer:'Table 3' },
  { id:'7', number:'#1007', type:'Online', platform:'ONDC', status:'NEW', items:[{name:'Veg Thali',qty:3,price:250}], total:750, captain:'System', time:'1 min ago', kotId:'KOT-507', customer:'Sita R.' },
  { id:'8', number:'#1008', type:'Dine-In', platform:'POS', table:'T-08', status:'CONFIRMED', items:[{name:'Chicken Tikka Masala',qty:1,price:360},{name:'Rumali Roti',qty:4,price:50},{name:'Raita',qty:1,price:50}], total:660, captain:'Amit', time:'6 min ago', kotId:'KOT-508', customer:'Table 8' },
  { id:'9', number:'#1009', type:'Takeaway', platform:'POS', status:'PREPARING', items:[{name:'Egg Biryani',qty:1,price:280},{name:'Mirchi Ka Salan',qty:1,price:120}], total:400, captain:'Priya', time:'10 min ago', kotId:'KOT-509', customer:'Vikram' },
  { id:'10', number:'#1010', type:'Delivery', platform:'Zomato', status:'READY', items:[{name:'Paneer Biryani',qty:1,price:300},{name:'Dal Tadka',qty:1,price:220},{name:'Naan',qty:2,price:50}], total:620, captain:'System', time:'20 min ago', kotId:'KOT-510', customer:'Meera K.' },
  { id:'11', number:'#1011', type:'Dine-In', platform:'POS', table:'T-15', status:'NEW', items:[{name:'Kadhai Chicken',qty:1,price:360},{name:'Butter Naan',qty:3,price:60},{name:'Sweet Lassi',qty:2,price:90}], total:720, captain:'Ravi', time:'0 min ago', kotId:'KOT-511', customer:'Table 15' },
  { id:'12', number:'#1012', type:'Delivery', platform:'Swiggy', status:'CONFIRMED', items:[{name:'Malai Kofta',qty:1,price:300},{name:'Jeera Rice',qty:1,price:180},{name:'Gulab Jamun',qty:4,price:60}], total:720, captain:'System', time:'3 min ago', kotId:'KOT-512', customer:'Pooja D.' },
];

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string }> = {
  NEW: { bg: '#fef3c7', text: '#92400e' },
  CONFIRMED: { bg: '#dbeafe', text: '#1e40af' },
  PREPARING: { bg: '#fce7f3', text: '#9d174d' },
  READY: { bg: '#d1fae5', text: '#065f46' },
  SERVED: { bg: '#f1f5f9', text: '#475569' },
};

const PLATFORM_COLORS: Record<Platform, string> = {
  POS: '#6b7280', Zomato: '#e23744', Swiggy: '#fc8019', ONDC: '#2563eb',
};

const TABS = ['All Orders', 'Dine-In', 'Takeaway', 'Delivery', 'Online'] as const;
const STATUSES: OrderStatus[] = ['NEW', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED'];

const STATUS_FLOW: Record<string, OrderStatus> = {
  NEW: 'CONFIRMED', CONFIRMED: 'PREPARING', PREPARING: 'READY', READY: 'SERVED',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [activeTab, setActiveTab] = useState<string>('All Orders');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = orders.filter(o => {
    if (activeTab !== 'All Orders' && o.type !== activeTab) return false;
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    return true;
  });

  const kpis = [
    { label: 'Total Orders', value: orders.length, color: '#6366f1' },
    { label: 'Pending', value: orders.filter(o => o.status === 'NEW' || o.status === 'CONFIRMED').length, color: '#f59e0b' },
    { label: 'Preparing', value: orders.filter(o => o.status === 'PREPARING').length, color: '#ec4899' },
    { label: 'Ready', value: orders.filter(o => o.status === 'READY').length, color: '#10b981' },
    { label: 'Revenue', value: `Rs ${orders.reduce((s, o) => s + o.total, 0).toLocaleString('en-IN')}`, color: '#8b5cf6' },
  ];

  const advanceStatus = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = STATUS_FLOW[o.status];
      return next ? { ...o, status: next } : o;
    }));
    if (selectedOrder?.id === id) {
      const next = STATUS_FLOW[selectedOrder.status];
      if (next) setSelectedOrder({ ...selectedOrder, status: next });
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 20px' }}>Orders</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 16, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: activeTab === t ? '#fff' : 'transparent', color: activeTab === t ? '#1e293b' : '#64748b',
            boxShadow: activeTab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 16px' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Status Filter Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setStatusFilter('ALL')} style={{
          padding: '6px 14px', borderRadius: 20, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12, fontWeight: 600,
          background: statusFilter === 'ALL' ? '#1e293b' : '#fff', color: statusFilter === 'ALL' ? '#fff' : '#64748b',
        }}>All</button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: '6px 14px', borderRadius: 20, border: `1px solid ${statusFilter === s ? STATUS_COLORS[s].text : '#e2e8f0'}`, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: statusFilter === s ? STATUS_COLORS[s].bg : '#fff', color: statusFilter === s ? STATUS_COLORS[s].text : '#64748b',
          }}>{s} ({orders.filter(o => o.status === s).length})</button>
        ))}
      </div>

      {/* Order Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {filtered.map(order => (
          <div key={order.id} onClick={() => setSelectedOrder(order)} style={{
            background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16, cursor: 'pointer',
            transition: 'box-shadow 0.15s', borderLeft: `4px solid ${STATUS_COLORS[order.status].text}`,
          }} onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
             onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{order.number}</span>
              <span style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                background: STATUS_COLORS[order.status].bg, color: STATUS_COLORS[order.status].text,
              }}>{order.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>{order.table ? `${order.table} - ` : ''}{order.type}</span>
              <span style={{
                padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, color: '#fff',
                background: PLATFORM_COLORS[order.platform],
              }}>{order.platform}</span>
            </div>
            <div style={{ fontSize: 13, color: '#475569', marginBottom: 8, lineHeight: 1.5 }}>
              {order.items.slice(0, 3).map((it, i) => (
                <span key={i}>{it.qty}x {it.name}{i < Math.min(order.items.length, 3) - 1 ? ', ' : ''}</span>
              ))}
              {order.items.length > 3 && <span style={{ color: '#94a3b8' }}> +{order.items.length - 3} more</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>Rs {order.total.toLocaleString('en-IN')}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{order.captain}</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{order.time}</span>
              </div>
            </div>
            {order.status !== 'SERVED' && (
              <button onClick={e => { e.stopPropagation(); advanceStatus(order.id); }} style={{
                marginTop: 10, width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700, color: '#fff',
                background: order.status === 'PREPARING' ? '#10b981' : order.status === 'READY' ? '#6366f1' : '#f59e0b',
              }}>
                {order.status === 'PREPARING' ? 'Mark Ready' : order.status === 'READY' ? 'Mark Served' : 'Confirm'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Detail Drawer */}
      {selectedOrder && (
        <>
          <div onClick={() => setSelectedOrder(null)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 420, background: '#fff', zIndex: 101,
            boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', overflowY: 'auto', padding: 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Order {selectedOrder.number}</h2>
              <button onClick={() => setSelectedOrder(null)} style={{
                border: 'none', background: '#f1f5f9', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16,
              }}>X</button>
            </div>

            {/* Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Type', value: selectedOrder.type },
                { label: 'Platform', value: selectedOrder.platform },
                { label: 'Table', value: selectedOrder.table || '-' },
                { label: 'Captain', value: selectedOrder.captain },
                { label: 'KOT', value: selectedOrder.kotId },
                { label: 'Customer', value: selectedOrder.customer || '-' },
              ].map(m => (
                <div key={m.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Status Timeline */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#1e293b' }}>Status Timeline</div>
              <div style={{ display: 'flex', gap: 0, alignItems: 'center' }}>
                {STATUSES.map((s, i) => {
                  const reached = STATUSES.indexOf(selectedOrder.status) >= i;
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: reached ? '#fff' : '#94a3b8',
                        background: reached ? STATUS_COLORS[s].text : '#f1f5f9',
                      }}>{i + 1}</div>
                      {i < STATUSES.length - 1 && (
                        <div style={{ width: 32, height: 3, background: reached ? STATUS_COLORS[s].text : '#e2e8f0' }} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {STATUSES.map(s => <span key={s} style={{ fontSize: 9, color: '#94a3b8', width: 52, textAlign: 'center' }}>{s}</span>)}
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#1e293b' }}>Items</div>
              {selectedOrder.items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '10px 0',
                  borderBottom: i < selectedOrder.items.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{item.name}</div>
                    {item.notes && <div style={{ fontSize: 11, color: '#f59e0b' }}>{item.notes}</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Rs {(item.qty * item.price).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{item.qty} x Rs {item.price}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '2px solid #1e293b', marginTop: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>Total</span>
                <span style={{ fontSize: 15, fontWeight: 700 }}>Rs {selectedOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Actions */}
            {selectedOrder.status !== 'SERVED' && (
              <div style={{ display: 'flex', gap: 10 }}>
                {selectedOrder.status === 'PREPARING' && (
                  <button onClick={() => { advanceStatus(selectedOrder.id); }} style={{
                    flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 700, color: '#fff', background: '#10b981',
                  }}>Mark Ready</button>
                )}
                {selectedOrder.status === 'READY' && (
                  <button onClick={() => { advanceStatus(selectedOrder.id); }} style={{
                    flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 700, color: '#fff', background: '#6366f1',
                  }}>Mark Served</button>
                )}
                {(selectedOrder.status === 'NEW' || selectedOrder.status === 'CONFIRMED') && (
                  <button onClick={() => { advanceStatus(selectedOrder.id); }} style={{
                    flex: 1, padding: '12px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 700, color: '#fff', background: '#f59e0b',
                  }}>{selectedOrder.status === 'NEW' ? 'Confirm Order' : 'Start Preparing'}</button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
