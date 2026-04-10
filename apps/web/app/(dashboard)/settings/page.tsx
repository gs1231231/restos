'use client';

import { useState } from 'react';

type SettingsTab = 'general' | 'tax' | 'payment' | 'printing' | 'notifications' | 'integrations';

const TABS: { key: SettingsTab; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'tax', label: 'Tax & Billing' },
  { key: 'payment', label: 'Payment' },
  { key: 'printing', label: 'Printing' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'integrations', label: 'Integrations' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [toast, setToast] = useState('');

  // General
  const [general, setGeneral] = useState({
    name: 'Spice Garden Restaurant', address: '42, MG Road, Koramangala, Bangalore - 560034',
    gstin: '29ABCDE1234F1ZK', fssai: '11234567000123', primaryColor: '#6366f1',
  });
  const [hours, setHours] = useState(
    DAYS.map(d => ({ day: d, open: '11:00', close: '23:00', closed: false }))
  );

  // Tax
  const [tax, setTax] = useState({ gstRate: '5', serviceCharge: true, serviceRate: '10', billPrefix: 'SG', autoPrint: true });

  // Payment
  const [payments, setPayments] = useState({ cash: true, upi: true, card: true, wallet: false, razorpayKey: '', razorpaySecret: '' });

  // Printing
  const [printing, setPrinting] = useState({ type: 'thermal' as 'thermal' | 'A4', paperWidth: '80', showLogo: true });

  // Notifications
  const [notif, setNotif] = useState({
    sms: true, smsKey: 'MSG91_KEY_XXX', whatsapp: true, waNumber: '919876543210',
    email: false, emailFrom: 'orders@spicegarden.in',
  });

  // Integrations
  const [integrations, setIntegrations] = useState({
    zomato: { connected: true, key: 'zom_key_xxx' },
    swiggy: { connected: false, key: '' },
    ondc: { connected: false, key: '' },
    whatsappApi: { connected: true, key: 'wa_api_xxx' },
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const inputStyle = { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' as const };
  const labelStyle = { fontSize: 12, fontWeight: 600 as const, color: '#374151', display: 'block' as const, marginBottom: 4 };
  const sectionStyle = { background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, marginBottom: 16 };

  const SaveButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} style={{ padding: '8px 24px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 16 }}>
      Save Changes
    </button>
  );

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div onClick={() => onChange(!checked)} style={{
        width: 40, height: 22, borderRadius: 11, background: checked ? '#6366f1' : '#d1d5db', cursor: 'pointer',
        position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
          left: checked ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{label}</span>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 20px' }}>Settings</h1>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#f1f5f9', borderRadius: 10, padding: 4, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            background: activeTab === t.key ? '#fff' : 'transparent',
            color: activeTab === t.key ? '#1e293b' : '#64748b',
            boxShadow: activeTab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div>
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#1e293b' }}>Restaurant Info</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Restaurant Name</label>
                <input value={general.name} onChange={e => setGeneral(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>GSTIN</label>
                <input value={general.gstin} onChange={e => setGeneral(p => ({ ...p, gstin: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>FSSAI License</label>
                <input value={general.fssai} onChange={e => setGeneral(p => ({ ...p, fssai: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Primary Color</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={general.primaryColor} onChange={e => setGeneral(p => ({ ...p, primaryColor: e.target.value }))}
                    style={{ width: 40, height: 36, border: '1px solid #d1d5db', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
                  <input value={general.primaryColor} onChange={e => setGeneral(p => ({ ...p, primaryColor: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Address</label>
              <textarea value={general.address} onChange={e => setGeneral(p => ({ ...p, address: e.target.value }))} rows={2}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Logo</label>
              <div style={{ border: '2px dashed #d1d5db', borderRadius: 8, padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}>
                Click to upload logo (PNG, JPG)
              </div>
            </div>
          </div>

          <div style={sectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#1e293b' }}>Opening Hours</h3>
            <div style={{ display: 'grid', gap: 8 }}>
              {hours.map((h, i) => (
                <div key={h.day} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                  <div style={{ width: 100, fontSize: 13, fontWeight: 500, color: '#374151' }}>{h.day}</div>
                  <div onClick={() => setHours(prev => prev.map((x, j) => j === i ? { ...x, closed: !x.closed } : x))} style={{
                    width: 36, height: 20, borderRadius: 10, background: h.closed ? '#d1d5db' : '#6366f1', cursor: 'pointer', position: 'relative',
                  }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: h.closed ? 2 : 18, transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                  </div>
                  {!h.closed ? (
                    <>
                      <input type="time" value={h.open} onChange={e => setHours(prev => prev.map((x, j) => j === i ? { ...x, open: e.target.value } : x))}
                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }} />
                      <span style={{ color: '#94a3b8', fontSize: 13 }}>to</span>
                      <input type="time" value={h.close} onChange={e => setHours(prev => prev.map((x, j) => j === i ? { ...x, close: e.target.value } : x))}
                        style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }} />
                    </>
                  ) : (
                    <span style={{ fontSize: 13, color: '#ef4444', fontWeight: 500 }}>Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <SaveButton onClick={() => showToast('General settings saved!')} />
        </div>
      )}

      {/* Tax & Billing Tab */}
      {activeTab === 'tax' && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#1e293b' }}>Tax & Billing Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={labelStyle}>Default GST Rate (%)</label>
              <input type="number" value={tax.gstRate} onChange={e => setTax(p => ({ ...p, gstRate: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Bill Prefix</label>
              <input value={tax.billPrefix} onChange={e => setTax(p => ({ ...p, billPrefix: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <Toggle checked={tax.serviceCharge} onChange={v => setTax(p => ({ ...p, serviceCharge: v }))} label="Service Charge" />
          {tax.serviceCharge && (
            <div style={{ marginBottom: 16, maxWidth: 200 }}>
              <label style={labelStyle}>Service Charge Rate (%)</label>
              <input type="number" value={tax.serviceRate} onChange={e => setTax(p => ({ ...p, serviceRate: e.target.value }))} style={inputStyle} />
            </div>
          )}
          <Toggle checked={tax.autoPrint} onChange={v => setTax(p => ({ ...p, autoPrint: v }))} label="Auto-print bill on settle" />
          <SaveButton onClick={() => showToast('Tax settings saved!')} />
        </div>
      )}

      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <div>
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#1e293b' }}>Payment Methods</h3>
            <Toggle checked={payments.cash} onChange={v => setPayments(p => ({ ...p, cash: v }))} label="Cash" />
            <Toggle checked={payments.upi} onChange={v => setPayments(p => ({ ...p, upi: v }))} label="UPI" />
            <Toggle checked={payments.card} onChange={v => setPayments(p => ({ ...p, card: v }))} label="Card" />
            <Toggle checked={payments.wallet} onChange={v => setPayments(p => ({ ...p, wallet: v }))} label="Wallet" />
          </div>
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#1e293b' }}>Razorpay Integration</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Razorpay Key ID</label>
                <input value={payments.razorpayKey} onChange={e => setPayments(p => ({ ...p, razorpayKey: e.target.value }))} placeholder="rzp_live_..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Razorpay Secret</label>
                <input type="password" value={payments.razorpaySecret} onChange={e => setPayments(p => ({ ...p, razorpaySecret: e.target.value }))} placeholder="Enter secret key" style={inputStyle} />
              </div>
            </div>
          </div>
          <SaveButton onClick={() => showToast('Payment settings saved!')} />
        </div>
      )}

      {/* Printing Tab */}
      {activeTab === 'printing' && (
        <div style={sectionStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#1e293b' }}>Printer Configuration</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Printer Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['thermal', 'A4'] as const).map(t => (
                <button key={t} onClick={() => setPrinting(p => ({ ...p, type: t }))} style={{
                  padding: '8px 24px', borderRadius: 8, border: printing.type === t ? '2px solid #6366f1' : '1px solid #d1d5db',
                  background: printing.type === t ? '#eef2ff' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  color: printing.type === t ? '#6366f1' : '#64748b',
                }}>{t === 'thermal' ? 'Thermal' : 'A4'}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16, maxWidth: 200 }}>
            <label style={labelStyle}>Paper Width (mm)</label>
            <input type="number" value={printing.paperWidth} onChange={e => setPrinting(p => ({ ...p, paperWidth: e.target.value }))} style={inputStyle} />
          </div>
          <Toggle checked={printing.showLogo} onChange={v => setPrinting(p => ({ ...p, showLogo: v }))} label="Show logo on receipt" />
          <SaveButton onClick={() => showToast('Print settings saved!')} />
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div>
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#1e293b' }}>SMS</h3>
            <Toggle checked={notif.sms} onChange={v => setNotif(p => ({ ...p, sms: v }))} label="Enable SMS Notifications" />
            {notif.sms && (
              <div style={{ maxWidth: 400 }}>
                <label style={labelStyle}>SMS API Key</label>
                <input value={notif.smsKey} onChange={e => setNotif(p => ({ ...p, smsKey: e.target.value }))} style={inputStyle} />
              </div>
            )}
          </div>
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#1e293b' }}>WhatsApp</h3>
            <Toggle checked={notif.whatsapp} onChange={v => setNotif(p => ({ ...p, whatsapp: v }))} label="Enable WhatsApp Notifications" />
            {notif.whatsapp && (
              <div style={{ maxWidth: 400 }}>
                <label style={labelStyle}>WhatsApp Business Number</label>
                <input value={notif.waNumber} onChange={e => setNotif(p => ({ ...p, waNumber: e.target.value }))} style={inputStyle} />
              </div>
            )}
          </div>
          <div style={sectionStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', color: '#1e293b' }}>Email</h3>
            <Toggle checked={notif.email} onChange={v => setNotif(p => ({ ...p, email: v }))} label="Enable Email Notifications" />
            {notif.email && (
              <div style={{ maxWidth: 400 }}>
                <label style={labelStyle}>From Email</label>
                <input value={notif.emailFrom} onChange={e => setNotif(p => ({ ...p, emailFrom: e.target.value }))} style={inputStyle} />
              </div>
            )}
          </div>
          <SaveButton onClick={() => showToast('Notification settings saved!')} />
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {([
            { key: 'zomato' as const, name: 'Zomato', desc: 'Receive orders from Zomato', color: '#e23744' },
            { key: 'swiggy' as const, name: 'Swiggy', desc: 'Receive orders from Swiggy', color: '#fc8019' },
            { key: 'ondc' as const, name: 'ONDC', desc: 'Connect to Open Network', color: '#0066ff' },
            { key: 'whatsappApi' as const, name: 'WhatsApp API', desc: 'Send notifications via WhatsApp', color: '#25d366' },
          ]).map(int => {
            const state = integrations[int.key];
            return (
              <div key={int.key} style={sectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: int.color }}>{int.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{int.desc}</div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700,
                    background: state.connected ? '#d1fae5' : '#f1f5f9',
                    color: state.connected ? '#065f46' : '#64748b',
                  }}>{state.connected ? 'Connected' : 'Disconnected'}</span>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>API Key</label>
                  <input value={state.key} onChange={e => setIntegrations(p => ({
                    ...p, [int.key]: { ...p[int.key], key: e.target.value },
                  }))} placeholder={`Enter ${int.name} API key`} style={inputStyle} />
                </div>
                <button onClick={() => {
                  setIntegrations(p => ({
                    ...p, [int.key]: { ...p[int.key], connected: !p[int.key].connected },
                  }));
                  showToast(`${int.name} ${state.connected ? 'disconnected' : 'connected'}!`);
                }} style={{
                  padding: '6px 18px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: state.connected ? '#fee2e2' : '#d1fae5',
                  color: state.connected ? '#991b1b' : '#065f46',
                }}>{state.connected ? 'Disconnect' : 'Connect'}</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#065f46', color: '#fff',
          padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 2000, animation: 'none',
        }}>{toast}</div>
      )}
    </div>
  );
}
