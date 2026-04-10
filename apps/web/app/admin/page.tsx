'use client';

import { useState } from 'react';

/* ───── Types ───── */
type PlanType = 'Free Trial' | 'Starter' | 'Growth' | 'Enterprise';
type TenantStatus = 'Active' | 'Trial' | 'Suspended' | 'Churned';

interface Tenant {
  id: string; name: string; plan: PlanType; status: TenantStatus;
  revenue: number; branches: number; lastActive: string;
}

/* ───── Demo Data ───── */
const TENANTS: Tenant[] = [
  { id:'t1', name:'Spice Garden', plan:'Growth', status:'Active', revenue:24500, branches:3, lastActive:'2 min ago' },
  { id:'t2', name:'Tandoor Express', plan:'Starter', status:'Active', revenue:8900, branches:1, lastActive:'15 min ago' },
  { id:'t3', name:'Biryani Blues', plan:'Enterprise', status:'Active', revenue:62000, branches:8, lastActive:'Just now' },
  { id:'t4', name:'Chai Point', plan:'Free Trial', status:'Trial', revenue:0, branches:1, lastActive:'1 hour ago' },
  { id:'t5', name:'Pizza Planet', plan:'Growth', status:'Active', revenue:31200, branches:4, lastActive:'5 min ago' },
  { id:'t6', name:'Dosa Corner', plan:'Starter', status:'Suspended', revenue:4200, branches:1, lastActive:'3 days ago' },
  { id:'t7', name:'Noodle Bar', plan:'Free Trial', status:'Trial', revenue:0, branches:1, lastActive:'30 min ago' },
  { id:'t8', name:'Royal Mughal', plan:'Enterprise', status:'Active', revenue:89000, branches:12, lastActive:'Just now' },
  { id:'t9', name:'Green Leaf Cafe', plan:'Starter', status:'Churned', revenue:0, branches:1, lastActive:'15 days ago' },
  { id:'t10', name:'Street Bites', plan:'Growth', status:'Active', revenue:18700, branches:2, lastActive:'10 min ago' },
];

const STATUS_COLORS: Record<TenantStatus, { bg: string; text: string }> = {
  Active: { bg: '#d1fae5', text: '#065f46' },
  Trial: { bg: '#dbeafe', text: '#1e40af' },
  Suspended: { bg: '#fef3c7', text: '#92400e' },
  Churned: { bg: '#fee2e2', text: '#991b1b' },
};

const PLAN_COLORS: Record<PlanType, string> = {
  'Free Trial': '#94a3b8', Starter: '#6366f1', Growth: '#8b5cf6', Enterprise: '#f59e0b',
};

export default function AdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>(TENANTS);

  const activeTenants = tenants.filter(t => t.status === 'Active' || t.status === 'Trial').length;
  const mrr = tenants.filter(t => t.status === 'Active').reduce((s, t) => s + t.revenue, 0);
  const newThisMonth = tenants.filter(t => t.status === 'Trial').length;

  const kpis = [
    { label: 'Total Tenants', value: tenants.length, color: '#6366f1' },
    { label: 'Active', value: activeTenants, color: '#10b981' },
    { label: 'MRR', value: `Rs ${mrr.toLocaleString('en-IN')}`, color: '#8b5cf6' },
    { label: 'New This Month', value: newThisMonth, color: '#f59e0b' },
  ];

  const healthCards = [
    { label: 'API Latency', value: '42ms', status: 'good' as const },
    { label: 'DB Connections', value: '23/100', status: 'good' as const },
    { label: 'Webhook Success', value: '99.2%', status: 'good' as const },
    { label: 'Uptime (30d)', value: '99.97%', status: 'good' as const },
  ];

  const suspendTenant = (id: string) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, status: (t.status === 'Suspended' ? 'Active' : 'Suspended') as TenantStatus } : t));
  };

  const extendTrial = (id: string) => {
    alert(`Trial extended for tenant ${id}`);
  };

  const impersonate = (id: string) => {
    const t = tenants.find(x => x.id === id);
    alert(`Impersonating: ${t?.name}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 32, fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>R</div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#1e293b' }}>Super Admin Panel</h1>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>RestOS Platform Management</p>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '16px 18px' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tenants Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1e293b' }}>Tenants</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Name', 'Plan', 'Status', 'Revenue', 'Branches', 'Last Active', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: 12, borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>{t.name}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                      color: '#fff', background: PLAN_COLORS[t.plan],
                    }}>{t.plan}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                      background: STATUS_COLORS[t.status].bg, color: STATUS_COLORS[t.status].text,
                    }}>{t.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    {t.revenue > 0 ? `Rs ${t.revenue.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{t.branches}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{t.lastActive}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => suspendTenant(t.id)} style={{
                        padding: '4px 10px', borderRadius: 6, border: '1px solid #fca5a5', cursor: 'pointer',
                        fontSize: 11, fontWeight: 600, background: '#fff', color: '#ef4444',
                      }}>{t.status === 'Suspended' ? 'Activate' : 'Suspend'}</button>
                      {t.status === 'Trial' && (
                        <button onClick={() => extendTrial(t.id)} style={{
                          padding: '4px 10px', borderRadius: 6, border: '1px solid #93c5fd', cursor: 'pointer',
                          fontSize: 11, fontWeight: 600, background: '#fff', color: '#2563eb',
                        }}>Extend</button>
                      )}
                      <button onClick={() => impersonate(t.id)} style={{
                        padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer',
                        fontSize: 11, fontWeight: 600, background: '#fff', color: '#475569',
                      }}>Impersonate</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Health */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '16px 20px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#1e293b' }}>System Health</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {healthCards.map(h => (
            <div key={h.label} style={{
              padding: 16, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0',
            }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{h.label}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: '#065f46' }}>{h.value}</span>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', background: '#10b981',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
