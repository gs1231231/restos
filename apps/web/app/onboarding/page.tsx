'use client';

import { useState } from 'react';

/* ───── Types ───── */
type RestaurantType = 'QSR' | 'Casual Dining' | 'Fine Dining' | 'Cafe' | 'Cloud Kitchen';

interface StepProps {
  data: OnboardingData;
  setData: (d: OnboardingData) => void;
}

interface OnboardingData {
  // Step 1
  name: string; type: RestaurantType; address: string; gstin: string; fssai: string; logo: string;
  // Step 2
  floorCount: number; tablesPerFloor: number[];
  // Step 3
  menuItems: { name: string; price: string }[];
  // Step 4
  managerName: string; managerPhone: string; managerPin: string;
  // Step 5
  zomatoEnabled: boolean; zomatoKey: string;
  swiggyEnabled: boolean; swiggyKey: string;
  whatsappEnabled: boolean; whatsappKey: string;
}

const STEPS = ['Restaurant Profile', 'Floors & Tables', 'Menu Setup', 'Staff', 'Integrations', 'Printers'];
const TYPES: RestaurantType[] = ['QSR', 'Casual Dining', 'Fine Dining', 'Cafe', 'Cloud Kitchen'];

const initialData: OnboardingData = {
  name: '', type: 'Casual Dining', address: '', gstin: '', fssai: '', logo: '',
  floorCount: 1, tablesPerFloor: [6],
  menuItems: [{ name: '', price: '' }],
  managerName: '', managerPhone: '', managerPin: '',
  zomatoEnabled: false, zomatoKey: '', swiggyEnabled: false, swiggyKey: '', whatsappEnabled: false, whatsappKey: '',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6, display: 'block' };

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);

  const canNext = () => {
    if (step === 0) return data.name.trim().length > 0;
    return true;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>R</div>
        <span style={{ fontWeight: 700, fontSize: 20, color: '#1e293b' }}>RestOS Setup</span>
      </div>

      {/* Step Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                background: i <= step ? '#6366f1' : '#e2e8f0',
                color: i <= step ? '#fff' : '#94a3b8',
              }}>{i + 1}</div>
              <span style={{ fontSize: 10, color: i <= step ? '#4f46e5' : '#94a3b8', fontWeight: 600, maxWidth: 70, textAlign: 'center' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ width: 40, height: 3, background: i < step ? '#6366f1' : '#e2e8f0', marginBottom: 16 }} />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div style={{
        background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        padding: 32, width: '100%', maxWidth: 560,
      }}>
        {/* Step 1: Restaurant Profile */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: '#1e293b' }}>Restaurant Profile</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Restaurant Name *</label>
              <input value={data.name} onChange={e => setData({ ...data, name: e.target.value })} style={inputStyle} placeholder="e.g. Spice Garden" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Restaurant Type</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TYPES.map(t => (
                  <button key={t} onClick={() => setData({ ...data, type: t })} style={{
                    padding: '8px 16px', borderRadius: 8, border: `2px solid ${data.type === t ? '#6366f1' : '#e2e8f0'}`,
                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    background: data.type === t ? '#eef2ff' : '#fff', color: data.type === t ? '#4f46e5' : '#64748b',
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Address</label>
              <textarea value={data.address} onChange={e => setData({ ...data, address: e.target.value })} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder="Full address" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>GSTIN</label>
                <input value={data.gstin} onChange={e => setData({ ...data, gstin: e.target.value })} style={inputStyle} placeholder="22AAAAA0000A1Z5" />
              </div>
              <div>
                <label style={labelStyle}>FSSAI</label>
                <input value={data.fssai} onChange={e => setData({ ...data, fssai: e.target.value })} style={inputStyle} placeholder="10020021000123" />
              </div>
            </div>
            <div style={{ marginBottom: 0 }}>
              <label style={labelStyle}>Logo</label>
              <div style={{
                border: '2px dashed #e2e8f0', borderRadius: 10, padding: 24, textAlign: 'center',
                color: '#94a3b8', fontSize: 13, cursor: 'pointer',
              }}>Click or drag to upload logo</div>
            </div>
          </div>
        )}

        {/* Step 2: Floors & Tables */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: '#1e293b' }}>Floors & Tables</h2>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Number of Floors</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => {
                  if (data.floorCount > 1) {
                    const newTables = data.tablesPerFloor.slice(0, data.floorCount - 1);
                    setData({ ...data, floorCount: data.floorCount - 1, tablesPerFloor: newTables });
                  }
                }} style={{
                  width: 36, height: 36, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
                  cursor: 'pointer', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>-</button>
                <span style={{ fontSize: 24, fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{data.floorCount}</span>
                <button onClick={() => {
                  const newTables = [...data.tablesPerFloor, 6];
                  setData({ ...data, floorCount: data.floorCount + 1, tablesPerFloor: newTables });
                }} style={{
                  width: 36, height: 36, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff',
                  cursor: 'pointer', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>+</button>
              </div>
            </div>

            {Array.from({ length: data.floorCount }).map((_, fi) => (
              <div key={fi} style={{ marginBottom: 16, padding: 16, background: '#f8fafc', borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>
                    {fi === 0 ? 'Ground Floor' : `Floor ${fi}`}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => {
                      const t = [...data.tablesPerFloor];
                      t[fi] = Math.max(1, (t[fi] || 6) - 1);
                      setData({ ...data, tablesPerFloor: t });
                    }} style={{
                      width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff',
                      cursor: 'pointer', fontSize: 14, fontWeight: 700,
                    }}>-</button>
                    <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{data.tablesPerFloor[fi] || 6}</span>
                    <button onClick={() => {
                      const t = [...data.tablesPerFloor];
                      t[fi] = (t[fi] || 6) + 1;
                      setData({ ...data, tablesPerFloor: t });
                    }} style={{
                      width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff',
                      cursor: 'pointer', fontSize: 14, fontWeight: 700,
                    }}>+</button>
                    <span style={{ fontSize: 12, color: '#64748b' }}>tables</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Array.from({ length: data.tablesPerFloor[fi] || 6 }).map((_, ti) => (
                    <div key={ti} style={{
                      padding: '6px 12px', borderRadius: 6, background: '#fff', border: '1px solid #e2e8f0',
                      fontSize: 12, fontWeight: 600, color: '#475569',
                    }}>
                      {fi === 0 ? 'G' : `F${fi}`}-T{ti + 1}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Menu Setup */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px', color: '#1e293b' }}>Menu Setup</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>Quick-add items (name + price per line), or skip this step.</p>
            {data.menuItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={item.name} onChange={e => {
                  const items = [...data.menuItems];
                  items[i] = { name: e.target.value, price: items[i]!.price };
                  setData({ ...data, menuItems: items });
                }} style={{ ...inputStyle, flex: 2 }} placeholder="Item name" />
                <input value={item.price} onChange={e => {
                  const items = [...data.menuItems];
                  items[i] = { name: items[i]!.name, price: e.target.value };
                  setData({ ...data, menuItems: items });
                }} style={{ ...inputStyle, flex: 1 }} placeholder="Price" type="number" />
                {data.menuItems.length > 1 && (
                  <button onClick={() => {
                    const items = data.menuItems.filter((_, j) => j !== i);
                    setData({ ...data, menuItems: items });
                  }} style={{
                    width: 36, height: 36, borderRadius: 8, border: '1px solid #fca5a5', background: '#fff',
                    cursor: 'pointer', fontSize: 16, color: '#ef4444', flexShrink: 0,
                  }}>X</button>
                )}
              </div>
            ))}
            <button onClick={() => setData({ ...data, menuItems: [...data.menuItems, { name: '', price: '' }] })} style={{
              padding: '8px 16px', borderRadius: 8, border: '1px dashed #cbd5e1', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, background: '#fff', color: '#6366f1', marginTop: 4,
            }}>+ Add Item</button>
          </div>
        )}

        {/* Step 4: Staff */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: '#1e293b' }}>Add Manager</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Manager Name</label>
              <input value={data.managerName} onChange={e => setData({ ...data, managerName: e.target.value })} style={inputStyle} placeholder="Full name" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Phone Number</label>
              <input value={data.managerPhone} onChange={e => setData({ ...data, managerPhone: e.target.value })} style={inputStyle} placeholder="+91 9876543210" />
            </div>
            <div style={{ marginBottom: 0 }}>
              <label style={labelStyle}>4-Digit PIN</label>
              <input value={data.managerPin} onChange={e => setData({ ...data, managerPin: e.target.value.slice(0, 4) })} style={inputStyle} placeholder="****" type="password" maxLength={4} />
            </div>
          </div>
        )}

        {/* Step 5: Integrations */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 20px', color: '#1e293b' }}>Integrations</h2>
            {([
              { key: 'zomato', label: 'Zomato', color: '#e23744', enabled: data.zomatoEnabled, apiKey: data.zomatoKey },
              { key: 'swiggy', label: 'Swiggy', color: '#fc8019', enabled: data.swiggyEnabled, apiKey: data.swiggyKey },
              { key: 'whatsapp', label: 'WhatsApp', color: '#25d366', enabled: data.whatsappEnabled, apiKey: data.whatsappKey },
            ] as const).map(intg => (
              <div key={intg.key} style={{
                padding: 16, background: '#f8fafc', borderRadius: 10, marginBottom: 12,
                borderLeft: `4px solid ${intg.enabled ? intg.color : '#e2e8f0'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: intg.enabled ? 12 : 0 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{intg.label}</span>
                  <div onClick={() => {
                    const updates: Partial<OnboardingData> = {};
                    if (intg.key === 'zomato') updates.zomatoEnabled = !data.zomatoEnabled;
                    if (intg.key === 'swiggy') updates.swiggyEnabled = !data.swiggyEnabled;
                    if (intg.key === 'whatsapp') updates.whatsappEnabled = !data.whatsappEnabled;
                    setData({ ...data, ...updates });
                  }} style={{
                    width: 44, height: 24, borderRadius: 12, background: intg.enabled ? intg.color : '#cbd5e1',
                    position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute',
                      top: 3, left: intg.enabled ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                </div>
                {intg.enabled && (
                  <input
                    value={intg.apiKey}
                    onChange={e => {
                      const updates: Partial<OnboardingData> = {};
                      if (intg.key === 'zomato') updates.zomatoKey = e.target.value;
                      if (intg.key === 'swiggy') updates.swiggyKey = e.target.value;
                      if (intg.key === 'whatsapp') updates.whatsappKey = e.target.value;
                      setData({ ...data, ...updates });
                    }}
                    style={inputStyle}
                    placeholder={`${intg.label} API Key`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Step 6: Completion */}
        {step === 5 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', background: '#d1fae5', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36,
            }}>
              &#10003;
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: '#1e293b' }}>You&apos;re All Set!</h2>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px' }}>
              Your restaurant {data.name || 'setup'} is ready. You can configure printers from Settings later.
            </p>
            <a href="/dashboard" style={{
              display: 'inline-block', padding: '14px 32px', borderRadius: 10, background: '#6366f1',
              color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none',
            }}>Go to Dashboard</a>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} style={{
              padding: '10px 24px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: step === 0 ? 'default' : 'pointer',
              fontSize: 13, fontWeight: 600, background: '#fff', color: step === 0 ? '#cbd5e1' : '#475569',
              opacity: step === 0 ? 0.5 : 1,
            }}>Back</button>
            <button onClick={() => { if (canNext()) setStep(step + 1); }} style={{
              padding: '10px 24px', borderRadius: 8, border: 'none', cursor: canNext() ? 'pointer' : 'default',
              fontSize: 13, fontWeight: 700, background: canNext() ? '#6366f1' : '#cbd5e1', color: '#fff',
            }}>{step === 4 ? 'Finish' : 'Next'}</button>
          </div>
        )}
      </div>
    </div>
  );
}
