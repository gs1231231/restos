'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────
type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
type TableShape = 'square' | 'round' | 'rectangle';
type ViewMode = 'floor' | 'grid' | 'edit';

interface TableData {
  id: number;
  name: string;
  seats: number;
  shape: TableShape;
  floor: string;
  status: TableStatus;
  captain?: string;
  guestName?: string;
  pax?: number;
  orderId?: string;
  orderAmount?: number;
  orderItems?: { name: string; qty: number; price: number }[];
  occupiedSince?: number; // timestamp
  reservedFor?: string; // time string
}

// ─── Constants ───────────────────────────────────────────────────
const FLOORS = ['Ground Floor', 'First Floor', 'Terrace'];

const STATUS_COLORS: Record<TableStatus, { border: string; bg: string; text: string; label: string }> = {
  AVAILABLE: { border: '#22c55e', bg: '#f0fdf4', text: '#166534', label: 'Available' },
  OCCUPIED: { border: '#f97316', bg: '#fff7ed', text: '#9a3412', label: 'Occupied' },
  RESERVED: { border: '#3b82f6', bg: '#eff6ff', text: '#1e40af', label: 'Reserved' },
  CLEANING: { border: '#94a3b8', bg: '#f8fafc', text: '#475569', label: 'Cleaning' },
};

// ─── Sample Data ─────────────────────────────────────────────────
const INITIAL_TABLES: TableData[] = [
  { id: 1, name: 'T1', seats: 2, shape: 'square', floor: 'Ground Floor', status: 'AVAILABLE' },
  { id: 2, name: 'T2', seats: 4, shape: 'square', floor: 'Ground Floor', status: 'OCCUPIED', captain: 'Ravi', pax: 3, orderId: 'ORD-041', orderAmount: 1250, occupiedSince: Date.now() - 35 * 60000, orderItems: [{ name: 'Butter Chicken', qty: 1, price: 380 }, { name: 'Naan (2)', qty: 1, price: 80 }, { name: 'Dal Makhani', qty: 1, price: 280 }, { name: 'Lassi', qty: 2, price: 120 }] },
  { id: 3, name: 'T3', seats: 6, shape: 'rectangle', floor: 'Ground Floor', status: 'RESERVED', guestName: 'Mr. Sharma', reservedFor: '8:00 PM', pax: 5 },
  { id: 4, name: 'T4', seats: 4, shape: 'round', floor: 'Ground Floor', status: 'CLEANING' },
  { id: 5, name: 'T5', seats: 2, shape: 'square', floor: 'Ground Floor', status: 'OCCUPIED', captain: 'Priya', pax: 2, orderId: 'ORD-038', orderAmount: 890, occupiedSince: Date.now() - 52 * 60000, orderItems: [{ name: 'Paneer Tikka', qty: 1, price: 320 }, { name: 'Veg Biryani', qty: 1, price: 280 }, { name: 'Raita', qty: 1, price: 60 }] },
  { id: 6, name: 'T6', seats: 8, shape: 'rectangle', floor: 'Ground Floor', status: 'AVAILABLE' },
  { id: 7, name: 'T7', seats: 4, shape: 'square', floor: 'First Floor', status: 'AVAILABLE' },
  { id: 8, name: 'T8', seats: 4, shape: 'round', floor: 'First Floor', status: 'OCCUPIED', captain: 'Amit', pax: 4, orderId: 'ORD-039', orderAmount: 2180, occupiedSince: Date.now() - 20 * 60000, orderItems: [{ name: 'Chicken Biryani', qty: 2, price: 720 }, { name: 'Tandoori Chicken', qty: 1, price: 420 }, { name: 'Butter Naan (4)', qty: 1, price: 160 }] },
  { id: 9, name: 'T9', seats: 2, shape: 'square', floor: 'First Floor', status: 'RESERVED', guestName: 'Ms. Patel', reservedFor: '7:30 PM', pax: 2 },
  { id: 10, name: 'T10', seats: 6, shape: 'rectangle', floor: 'First Floor', status: 'AVAILABLE' },
  { id: 11, name: 'T11', seats: 4, shape: 'square', floor: 'First Floor', status: 'CLEANING' },
  { id: 12, name: 'T12', seats: 2, shape: 'round', floor: 'Terrace', status: 'AVAILABLE' },
  { id: 13, name: 'T13', seats: 4, shape: 'square', floor: 'Terrace', status: 'OCCUPIED', captain: 'Ravi', pax: 2, orderId: 'ORD-040', orderAmount: 640, occupiedSince: Date.now() - 12 * 60000, orderItems: [{ name: 'Masala Dosa', qty: 2, price: 360 }, { name: 'Filter Coffee', qty: 2, price: 160 }] },
  { id: 14, name: 'T14', seats: 6, shape: 'rectangle', floor: 'Terrace', status: 'RESERVED', guestName: 'Mr. Gupta', reservedFor: '9:00 PM', pax: 6 },
  { id: 15, name: 'T15', seats: 2, shape: 'square', floor: 'Terrace', status: 'AVAILABLE' },
];

// ─── Helper ──────────────────────────────────────────────────────
function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ─── Toast Component ─────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: '#1e293b', color: '#fff', padding: '10px 24px', borderRadius: 8,
      fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    }}>
      {message}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
export default function TablesPage() {
  const [tables, setTables] = useState<TableData[]>(INITIAL_TABLES);
  const [activeFloor, setActiveFloor] = useState('Ground Floor');
  const [viewMode, setViewMode] = useState<ViewMode>('floor');
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [now, setNow] = useState(Date.now());

  // New table form
  const [newName, setNewName] = useState('');
  const [newSeats, setNewSeats] = useState(4);
  const [newShape, setNewShape] = useState<TableShape>('square');
  const [newFloor, setNewFloor] = useState('Ground Floor');

  // Pax selector for available table
  const [selectedPax, setSelectedPax] = useState(2);

  // Timer tick
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const updateTable = useCallback((id: number, updates: Partial<TableData>) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    setSelectedTable(prev => prev && prev.id === id ? { ...prev, ...updates } : prev);
  }, []);

  const openDrawer = (table: TableData) => {
    setSelectedTable(table);
    setSelectedPax(table.pax || 2);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedTable(null), 200);
  };

  const floorTables = tables.filter(t => t.floor === activeFloor);
  const statusCounts = tables.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // ─── Add Table ─────────────────────────────────────────────────
  const addTable = () => {
    if (!newName.trim()) { showToast('Enter a table name'); return; }
    const id = Math.max(...tables.map(t => t.id)) + 1;
    setTables(prev => [...prev, { id, name: newName.trim(), seats: newSeats, shape: newShape, floor: newFloor, status: 'AVAILABLE' }]);
    setNewName('');
    showToast(`Table "${newName.trim()}" added to ${newFloor}`);
  };

  const deleteTable = (id: number) => {
    const t = tables.find(x => x.id === id);
    setTables(prev => prev.filter(x => x.id !== id));
    closeDrawer();
    showToast(`Table "${t?.name}" deleted`);
  };

  // ─── Styles ────────────────────────────────────────────────────
  const cardBase: React.CSSProperties = { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 };
  const btnBase: React.CSSProperties = { border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' };
  const btnPrimary: React.CSSProperties = { ...btnBase, background: '#6366f1', color: '#fff' };
  const btnOutline: React.CSSProperties = { ...btnBase, background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0' };
  const btnDanger: React.CSSProperties = { ...btnBase, background: '#fee2e2', color: '#dc2626' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
  const selectStyle: React.CSSProperties = { ...inputStyle, appearance: 'auto' as React.CSSProperties['appearance'] };

  // ─── Render Table Card (Floor Plan) ────────────────────────────
  const renderTableCard = (table: TableData) => {
    const sc = STATUS_COLORS[table.status];
    const isRound = table.shape === 'round';
    return (
      <div
        key={table.id}
        onClick={() => openDrawer(table)}
        style={{
          background: sc.bg,
          border: `2px solid ${sc.border}`,
          borderRadius: isRound ? '50%' : 12,
          width: table.shape === 'rectangle' ? 200 : 140,
          height: 140,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
          position: 'relative', gap: 4,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {/* Status badge */}
        <span style={{
          position: 'absolute', top: 8, right: isRound ? 16 : 8,
          fontSize: 10, fontWeight: 600, color: sc.text, background: '#fff',
          padding: '2px 6px', borderRadius: 6, border: `1px solid ${sc.border}`,
        }}>
          {sc.label}
        </span>

        <span style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{table.name}</span>
        <span style={{ fontSize: 11, color: '#64748b' }}>{table.seats} seats</span>

        {table.status === 'OCCUPIED' && table.occupiedSince && (
          <span style={{ fontSize: 11, fontWeight: 600, color: sc.text, marginTop: 2 }}>
            {formatDuration(now - table.occupiedSince)}
          </span>
        )}
        {table.status === 'RESERVED' && table.guestName && (
          <span style={{ fontSize: 11, fontWeight: 500, color: sc.text, marginTop: 2 }}>{table.guestName}</span>
        )}
        {table.status === 'OCCUPIED' && table.orderAmount && (
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginTop: 2 }}>
            ₹{table.orderAmount.toLocaleString('en-IN')}
          </span>
        )}
      </div>
    );
  };

  // ─── Render Drawer ─────────────────────────────────────────────
  const renderDrawerContent = () => {
    if (!selectedTable) return null;
    const t = selectedTable;
    const sc = STATUS_COLORS[t.status];

    return (
      <div style={{ padding: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{t.name}</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>{t.floor} &middot; {t.seats} seats &middot; {t.shape}</p>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 600, color: sc.text, background: sc.bg,
            padding: '4px 12px', borderRadius: 8, border: `1px solid ${sc.border}`,
          }}>
            {sc.label}
          </span>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
          {/* AVAILABLE */}
          {t.status === 'AVAILABLE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Number of Guests</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].filter(n => n <= t.seats).map(n => (
                    <button key={n} onClick={() => setSelectedPax(n)} style={{
                      ...btnBase, width: 36, height: 36, padding: 0, textAlign: 'center',
                      background: selectedPax === n ? '#6366f1' : '#f1f5f9',
                      color: selectedPax === n ? '#fff' : '#1e293b',
                    }}>{n}</button>
                  ))}
                </div>
              </div>

              <Link href={`/pos?tableId=${t.id}`} style={{ textDecoration: 'none' }}>
                <button style={{ ...btnPrimary, width: '100%' }}>New Order</button>
              </Link>

              <button style={btnOutline} onClick={() => {
                updateTable(t.id, { status: 'RESERVED', guestName: 'Walk-in', reservedFor: 'Now', pax: selectedPax });
                showToast(`${t.name} marked as Reserved`);
                closeDrawer();
              }}>Mark Reserved</button>

              {viewMode === 'edit' && (
                <button style={btnDanger} onClick={() => deleteTable(t.id)}>Delete Table</button>
              )}
            </div>
          )}

          {/* OCCUPIED */}
          {t.status === 'OCCUPIED' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Order</span>
                <span style={{ fontWeight: 600 }}>{t.orderId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Captain</span>
                <span style={{ fontWeight: 600 }}>{t.captain}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Guests</span>
                <span style={{ fontWeight: 600 }}>{t.pax}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Duration</span>
                <span style={{ fontWeight: 600 }}>{t.occupiedSince ? formatDuration(now - t.occupiedSince) : '-'}</span>
              </div>

              {/* Order Items */}
              {t.orderItems && (
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginTop: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Order Items</div>
                  {t.orderItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                      <span>{item.qty}x {item.name}</span>
                      <span style={{ fontWeight: 500 }}>₹{item.price}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
                    <span>Total</span>
                    <span>₹{t.orderAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                <Link href={`/pos?tableId=${t.id}`} style={{ textDecoration: 'none' }}>
                  <button style={{ ...btnOutline, width: '100%' }}>Add Items</button>
                </Link>
                <button style={btnOutline} onClick={() => { showToast('KOT sent to kitchen'); }}>Print KOT</button>
                <button style={btnOutline} onClick={() => { showToast('Select a table to transfer'); }}>Transfer Table</button>
                <button style={{ ...btnPrimary, width: '100%' }} onClick={() => {
                  showToast(`Bill generated for ${t.name}: ₹${t.orderAmount?.toLocaleString('en-IN')}`);
                  updateTable(t.id, { status: 'CLEANING', orderId: undefined, orderAmount: undefined, orderItems: undefined, captain: undefined, pax: undefined, occupiedSince: undefined });
                  closeDrawer();
                }}>Generate Bill</button>
              </div>
            </div>
          )}

          {/* RESERVED */}
          {t.status === 'RESERVED' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Guest</span>
                <span style={{ fontWeight: 600 }}>{t.guestName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Reserved For</span>
                <span style={{ fontWeight: 600 }}>{t.reservedFor}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>Guests</span>
                <span style={{ fontWeight: 600 }}>{t.pax || '-'}</span>
              </div>

              <button style={btnPrimary} onClick={() => {
                updateTable(t.id, { status: 'OCCUPIED', occupiedSince: Date.now(), captain: 'Ravi', orderId: `ORD-${String(Math.floor(Math.random() * 900) + 100)}`, orderAmount: 0, orderItems: [] });
                showToast(`${t.name} — Guest seated`);
                closeDrawer();
              }}>Seat Guest</button>
              <button style={btnDanger} onClick={() => {
                updateTable(t.id, { status: 'AVAILABLE', guestName: undefined, reservedFor: undefined, pax: undefined });
                showToast(`Reservation for ${t.guestName} cancelled`);
                closeDrawer();
              }}>Cancel Reservation</button>
            </div>
          )}

          {/* CLEANING */}
          {t.status === 'CLEANING' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Table is being cleaned and prepared for the next guests.</p>
              <button style={{ ...btnPrimary, background: '#22c55e' }} onClick={() => {
                updateTable(t.id, { status: 'AVAILABLE' });
                showToast(`${t.name} is now available`);
                closeDrawer();
              }}>Mark Available</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div>
      {/* Title Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Table Management</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['floor', 'grid', 'edit'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => { setViewMode(mode); if (mode !== 'floor') closeDrawer(); }}
              style={{
                ...btnBase, fontSize: 12,
                background: viewMode === mode ? '#6366f1' : '#f1f5f9',
                color: viewMode === mode ? '#fff' : '#64748b',
              }}
            >
              {mode === 'floor' ? 'Floor Plan' : mode === 'grid' ? 'Grid View' : 'Edit Mode'}
            </button>
          ))}
        </div>
      </div>

      {/* Status Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {(Object.keys(STATUS_COLORS) as TableStatus[]).map(s => (
          <div key={s} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: STATUS_COLORS[s].bg, border: `1px solid ${STATUS_COLORS[s].border}`,
            borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 600, color: STATUS_COLORS[s].text,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s].border, display: 'inline-block' }} />
            {STATUS_COLORS[s].label}: {statusCounts[s] || 0}
          </div>
        ))}
      </div>

      {/* ─── FLOOR PLAN VIEW ────────────────────────────────────── */}
      {(viewMode === 'floor' || viewMode === 'edit') && (
        <>
          {/* Floor Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {FLOORS.map(f => (
              <button key={f} onClick={() => setActiveFloor(f)} style={{
                ...btnBase, fontSize: 13,
                background: activeFloor === f ? '#1e293b' : '#f1f5f9',
                color: activeFloor === f ? '#fff' : '#64748b',
                borderRadius: 8,
              }}>
                {f}
                <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                  ({tables.filter(t => t.floor === f).length})
                </span>
              </button>
            ))}
          </div>

          {/* Table Grid */}
          <div style={{
            ...cardBase,
            display: 'flex', flexWrap: 'wrap', gap: 16, padding: 24, minHeight: 300,
            alignItems: 'flex-start',
          }}>
            {floorTables.length === 0 && (
              <div style={{ width: '100%', textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>
                No tables on this floor. {viewMode === 'edit' && 'Add one below.'}
              </div>
            )}
            {floorTables.map(renderTableCard)}
          </div>

          {/* Edit Mode: Add Table Form */}
          {viewMode === 'edit' && (
            <div style={{ ...cardBase, marginTop: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px' }}>Add New Table</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Name</label>
                  <input style={inputStyle} value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. T16" />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Seats</label>
                  <input style={inputStyle} type="number" min={1} max={20} value={newSeats} onChange={e => setNewSeats(Number(e.target.value))} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Shape</label>
                  <select style={selectStyle} value={newShape} onChange={e => setNewShape(e.target.value as TableShape)}>
                    <option value="square">Square</option>
                    <option value="round">Round</option>
                    <option value="rectangle">Rectangle</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 4 }}>Floor</label>
                  <select style={selectStyle} value={newFloor} onChange={e => setNewFloor(e.target.value)}>
                    {FLOORS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <button style={btnPrimary} onClick={addTable}>Add Table</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── GRID VIEW ──────────────────────────────────────────── */}
      {viewMode === 'grid' && (
        <div style={{ ...cardBase, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                {['Table', 'Floor', 'Seats', 'Status', 'Order', 'Amount', 'Captain', 'Duration'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tables.map(t => {
                const sc = STATUS_COLORS[t.status];
                return (
                  <tr key={t.id} onClick={() => openDrawer(t)} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{t.name}</td>
                    <td style={{ padding: '10px 12px' }}>{t.floor}</td>
                    <td style={{ padding: '10px 12px' }}>{t.seats}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: sc.text, background: sc.bg, padding: '3px 10px', borderRadius: 6, border: `1px solid ${sc.border}` }}>
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>{t.orderId || '-'}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{t.orderAmount ? `₹${t.orderAmount.toLocaleString('en-IN')}` : '-'}</td>
                    <td style={{ padding: '10px 12px' }}>{t.captain || '-'}</td>
                    <td style={{ padding: '10px 12px' }}>{t.occupiedSince ? formatDuration(now - t.occupiedSince) : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── DRAWER OVERLAY ─────────────────────────────────────── */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div onClick={closeDrawer} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100,
          }} />
          {/* Drawer */}
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
            background: '#fff', zIndex: 101, boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
            overflowY: 'auto',
          }}>
            {/* Close */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}>
              <button onClick={closeDrawer} style={{ ...btnBase, background: '#f1f5f9', color: '#64748b', fontSize: 18, width: 32, height: 32, padding: 0, lineHeight: '32px', textAlign: 'center' }}>
                &times;
              </button>
            </div>
            {renderDrawerContent()}
          </div>
        </>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
