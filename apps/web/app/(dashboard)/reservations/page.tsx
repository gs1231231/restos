'use client';

import { useState } from 'react';

type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'SEATED' | 'CANCELLED' | 'NO_SHOW';

interface Reservation {
  id: string;
  guestName: string;
  phone: string;
  pax: number;
  date: string;
  time: string;
  table: string;
  occasion: string;
  specialRequest: string;
  status: ReservationStatus;
}

const STATUS_COLORS: Record<ReservationStatus, { bg: string; text: string }> = {
  PENDING: { bg: '#fef3c7', text: '#92400e' },
  CONFIRMED: { bg: '#dbeafe', text: '#1e40af' },
  SEATED: { bg: '#d1fae5', text: '#065f46' },
  CANCELLED: { bg: '#fee2e2', text: '#991b1b' },
  NO_SHOW: { bg: '#f3e8ff', text: '#6b21a8' },
};

function getNext7Days(): { label: string; short: string; date: string; isToday: boolean }[] {
  const days: { label: string; short: string; date: string; isToday: boolean }[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    days.push({
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      short: d.getDate().toString(),
      date: d.toISOString().split('T')[0]!,
      isToday: i === 0,
    });
  }
  return days;
}

const today = new Date().toISOString().split('T')[0]!;
const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]!; })();

const INITIAL_RESERVATIONS: Reservation[] = [
  { id: 'R001', guestName: 'Rahul Sharma', phone: '9876543210', pax: 4, date: today, time: '12:30', table: 'T3', occasion: 'Birthday', specialRequest: 'Cake at table', status: 'CONFIRMED' },
  { id: 'R002', guestName: 'Priya Patel', phone: '9823456789', pax: 2, date: today, time: '13:00', table: 'T7', occasion: '', specialRequest: '', status: 'SEATED' },
  { id: 'R003', guestName: 'Amit Verma', phone: '9812345670', pax: 6, date: today, time: '19:00', table: 'T1', occasion: 'Anniversary', specialRequest: 'Window seat preferred', status: 'PENDING' },
  { id: 'R004', guestName: 'Sneha Gupta', phone: '9898765432', pax: 3, date: today, time: '20:00', table: 'T5', occasion: '', specialRequest: 'Vegetarian only', status: 'CONFIRMED' },
  { id: 'R005', guestName: 'Vikram Singh', phone: '9845671234', pax: 8, date: today, time: '14:00', table: 'T10', occasion: 'Team Lunch', specialRequest: '', status: 'NO_SHOW' },
  { id: 'R006', guestName: 'Kavita Reddy', phone: '9867890123', pax: 2, date: tomorrow, time: '19:30', table: 'T4', occasion: 'Date Night', specialRequest: 'Quiet corner', status: 'PENDING' },
  { id: 'R007', guestName: 'Deepak Joshi', phone: '9834567890', pax: 5, date: tomorrow, time: '13:30', table: 'T8', occasion: '', specialRequest: '', status: 'CONFIRMED' },
  { id: 'R008', guestName: 'Nisha Kapoor', phone: '9811223344', pax: 4, date: today, time: '21:00', table: 'T2', occasion: 'Birthday', specialRequest: 'Allergy: peanuts', status: 'CANCELLED' },
];

const TIMELINE_START = 10;
const TIMELINE_END = 23;

export default function ReservationsPage() {
  const days = getNext7Days();
  const [selectedDate, setSelectedDate] = useState(days[0]!.date);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');
  const [form, setForm] = useState({ guestName: '', phone: '', pax: '2', date: today, time: '19:00', table: '', occasion: '', specialRequest: '' });

  const filtered = reservations.filter(r => r.date === selectedDate);
  const todayRes = reservations.filter(r => r.date === today);
  const kpis = [
    { label: "Today's Bookings", value: todayRes.length, color: '#6366f1' },
    { label: 'Upcoming', value: todayRes.filter(r => r.status === 'CONFIRMED' || r.status === 'PENDING').length, color: '#3b82f6' },
    { label: 'Seated', value: todayRes.filter(r => r.status === 'SEATED').length, color: '#10b981' },
    { label: 'No-Shows', value: todayRes.filter(r => r.status === 'NO_SHOW').length, color: '#ef4444' },
  ];

  const updateStatus = (id: string, status: ReservationStatus) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const handleAdd = () => {
    const newRes: Reservation = {
      id: 'R' + String(reservations.length + 1).padStart(3, '0'),
      guestName: form.guestName,
      phone: form.phone,
      pax: parseInt(form.pax) || 2,
      date: form.date,
      time: form.time,
      table: form.table,
      occasion: form.occasion,
      specialRequest: form.specialRequest,
      status: 'PENDING',
    };
    setReservations(prev => [...prev, newRes]);
    setShowModal(false);
    setForm({ guestName: '', phone: '', pax: '2', date: today, time: '19:00', table: '', occasion: '', specialRequest: '' });
  };

  const timeToHour = (t: string) => {
    const parts = t.split(':').map(Number);
    return (parts[0] ?? 0) + (parts[1] ?? 0) / 60;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Reservations</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setViewMode(viewMode === 'cards' ? 'timeline' : 'cards')} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
            {viewMode === 'cards' ? 'Timeline View' : 'Card View'}
          </button>
          <button onClick={() => setShowModal(true)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            + New Reservation
          </button>
        </div>
      </div>

      {/* Calendar Strip */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
        {days.map(d => (
          <button key={d.date} onClick={() => setSelectedDate(d.date)} style={{
            padding: '10px 18px', borderRadius: 10, border: selectedDate === d.date ? '2px solid #6366f1' : '1px solid #e2e8f0',
            background: selectedDate === d.date ? '#eef2ff' : '#fff', cursor: 'pointer', textAlign: 'center', minWidth: 64,
          }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{d.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: selectedDate === d.date ? '#6366f1' : '#1e293b' }}>{d.short}</div>
            {d.isToday && <div style={{ fontSize: 9, color: '#6366f1', fontWeight: 600 }}>TODAY</div>}
          </button>
        ))}
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Card View */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              No reservations for this date.
            </div>
          )}
          {filtered.map(r => {
            const sc = STATUS_COLORS[r.status];
            return (
              <div key={r.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{r.guestName}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{r.phone}</div>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: sc.bg, color: sc.text }}>{r.status.replace('_', ' ')}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 13, color: '#475569', marginBottom: 10 }}>
                  <div>Pax: <strong>{r.pax}</strong></div>
                  <div>Time: <strong>{r.time}</strong></div>
                  <div>Table: <strong>{r.table}</strong></div>
                  {r.occasion && <div>Occasion: <strong>{r.occasion}</strong></div>}
                </div>
                {r.specialRequest && <div style={{ fontSize: 12, color: '#6366f1', fontStyle: 'italic', marginBottom: 10 }}>{r.specialRequest}</div>}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {r.status === 'PENDING' && <button onClick={() => updateStatus(r.id, 'CONFIRMED')} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#dbeafe', color: '#1e40af', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Confirm</button>}
                  {(r.status === 'CONFIRMED' || r.status === 'PENDING') && <button onClick={() => updateStatus(r.id, 'SEATED')} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#d1fae5', color: '#065f46', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Seat Guest</button>}
                  {r.status !== 'CANCELLED' && r.status !== 'NO_SHOW' && r.status !== 'SEATED' && <button onClick={() => updateStatus(r.id, 'CANCELLED')} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#fee2e2', color: '#991b1b', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>}
                  {r.status !== 'NO_SHOW' && r.status !== 'SEATED' && r.status !== 'CANCELLED' && <button onClick={() => updateStatus(r.id, 'NO_SHOW')} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: '#f3e8ff', color: '#6b21a8', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>No-Show</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, overflowX: 'auto' }}>
          <div style={{ position: 'relative', minHeight: filtered.length * 48 + 40, minWidth: 700 }}>
            {Array.from({ length: TIMELINE_END - TIMELINE_START + 1 }, (_, i) => TIMELINE_START + i).map(h => {
              const left = ((h - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100;
              return (
                <div key={h} style={{ position: 'absolute', left: `${left}%`, top: 0, bottom: 0, borderLeft: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', position: 'absolute', top: -2, transform: 'translateX(-50%)' }}>
                    {h > 12 ? `${h - 12}PM` : h === 12 ? '12PM' : `${h}AM`}
                  </div>
                </div>
              );
            })}
            {filtered.map((r, idx) => {
              const startH = timeToHour(r.time);
              const left = ((startH - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100;
              const width = (1.5 / (TIMELINE_END - TIMELINE_START)) * 100;
              const sc = STATUS_COLORS[r.status];
              return (
                <div key={r.id} style={{
                  position: 'absolute', left: `${Math.max(0, left)}%`, width: `${width}%`, top: 24 + idx * 48, height: 38,
                  background: sc.bg, borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 8,
                  border: `1px solid ${sc.text}33`, minWidth: 120, cursor: 'default',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: sc.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.guestName} ({r.pax}p) - {r.table}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Reservation Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>New Reservation</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>x</button>
            </div>
            {[
              { label: 'Guest Name', key: 'guestName', type: 'text' },
              { label: 'Phone', key: 'phone', type: 'tel' },
              { label: 'Party Size', key: 'pax', type: 'number' },
              { label: 'Date', key: 'date', type: 'date' },
              { label: 'Time', key: 'time', type: 'time' },
              { label: 'Table', key: 'table', type: 'text' },
              { label: 'Occasion', key: 'occasion', type: 'text' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Special Request</label>
              <textarea value={form.specialRequest} onChange={e => setForm(prev => ({ ...prev, specialRequest: e.target.value }))}
                rows={2} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleAdd} disabled={!form.guestName || !form.phone} style={{
              width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: !form.guestName || !form.phone ? '#cbd5e1' : '#6366f1',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: !form.guestName || !form.phone ? 'not-allowed' : 'pointer',
            }}>Add Reservation</button>
          </div>
        </div>
      )}
    </div>
  );
}
