'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PinLoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDigit = (d: string) => {
    if (pin.length < 4) setPin(pin + d);
  };
  const handleBackspace = () => setPin(pin.slice(0, -1));
  const handleClear = () => { setPin(''); setError(''); };

  const handleSubmit = async () => {
    if (pin.length !== 4) return;
    setError('');
    setLoading(true);
    // Demo PINs
    const demoPins: Record<string, { name: string; role: string }> = {
      '1234': { name: 'Rajesh Kumar', role: 'OWNER' },
      '2345': { name: 'Amit Sharma', role: 'MANAGER' },
      '3456': { name: 'Suresh Yadav', role: 'CAPTAIN' },
      '4567': { name: 'Kitchen Staff', role: 'KITCHEN' },
      '0000': { name: 'Demo User', role: 'CAPTAIN' },
    };

    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      localStorage.setItem('captain_token', data.token);
      localStorage.setItem('captain_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch {
      // Demo mode fallback
      const demoUser = demoPins[pin];
      if (demoUser) {
        localStorage.setItem('restos_token', 'demo-token');
        localStorage.setItem('restos_user', JSON.stringify(demoUser));
        router.push('/dashboard');
      } else {
        setError('Invalid PIN. Try: 1234 (Owner), 2345 (Manager), 3456 (Captain)');
        setPin('');
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit on 4 digits
  if (pin.length === 4 && !loading && !error) {
    setTimeout(handleSubmit, 100);
  }

  const dotStyle = (filled: boolean) => ({
    width: 20, height: 20, borderRadius: '50%', border: '2px solid #6366f1',
    background: filled ? '#6366f1' : 'transparent', margin: '0 8px',
  });

  const btnStyle = {
    width: 72, height: 72, borderRadius: '50%', border: '1px solid #e2e8f0',
    background: '#fff', fontSize: 24, fontWeight: 600 as const, cursor: 'pointer',
    display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const,
    color: '#1e293b',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>RestOS</h1>
        <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4, marginBottom: 32 }}>Enter your 4-digit PIN</p>

        {/* PIN Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          {[0, 1, 2, 3].map(i => <div key={i} style={dotStyle(i < pin.length)} />)}
        </div>

        {error && (
          <div style={{ color: '#f87171', fontSize: 13, marginBottom: 16 }}>{error}</div>
        )}

        {/* Numpad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 12, justifyContent: 'center' }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
            <button key={d} onClick={() => handleDigit(d)} style={btnStyle}>{d}</button>
          ))}
          <button onClick={handleClear} style={{ ...btnStyle, fontSize: 14, color: '#ef4444' }}>CLR</button>
          <button onClick={() => handleDigit('0')} style={btnStyle}>0</button>
          <button onClick={handleBackspace} style={{ ...btnStyle, fontSize: 18, color: '#64748b' }}>⌫</button>
        </div>

        {/* Instant demo */}
        <div style={{ marginTop: 28, padding: 16, background: 'rgba(255,255,255,0.06)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 10, textAlign: 'center' }}>INSTANT DEMO — TAP TO ENTER</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: '👑 Owner', role: 'OWNER', name: 'Rajesh Kumar' },
              { label: '📋 Manager', role: 'MANAGER', name: 'Amit Sharma' },
              { label: '🍽️ Captain', role: 'CAPTAIN', name: 'Suresh' },
            ].map(d => (
              <button key={d.role} onClick={() => {
                localStorage.setItem('restos_token', 'demo-token');
                localStorage.setItem('restos_user', JSON.stringify({ name: d.name, role: d.role }));
                router.push('/dashboard');
              }} style={{ flex: 1, padding: '10px 0', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer', color: '#e2e8f0' }}>
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16, fontSize: 13, color: '#475569' }}>
          Manager? <a href="/login" style={{ color: '#818cf8' }}>Use email login</a>
        </div>
      </div>
    </div>
  );
}
