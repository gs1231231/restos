'use client';

import { useState } from 'react';

/* ───── Types ───── */
type ReportTab = 'Dashboard' | 'Sales' | 'Items' | 'Staff' | 'Hourly';
type FoodType = 'VEG' | 'NONVEG' | 'EGG';

/* ───── Sample Data ───── */
const TODAY_STATS = {
  revenue: 87450, orders: 142, avgOrderValue: 616, covers: 198, topPayment: 'UPI (62%)',
};

const DAILY_REVENUE = [
  { day: 'Mon', date: 'Apr 4', amount: 72300 },
  { day: 'Tue', date: 'Apr 5', amount: 68900 },
  { day: 'Wed', date: 'Apr 6', amount: 81200 },
  { day: 'Thu', date: 'Apr 7', amount: 76500 },
  { day: 'Fri', date: 'Apr 8', amount: 95800 },
  { day: 'Sat', date: 'Apr 9', amount: 110400 },
  { day: 'Sun', date: 'Apr 10', amount: 87450 },
];

const ORDER_TYPE_BREAKDOWN = [
  { type: 'Dine-In', amount: 48900, count: 78, pct: 56, color: '#6366f1' },
  { type: 'Takeaway', amount: 18200, count: 32, pct: 21, color: '#f59e0b' },
  { type: 'Delivery', amount: 20350, count: 32, pct: 23, color: '#10b981' },
];

const TOP_ITEMS: { name: string; category: string; qty: number; revenue: number; foodType: FoodType }[] = [
  { name: 'Butter Chicken', category: 'Main Course', qty: 45, revenue: 17100, foodType: 'NONVEG' },
  { name: 'Chicken Biryani', category: 'Rice & Biryani', qty: 38, revenue: 13300, foodType: 'NONVEG' },
  { name: 'Paneer Tikka', category: 'Starters', qty: 35, revenue: 11200, foodType: 'VEG' },
  { name: 'Dal Makhani', category: 'Main Course', qty: 32, revenue: 8960, foodType: 'VEG' },
  { name: 'Butter Naan', category: 'Breads', qty: 120, revenue: 7200, foodType: 'VEG' },
  { name: 'Kadhai Paneer', category: 'Main Course', qty: 28, revenue: 8400, foodType: 'VEG' },
  { name: 'Tandoori Chicken', category: 'Tandoor', qty: 24, revenue: 9120, foodType: 'NONVEG' },
  { name: 'Chicken Tikka', category: 'Starters', qty: 22, revenue: 7920, foodType: 'NONVEG' },
  { name: 'Gulab Jamun', category: 'Desserts', qty: 40, revenue: 4800, foodType: 'VEG' },
  { name: 'Mango Lassi', category: 'Beverages', qty: 30, revenue: 3300, foodType: 'VEG' },
  { name: 'Jeera Rice', category: 'Rice & Biryani', qty: 28, revenue: 5040, foodType: 'VEG' },
  { name: 'Garlic Naan', category: 'Breads', qty: 65, revenue: 4550, foodType: 'VEG' },
  { name: 'Mutton Rogan Josh', category: 'Main Course', qty: 15, revenue: 6750, foodType: 'NONVEG' },
  { name: 'Chole Masala', category: 'Main Course', qty: 18, revenue: 4320, foodType: 'VEG' },
  { name: 'Tandoori Roti', category: 'Breads', qty: 90, revenue: 3600, foodType: 'VEG' },
];

const STAFF_DATA = [
  { name: 'Ravi Kumar', role: 'Captain', orders: 38, revenue: 24800, avgRating: 4.6 },
  { name: 'Amit Sharma', role: 'Captain', orders: 32, revenue: 21400, avgRating: 4.4 },
  { name: 'Priya Singh', role: 'Captain', orders: 28, revenue: 18600, avgRating: 4.8 },
  { name: 'Deepak Verma', role: 'Captain', orders: 24, revenue: 14200, avgRating: 4.2 },
  { name: 'Sunita Devi', role: 'Captain', orders: 20, revenue: 12450, avgRating: 4.5 },
];

// 24-hour heatmap: orders per hour
const HOURLY_DATA = [
  0, 0, 0, 0, 0, 0, 2, 5, 12, 8, 6, 18, 28, 22, 10, 8, 12, 18, 24, 32, 28, 18, 8, 2,
];

const FOOD_DOT: Record<FoodType, string> = { VEG: '#22c55e', NONVEG: '#ef4444', EGG: '#f59e0b' };

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>('Dashboard');
  const [dateRange, setDateRange] = useState('Last 7 Days');

  const maxRevenue = Math.max(...DAILY_REVENUE.map(d => d.amount));
  const maxHourly = Math.max(...HOURLY_DATA);

  const exportCSV = () => {
    let csv = '';
    if (tab === 'Items') {
      csv = 'Name,Category,Qty Sold,Revenue,Food Type\n';
      TOP_ITEMS.forEach(i => { csv += `${i.name},${i.category},${i.qty},${i.revenue},${i.foodType}\n`; });
    } else if (tab === 'Sales') {
      csv = 'Day,Date,Revenue\n';
      DAILY_REVENUE.forEach(d => { csv += `${d.day},${d.date},${d.amount}\n`; });
    } else if (tab === 'Staff') {
      csv = 'Name,Role,Orders,Revenue,Rating\n';
      STAFF_DATA.forEach(s => { csv += `${s.name},${s.role},${s.orders},${s.revenue},${s.avgRating}\n`; });
    } else if (tab === 'Hourly') {
      csv = 'Hour,Orders\n';
      HOURLY_DATA.forEach((v, i) => { csv += `${String(i).padStart(2, '0')}:00,${v}\n`; });
    } else {
      csv = 'Metric,Value\n';
      csv += `Revenue,${TODAY_STATS.revenue}\nOrders,${TODAY_STATS.orders}\nAvg Order Value,${TODAY_STATS.avgOrderValue}\nCovers,${TODAY_STATS.covers}\nTop Payment,${TODAY_STATS.topPayment}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `restos-${tab.toLowerCase()}-report.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const TABS: ReportTab[] = ['Dashboard', 'Sales', 'Items', 'Staff', 'Hourly'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Reports & Analytics</h1>
        <button onClick={exportCSV} style={{
          padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#475569',
        }}>Export CSV</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 20, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#1e293b' : '#64748b',
            boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}>{t}</button>
        ))}
      </div>

      {/* ──── DASHBOARD TAB ──── */}
      {tab === 'Dashboard' && (
        <>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#64748b', marginBottom: 12 }}>Today&apos;s Overview</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Revenue', value: `Rs ${TODAY_STATS.revenue.toLocaleString('en-IN')}`, color: '#6366f1', sub: '+12% vs yesterday' },
              { label: 'Orders', value: TODAY_STATS.orders, color: '#f59e0b', sub: '78 dine-in, 64 delivery' },
              { label: 'Avg Order Value', value: `Rs ${TODAY_STATS.avgOrderValue}`, color: '#10b981', sub: '+Rs 24 vs last week' },
              { label: 'Covers', value: TODAY_STATS.covers, color: '#ec4899', sub: '82% table occupancy' },
              { label: 'Top Payment', value: TODAY_STATS.topPayment, color: '#8b5cf6', sub: 'Cash 28%, Card 10%' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '18px 16px' }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Quick Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            {/* Mini bar chart */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Revenue This Week</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 140 }}>
                {DAILY_REVENUE.map(d => (
                  <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>Rs {(d.amount / 1000).toFixed(0)}k</div>
                    <div style={{
                      width: '100%', height: `${(d.amount / maxRevenue) * 100}px`, borderRadius: '6px 6px 0 0',
                      background: d.day === 'Sun' ? '#6366f1' : '#c7d2fe',
                      transition: 'height 0.3s',
                    }} />
                    <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{d.day}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order type breakdown */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Order Type Split</div>
              {/* Donut-like visualization using stacked bar */}
              <div style={{ display: 'flex', borderRadius: 20, overflow: 'hidden', height: 20, marginBottom: 16 }}>
                {ORDER_TYPE_BREAKDOWN.map(o => (
                  <div key={o.type} style={{ width: `${o.pct}%`, background: o.color, transition: 'width 0.3s' }} />
                ))}
              </div>
              {ORDER_TYPE_BREAKDOWN.map(o => (
                <div key={o.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: o.color }} />
                    <span style={{ fontSize: 13, color: '#475569' }}>{o.type}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>Rs {o.amount.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{o.count} orders ({o.pct}%)</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ──── SALES TAB ──── */}
      {tab === 'Sales' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Date Range:</span>
            {['Today', 'Last 7 Days', 'Last 30 Days', 'This Month'].map(r => (
              <button key={r} onClick={() => setDateRange(r)} style={{
                padding: '6px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: dateRange === r ? '#1e293b' : '#fff', color: dateRange === r ? '#fff' : '#64748b',
              }}>{r}</button>
            ))}
          </div>

          {/* Bar Chart */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Daily Revenue</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 200 }}>
              {DAILY_REVENUE.map(d => (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>Rs {(d.amount / 1000).toFixed(1)}k</div>
                  <div style={{
                    width: '100%', maxWidth: 60, height: `${(d.amount / maxRevenue) * 160}px`,
                    borderRadius: '8px 8px 0 0', background: `linear-gradient(180deg, #6366f1, #818cf8)`,
                    transition: 'height 0.3s',
                  }} />
                  <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{d.day}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{d.date}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#64748b' }}>
              Total: <strong style={{ color: '#1e293b' }}>Rs {DAILY_REVENUE.reduce((s, d) => s + d.amount, 0).toLocaleString('en-IN')}</strong> | Avg: <strong style={{ color: '#1e293b' }}>Rs {Math.round(DAILY_REVENUE.reduce((s, d) => s + d.amount, 0) / 7).toLocaleString('en-IN')}/day</strong>
            </div>
          </div>

          {/* Order Type Pie Chart */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Breakdown by Order Type</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {ORDER_TYPE_BREAKDOWN.map(o => (
                <div key={o.type} style={{ textAlign: 'center', padding: 16, borderRadius: 12, background: '#f8fafc' }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
                    background: `conic-gradient(${o.color} ${o.pct * 3.6}deg, #e2e8f0 0deg)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: o.color }}>{o.pct}%</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{o.type}</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Rs {o.amount.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{o.count} orders</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ──── ITEMS TAB ──── */}
      {tab === 'Items' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 700 }}>
            Top Selling Items (Today)
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>#</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Item</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Category</th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Type</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Qty Sold</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Revenue</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#64748b', fontSize: 12 }}>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {TOP_ITEMS.map((item, i) => {
                const totalRev = TOP_ITEMS.reduce((s, it) => s + it.revenue, 0);
                const pct = ((item.revenue / totalRev) * 100).toFixed(1);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: i < 3 ? '#6366f1' : '#94a3b8' }}>{i + 1}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b' }}>{item.name}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{item.category}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                        background: FOOD_DOT[item.foodType] + '20', color: FOOD_DOT[item.foodType],
                      }}>{item.foodType}</span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>{item.qty}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>Rs {item.revenue.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        <div style={{ width: 50, height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: '#6366f1' }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#64748b', minWidth: 36 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ──── STAFF TAB ──── */}
      {tab === 'Staff' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', fontSize: 14, fontWeight: 700 }}>
            Staff Performance (Today)
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Staff</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Role</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Orders</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Revenue</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#64748b', fontSize: 12 }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {STAFF_DATA.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: ['#6366f1', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'][i],
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700,
                      }}>{s.name.charAt(0)}</div>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>{s.role}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>{s.orders}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>Rs {s.revenue.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                      background: s.avgRating >= 4.5 ? '#d1fae5' : '#fef3c7',
                      color: s.avgRating >= 4.5 ? '#065f46' : '#92400e',
                    }}>{s.avgRating}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ──── HOURLY TAB ──── */}
      {tab === 'Hourly' && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Hourly Order Heatmap</div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Darker cells indicate busier hours</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6, marginBottom: 8 }}>
            {HOURLY_DATA.slice(0, 12).map((v, i) => {
              const intensity = maxHourly > 0 ? v / maxHourly : 0;
              return (
                <div key={i} style={{
                  aspectRatio: '1', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: intensity === 0 ? '#f8fafc' : `rgba(99, 102, 241, ${0.1 + intensity * 0.85})`,
                  color: intensity > 0.5 ? '#fff' : '#475569', fontSize: 16, fontWeight: 700, border: '1px solid #e2e8f0',
                }}>
                  {v}
                  <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.8 }}>{String(i).padStart(2, '0')}:00</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6, marginBottom: 20 }}>
            {HOURLY_DATA.slice(12).map((v, i) => {
              const intensity = maxHourly > 0 ? v / maxHourly : 0;
              return (
                <div key={i + 12} style={{
                  aspectRatio: '1', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: intensity === 0 ? '#f8fafc' : `rgba(99, 102, 241, ${0.1 + intensity * 0.85})`,
                  color: intensity > 0.5 ? '#fff' : '#475569', fontSize: 16, fontWeight: 700, border: '1px solid #e2e8f0',
                }}>
                  {v}
                  <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.8 }}>{String(i + 12).padStart(2, '0')}:00</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Low</span>
            {[0.1, 0.25, 0.45, 0.65, 0.85].map(op => (
              <div key={op} style={{ width: 24, height: 16, borderRadius: 4, background: `rgba(99, 102, 241, ${op})` }} />
            ))}
            <span style={{ fontSize: 12, color: '#94a3b8' }}>High</span>
          </div>

          {/* Peak Hours Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20 }}>
            {[
              { label: 'Peak Hour', value: '19:00 - 20:00', sub: '32 orders', color: '#6366f1' },
              { label: 'Lunch Rush', value: '12:00 - 13:00', sub: '28 orders', color: '#f59e0b' },
              { label: 'Quiet Period', value: '00:00 - 06:00', sub: '0 orders', color: '#94a3b8' },
            ].map(s => (
              <div key={s.label} style={{ background: '#f8fafc', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
