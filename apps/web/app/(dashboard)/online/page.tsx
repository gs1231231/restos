'use client';

import { useState, useEffect, useCallback } from 'react';

/* ───── Types ───── */
type Platform = 'Zomato' | 'Swiggy' | 'ONDC';
type OnlineOrderStatus = 'NEW' | 'PREPARING' | 'READY' | 'DISPATCHED';

interface OrderItem { name: string; qty: number; price: number }
interface OnlineOrder {
  id: string; number: string; platform: Platform; status: OnlineOrderStatus;
  items: OrderItem[]; total: number; customer: string; address: string;
  time: string; countdown: number; // seconds remaining for NEW orders
}

/* ───── Demo Data ───── */
const INITIAL_ORDERS: OnlineOrder[] = [
  { id:'o1', number:'#Z-4021', platform:'Zomato', status:'NEW', items:[{name:'Butter Chicken',qty:2,price:380},{name:'Garlic Naan',qty:4,price:60}], total:1000, customer:'Rahul Sharma', address:'12B, Sector 15, Noida', time:'Just now', countdown:30 },
  { id:'o2', number:'#S-8834', platform:'Swiggy', status:'NEW', items:[{name:'Chicken Biryani',qty:1,price:360},{name:'Raita',qty:1,price:50}], total:410, customer:'Priya Menon', address:'A-204, DLF Phase 2, Gurgaon', time:'1 min ago', countdown:22 },
  { id:'o3', number:'#ON-1102', platform:'ONDC', status:'NEW', items:[{name:'Veg Thali',qty:2,price:250}], total:500, customer:'Sita Reddy', address:'Flat 301, MG Road, Bangalore', time:'2 min ago', countdown:15 },
  { id:'o4', number:'#Z-4019', platform:'Zomato', status:'PREPARING', items:[{name:'Paneer Tikka',qty:1,price:320},{name:'Dal Makhani',qty:1,price:280},{name:'Naan',qty:3,price:60}], total:780, customer:'Amit Verma', address:'H-14, Connaught Place, Delhi', time:'6 min ago', countdown:0 },
  { id:'o5', number:'#S-8831', platform:'Swiggy', status:'PREPARING', items:[{name:'Mutton Biryani',qty:2,price:440},{name:'Mirchi Ka Salan',qty:1,price:120}], total:1000, customer:'Neha Patil', address:'B-12, Koramangala, Bangalore', time:'10 min ago', countdown:0 },
  { id:'o6', number:'#ON-1100', platform:'ONDC', status:'READY', items:[{name:'Chole Bhature',qty:3,price:200},{name:'Lassi',qty:3,price:80}], total:840, customer:'Vikram Singh', address:'23, Park Street, Kolkata', time:'18 min ago', countdown:0 },
  { id:'o7', number:'#Z-4015', platform:'Zomato', status:'DISPATCHED', items:[{name:'Fish Tikka',qty:1,price:380},{name:'Prawn Curry',qty:1,price:420}], total:800, customer:'Meera Kumar', address:'5th Cross, Indiranagar, Bangalore', time:'25 min ago', countdown:0 },
  { id:'o8', number:'#S-8828', platform:'Swiggy', status:'DISPATCHED', items:[{name:'Kadhai Chicken',qty:1,price:360},{name:'Butter Naan',qty:2,price:60},{name:'Gulab Jamun',qty:2,price:60}], total:600, customer:'Pooja Desai', address:'302, Hiranandani, Mumbai', time:'30 min ago', countdown:0 },
];

const PLATFORM_COLORS: Record<Platform, string> = { Zomato: '#e23744', Swiggy: '#fc8019', ONDC: '#2563eb' };
const STATUS_COLS: { key: OnlineOrderStatus; label: string; color: string }[] = [
  { key: 'NEW', label: 'New', color: '#f59e0b' },
  { key: 'PREPARING', label: 'Preparing', color: '#8b5cf6' },
  { key: 'READY', label: 'Ready', color: '#10b981' },
  { key: 'DISPATCHED', label: 'Dispatched', color: '#6366f1' },
];

export default function OnlineOrdersPage() {
  const [orders, setOrders] = useState<OnlineOrder[]>(INITIAL_ORDERS);
  const [autoAccept, setAutoAccept] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<Platform | 'ALL'>('ALL');

  // Countdown timer for NEW orders
  useEffect(() => {
    const id = setInterval(() => {
      setOrders(prev => prev.map(o => {
        if (o.status !== 'NEW' || o.countdown <= 0) return o;
        const next = o.countdown - 1;
        if (next <= 0 && autoAccept) {
          return { ...o, status: 'PREPARING' as OnlineOrderStatus, countdown: 0 };
        }
        return { ...o, countdown: next };
      }));
    }, 1000);
    return () => clearInterval(id);
  }, [autoAccept]);

  const acceptOrder = useCallback((id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'PREPARING' as OnlineOrderStatus, countdown: 0 } : o));
  }, []);

  const rejectOrder = useCallback((id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  }, []);

  const markPreparing = useCallback((id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'PREPARING' as OnlineOrderStatus } : o));
  }, []);

  const markReady = useCallback((id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'READY' as OnlineOrderStatus } : o));
  }, []);

  const markDispatched = useCallback((id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'DISPATCHED' as OnlineOrderStatus } : o));
  }, []);

  const filtered = orders.filter(o => platformFilter === 'ALL' || o.platform === platformFilter);

  const kpis = [
    { label: 'Total Online Orders', value: orders.length, color: '#6366f1' },
    { label: 'Zomato', value: orders.filter(o => o.platform === 'Zomato').length, color: '#e23744' },
    { label: 'Swiggy', value: orders.filter(o => o.platform === 'Swiggy').length, color: '#fc8019' },
    { label: 'ONDC', value: orders.filter(o => o.platform === 'ONDC').length, color: '#2563eb' },
    { label: 'Online Revenue', value: `Rs ${orders.reduce((s, o) => s + o.total, 0).toLocaleString('en-IN')}`, color: '#10b981' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Online Orders</h1>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
          Auto-Accept
          <div onClick={() => setAutoAccept(!autoAccept)} style={{
            width: 44, height: 24, borderRadius: 12, background: autoAccept ? '#10b981' : '#cbd5e1',
            position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
          }}>
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute',
              top: 3, left: autoAccept ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </div>
        </label>
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

      {/* Platform Filter Chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['ALL', 'Zomato', 'Swiggy', 'ONDC'] as const).map(p => (
          <button key={p} onClick={() => setPlatformFilter(p)} style={{
            padding: '6px 16px', borderRadius: 20, border: `1px solid ${platformFilter === p ? (p === 'ALL' ? '#1e293b' : PLATFORM_COLORS[p as Platform]) : '#e2e8f0'}`,
            cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: platformFilter === p ? (p === 'ALL' ? '#1e293b' : PLATFORM_COLORS[p as Platform]) : '#fff',
            color: platformFilter === p ? '#fff' : '#64748b',
          }}>{p === 'ALL' ? 'All Platforms' : p}</button>
        ))}
      </div>

      {/* 4-Column Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, alignItems: 'start' }}>
        {STATUS_COLS.map(col => {
          const colOrders = filtered.filter(o => o.status === col.key);
          return (
            <div key={col.key}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '8px 12px',
                background: '#f8fafc', borderRadius: 8, borderLeft: `4px solid ${col.color}`,
              }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{col.label}</span>
                <span style={{
                  padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                  background: col.color, color: '#fff',
                }}>{colOrders.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {colOrders.map(order => (
                  <div key={order.id} style={{
                    background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 14,
                    borderTop: `3px solid ${PLATFORM_COLORS[order.platform]}`,
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{order.number}</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, color: '#fff',
                        background: PLATFORM_COLORS[order.platform],
                      }}>{order.platform}</span>
                    </div>

                    {/* Countdown for NEW */}
                    {order.status === 'NEW' && order.countdown > 0 && (
                      <div style={{
                        background: order.countdown <= 10 ? '#fef2f2' : '#fffbeb', borderRadius: 6, padding: '4px 8px',
                        marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 800, color: '#fff',
                          background: order.countdown <= 10 ? '#ef4444' : '#f59e0b',
                        }}>{order.countdown}</div>
                        <span style={{ fontSize: 11, color: order.countdown <= 10 ? '#dc2626' : '#92400e', fontWeight: 600 }}>
                          seconds to accept
                        </span>
                      </div>
                    )}

                    {/* Items */}
                    <div style={{ fontSize: 12, color: '#475569', marginBottom: 8, lineHeight: 1.6 }}>
                      {order.items.map((it, i) => (
                        <div key={i}>{it.qty}x {it.name}</div>
                      ))}
                    </div>

                    {/* Total */}
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b', marginBottom: 6 }}>
                      Rs {order.total.toLocaleString('en-IN')}
                    </div>

                    {/* Customer */}
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>{order.customer}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {order.address}
                    </div>

                    {/* Actions */}
                    {order.status === 'NEW' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => acceptOrder(order.id)} style={{
                          flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                          fontSize: 12, fontWeight: 700, color: '#fff', background: '#10b981',
                        }}>Accept</button>
                        <button onClick={() => rejectOrder(order.id)} style={{
                          flex: 1, padding: '8px 0', borderRadius: 8, border: '1px solid #fca5a5', cursor: 'pointer',
                          fontSize: 12, fontWeight: 700, color: '#ef4444', background: '#fff',
                        }}>Reject</button>
                      </div>
                    )}
                    {order.status === 'PREPARING' && (
                      <button onClick={() => markReady(order.id)} style={{
                        width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 700, color: '#fff', background: '#10b981',
                      }}>Mark Ready</button>
                    )}
                    {order.status === 'READY' && (
                      <button onClick={() => markDispatched(order.id)} style={{
                        width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 700, color: '#fff', background: '#6366f1',
                      }}>Mark Dispatched</button>
                    )}
                  </div>
                ))}
                {colOrders.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8', fontSize: 13 }}>No orders</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
