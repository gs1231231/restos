'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const brand = '#6C3CE1';
const restaurantTypes = ['Quick Service (QSR)', 'Casual Dining', 'Fine Dining', 'Cafe / Bakery', 'Cloud Kitchen', 'Bar / Lounge', 'Dhaba', 'Sweet Shop'];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', restaurantName: '', restaurantType: '', city: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

  const handleSubmit = () => {
    setLoading(true);
    // Demo mode — save to localStorage and redirect
    setTimeout(() => {
      localStorage.setItem('restos_user', JSON.stringify({
        name: form.name, phone: form.phone, email: form.email, role: 'OWNER',
        restaurantName: form.restaurantName, restaurantType: form.restaurantType, city: form.city,
      }));
      localStorage.setItem('restos_token', 'demo-token');
      router.push('/dashboard');
    }, 1000);
  };

  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const };
  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600 as const, color: '#374151', marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, sans-serif' }}>
      {/* Left — Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: brand }}>RestOS</span>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '16px 0 4px', color: '#1e293b' }}>
            {step === 1 ? 'Create your account' : 'Tell us about your restaurant'}
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
            {step === 1 ? '14-day free trial. No credit card required.' : 'We\'ll set up your dashboard.'}
          </p>

          {/* Step Indicator */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? brand : '#e5e7eb' }} />
            ))}
          </div>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={labelStyle}>Full Name *</label>
                <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="Rajesh Kumar" style={inputStyle} required /></div>
              <div><label style={labelStyle}>Phone Number *</label>
                <input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="9876543210" type="tel" style={inputStyle} required /></div>
              <div><label style={labelStyle}>Email</label>
                <input value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@restaurant.com" type="email" style={inputStyle} /></div>
              <div><label style={labelStyle}>Password *</label>
                <input value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min 6 characters" type="password" style={inputStyle} required /></div>
              <button onClick={() => { if (form.name && form.phone && form.password) setStep(2); }} style={{ width: '100%', padding: '12px 0', background: brand, color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={labelStyle}>Restaurant Name *</label>
                <input value={form.restaurantName} onChange={e => update('restaurantName', e.target.value)} placeholder="Spice Garden" style={inputStyle} required /></div>
              <div><label style={labelStyle}>Restaurant Type *</label>
                <select value={form.restaurantType} onChange={e => update('restaurantType', e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
                  <option value="">Select type</option>
                  {restaurantTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select></div>
              <div><label style={labelStyle}>City *</label>
                <input value={form.city} onChange={e => update('city', e.target.value)} placeholder="Jaipur" style={inputStyle} required /></div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '12px 0', background: '#f1f5f9', color: '#374151', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>← Back</button>
                <button onClick={handleSubmit} disabled={loading || !form.restaurantName || !form.city} style={{ flex: 2, padding: '12px 0', background: loading ? '#94a3b8' : brand, color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Setting up...' : 'Launch My Restaurant 🚀'}
                </button>
              </div>
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', marginTop: 20 }}>
            Already have an account? <Link href="/login" style={{ color: brand, fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>

      {/* Right — Branding */}
      <div style={{ flex: 1, background: `linear-gradient(135deg, ${brand} 0%, #2D0B56 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, minHeight: '100vh' }}>
        <div style={{ color: '#fff', maxWidth: 400 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>Join 500+ restaurants</h2>
          <p style={{ fontSize: 16, opacity: 0.8, marginTop: 12, lineHeight: 1.6 }}>RestOS helps you manage tables, orders, billing, kitchen, inventory, and customers — all from one platform.</p>
          <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['Set up in 5 minutes', 'No hardware needed', 'Works on any device', '₹0 for 14 days'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</span>
                {t}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 40, padding: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 12 }}>
            <p style={{ fontSize: 14, fontStyle: 'italic', opacity: 0.9, margin: 0 }}>&quot;RestOS transformed how we manage our 3 outlets. Billing is 2x faster, kitchen errors dropped 80%.&quot;</p>
            <p style={{ fontSize: 13, opacity: 0.6, marginTop: 8 }}>— Rakesh Sharma, Spice Route Restaurants, Jaipur</p>
          </div>
        </div>
      </div>
    </div>
  );
}
