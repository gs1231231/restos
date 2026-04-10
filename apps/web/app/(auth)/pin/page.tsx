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
    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid PIN');
        setPin('');
      } else {
        localStorage.setItem('captain_token', data.token);
        localStorage.setItem('captain_user', JSON.stringify(data.user));
        router.push('/dashboard');
      }
    } catch {
      setError('Connection failed');
      setPin('');
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

        <div style={{ marginTop: 32, fontSize: 13, color: '#475569' }}>
          Manager? <a href="/login" style={{ color: '#818cf8' }}>Use email login</a>
        </div>
      </div>
    </div>
  );
}
