export default function DashboardPage() {
  const stats = [
    { label: "Today's Revenue", value: '₹24,580', change: '+12%', color: '#6366f1' },
    { label: 'Orders', value: '47', change: '+8%', color: '#10b981' },
    { label: 'Avg Order Value', value: '₹523', change: '+3%', color: '#f59e0b' },
    { label: 'Occupancy', value: '73%', change: '', color: '#ec4899' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 20px' }}>Dashboard</h1>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{s.value}</div>
            {s.change && <div style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>{s.change} vs yesterday</div>}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'New Order', emoji: '🛒', href: '/pos' },
          { label: 'View Tables', emoji: '🍽️', href: '/tables' },
          { label: 'Kitchen View', emoji: '👨‍🍳', href: '/orders' },
          { label: 'Reservations', emoji: '📅', href: '/reservations' },
          { label: 'Reports', emoji: '📊', href: '/reports' },
          { label: 'Menu', emoji: '📖', href: '/menu' },
        ].map(a => (
          <a key={a.label} href={a.href} style={{ padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center', textDecoration: 'none', color: '#1e293b' }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{a.emoji}</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</div>
          </a>
        ))}
      </div>

      {/* Recent Orders Placeholder */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>Recent Orders</h2>
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🍽️</div>
          <p style={{ fontSize: 14 }}>No orders today yet. Start taking orders from the POS.</p>
        </div>
      </div>
    </div>
  );
}
