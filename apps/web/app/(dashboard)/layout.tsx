'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, UtensilsCrossed, Monitor, ShoppingCart, CalendarCheck,
  BarChart3, BookOpen, Users, Package, Settings, ChevronLeft, Bell,
  Clock, LogOut, Store, Moon, Sun, ChefHat, Truck, Receipt,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tables', label: 'Tables', icon: UtensilsCrossed },
  { href: '/pos', label: 'POS', icon: Monitor },
  { href: '/billing', label: 'Billing', icon: Receipt },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/online', label: 'Online Orders', icon: Truck },
  { href: '/reservations', label: 'Bookings', icon: CalendarCheck },
  { href: '/menu', label: 'Menu', icon: BookOpen },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/staff', label: 'Staff', icon: Users },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const sidebarBg = darkMode ? '#1e293b' : '#111827';
  const headerBg = darkMode ? '#1e293b' : '#fff';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const mutedColor = darkMode ? '#94a3b8' : '#64748b';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: bg, fontFamily: 'system-ui, sans-serif', color: textColor }}>
      {/* Sidebar */}
      <aside style={{ width: collapsed ? 64 : 220, background: sidebarBg, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>R</div>
          {!collapsed && <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>RestOS</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 0' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8, marginBottom: 2, textDecoration: 'none',
                color: isActive ? '#fff' : '#94a3b8',
                background: isActive ? 'rgba(99,102,241,0.2)' : 'transparent',
                fontSize: 13, fontWeight: isActive ? 600 : 400, transition: 'all 0.15s',
              }}>
                <Icon size={20} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse */}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          padding: 12, border: 'none', background: 'none', color: '#64748b', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <ChevronLeft size={18} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{
          height: 56, background: headerBg, borderBottom: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Store size={18} style={{ color: mutedColor }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Spice Garden</span>
            <span style={{ fontSize: 11, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>OPEN</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 13, color: mutedColor, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={14} /> {time}
            </span>
            <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: mutedColor, padding: 4 }}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: mutedColor, padding: 4 }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
            </button>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>RK</div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
