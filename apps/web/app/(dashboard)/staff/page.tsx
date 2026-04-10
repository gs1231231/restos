'use client';

import { useState } from 'react';

type Role = 'OWNER' | 'MANAGER' | 'CAPTAIN' | 'KITCHEN' | 'CASHIER';
type StaffTab = 'staff' | 'attendance' | 'performance';

interface StaffMember {
  id: string; name: string; phone: string; email: string; role: Role;
  pin: string; active: boolean; joinDate: string;
  ordersHandled: number; revenueGenerated: number;
  clockIn: string; clockOut: string;
}

const ROLE_COLORS: Record<Role, { bg: string; text: string }> = {
  OWNER: { bg: '#fef3c7', text: '#92400e' },
  MANAGER: { bg: '#dbeafe', text: '#1e40af' },
  CAPTAIN: { bg: '#d1fae5', text: '#065f46' },
  KITCHEN: { bg: '#fee2e2', text: '#991b1b' },
  CASHIER: { bg: '#f3e8ff', text: '#6b21a8' },
};

const INITIAL_STAFF: StaffMember[] = [
  { id: 'S001', name: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@restos.in', role: 'OWNER', pin: '1234', active: true, joinDate: '2024-01-01', ordersHandled: 0, revenueGenerated: 0, clockIn: '09:00', clockOut: '-' },
  { id: 'S002', name: 'Meena Iyer', phone: '9823456789', email: 'meena@restos.in', role: 'MANAGER', pin: '2345', active: true, joinDate: '2024-03-15', ordersHandled: 156, revenueGenerated: 89400, clockIn: '09:30', clockOut: '-' },
  { id: 'S003', name: 'Arjun Nair', phone: '9812345670', email: 'arjun@restos.in', role: 'CAPTAIN', pin: '3456', active: true, joinDate: '2024-06-01', ordersHandled: 342, revenueGenerated: 178500, clockIn: '10:00', clockOut: '-' },
  { id: 'S004', name: 'Lakshmi Devi', phone: '9898765432', email: 'lakshmi@restos.in', role: 'CAPTAIN', pin: '4567', active: false, joinDate: '2024-08-10', ordersHandled: 289, revenueGenerated: 145200, clockIn: '-', clockOut: '-' },
  { id: 'S005', name: 'Sunil Yadav', phone: '9845671234', email: 'sunil@restos.in', role: 'KITCHEN', pin: '5678', active: true, joinDate: '2024-04-20', ordersHandled: 520, revenueGenerated: 0, clockIn: '08:00', clockOut: '-' },
  { id: 'S006', name: 'Pooja Sharma', phone: '9867890123', email: 'pooja@restos.in', role: 'CASHIER', pin: '6789', active: true, joinDate: '2025-01-10', ordersHandled: 410, revenueGenerated: 215600, clockIn: '10:00', clockOut: '-' },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [activeTab, setActiveTab] = useState<StaffTab>('staff');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', role: 'CAPTAIN' as Role, pin: '' });

  const activeStaff = staff.filter(s => s.active);
  const kpis = [
    { label: 'Total Staff', value: staff.length, color: '#6366f1' },
    { label: 'On Duty', value: activeStaff.length, color: '#10b981' },
    { label: 'Captains', value: staff.filter(s => s.role === 'CAPTAIN').length, color: '#3b82f6' },
    { label: 'Kitchen Staff', value: staff.filter(s => s.role === 'KITCHEN').length, color: '#f59e0b' },
  ];

  const handleAdd = () => {
    const newS: StaffMember = {
      id: 'S' + String(staff.length + 1).padStart(3, '0'),
      name: form.name, phone: form.phone, email: form.email, role: form.role, pin: form.pin,
      active: true, joinDate: new Date().toISOString().split('T')[0]!,
      ordersHandled: 0, revenueGenerated: 0, clockIn: '-', clockOut: '-',
    };
    setStaff(prev => [...prev, newS]);
    setShowModal(false);
    setForm({ name: '', phone: '', email: '', role: 'CAPTAIN', pin: '' });
  };

  const toggleActive = (id: string) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const TABS: { key: StaffTab; label: string }[] = [
    { key: 'staff', label: 'Staff' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'performance', label: 'Performance' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Staff</h1>
        <button onClick={() => setShowModal(true)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          + Add Staff
        </button>
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

      {/* Tabs */}
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

      {/* Staff Grid */}
      {activeTab === 'staff' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {staff.map(s => {
            const rc = ROLE_COLORS[s.role];
            return (
              <div key={s.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20, display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', background: rc.bg, color: rc.text,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0,
                }}>{getInitials(s.name)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>{s.name}</span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.active ? '#10b981' : '#ef4444', display: 'inline-block' }} />
                  </div>
                  <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: rc.bg, color: rc.text }}>{s.role}</span>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{s.phone}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.email}</div>
                  <button onClick={() => toggleActive(s.id)} style={{
                    marginTop: 8, padding: '3px 10px', borderRadius: 6, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    background: s.active ? '#fee2e2' : '#d1fae5', color: s.active ? '#991b1b' : '#065f46',
                  }}>{s.active ? 'Deactivate' : 'Activate'}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
            Today&apos;s Attendance Log
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Staff', 'Role', 'Clock In', 'Clock Out', 'Hours', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s.id}>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#1e293b' }}>{s.name}</td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: ROLE_COLORS[s.role].bg, color: ROLE_COLORS[s.role].text }}>{s.role}</span>
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{s.clockIn}</td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{s.clockOut}</td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{s.clockIn !== '-' && s.clockOut === '-' ? 'On duty' : '-'}</td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: s.active ? '#d1fae5' : '#fee2e2', color: s.active ? '#065f46' : '#991b1b' }}>
                      {s.active ? 'Present' : 'Absent'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
            Staff Performance
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Staff', 'Role', 'Orders Handled', 'Revenue Generated', 'Avg/Order'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.filter(s => s.ordersHandled > 0).sort((a, b) => b.revenueGenerated - a.revenueGenerated).map(s => (
                <tr key={s.id}>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#1e293b' }}>{s.name}</td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: ROLE_COLORS[s.role].bg, color: ROLE_COLORS[s.role].text }}>{s.role}</span>
                  </td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>{s.ordersHandled}</td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', color: '#10b981', fontWeight: 600 }}>₹{s.revenueGenerated.toLocaleString()}</td>
                  <td style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', color: '#475569' }}>
                    {s.revenueGenerated > 0 ? `₹${Math.round(s.revenueGenerated / s.ordersHandled).toLocaleString()}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Add Staff</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>x</button>
            </div>
            {[
              { label: 'Name', key: 'name', type: 'text' },
              { label: 'Phone', key: 'phone', type: 'tel' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'PIN', key: 'pin', type: 'password' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form] as string} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Role</label>
              <select value={form.role} onChange={e => setForm(prev => ({ ...prev, role: e.target.value as Role }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box', background: '#fff' }}>
                {(['OWNER', 'MANAGER', 'CAPTAIN', 'KITCHEN', 'CASHIER'] as Role[]).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button onClick={handleAdd} disabled={!form.name || !form.phone} style={{
              width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
              background: !form.name || !form.phone ? '#cbd5e1' : '#6366f1',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: !form.name || !form.phone ? 'not-allowed' : 'pointer',
            }}>Add Staff</button>
          </div>
        </div>
      )}
    </div>
  );
}
