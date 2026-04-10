'use client';

import { useState } from 'react';

/* ───── Types ───── */
type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL';
type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Wallet';

interface BillItem { name: string; qty: number; price: number }
interface Bill {
  id: string; billNumber: string; orderNumber: string; table: string;
  items: BillItem[]; subtotal: number; cgst: number; sgst: number; total: number;
  status: PaymentStatus; method?: PaymentMethod; time: string;
}

/* ───── Demo Data ───── */
const SAMPLE_BILLS: Bill[] = [
  { id:'b1', billNumber:'BILL-0401', orderNumber:'#1001', table:'T-05', items:[{name:'Butter Chicken',qty:2,price:380},{name:'Garlic Naan',qty:4,price:60},{name:'Dal Makhani',qty:1,price:280}], subtotal:1280, cgst:32, sgst:32, total:1344, status:'PENDING', time:'2 min ago' },
  { id:'b2', billNumber:'BILL-0402', orderNumber:'#1003', table:'T-12', items:[{name:'Paneer Tikka',qty:1,price:320},{name:'Tandoori Roti',qty:6,price:40},{name:'Palak Paneer',qty:1,price:280}], subtotal:840, cgst:21, sgst:21, total:882, status:'PENDING', time:'12 min ago' },
  { id:'b3', billNumber:'BILL-0403', orderNumber:'#1004', table:'Counter', items:[{name:'Chole Bhature',qty:2,price:200},{name:'Lassi',qty:2,price:80}], subtotal:560, cgst:14, sgst:14, total:588, status:'PAID', method:'UPI', time:'18 min ago' },
  { id:'b4', billNumber:'BILL-0404', orderNumber:'#1006', table:'T-03', items:[{name:'Fish Tikka',qty:1,price:380},{name:'Prawn Curry',qty:1,price:420},{name:'Steamed Rice',qty:2,price:150}], subtotal:1100, cgst:27.5, sgst:27.5, total:1155, status:'PAID', method:'Card', time:'35 min ago' },
  { id:'b5', billNumber:'BILL-0405', orderNumber:'#1008', table:'T-08', items:[{name:'Chicken Tikka Masala',qty:1,price:360},{name:'Rumali Roti',qty:4,price:50},{name:'Raita',qty:1,price:50}], subtotal:610, cgst:15.25, sgst:15.25, total:640.5, status:'PENDING', time:'6 min ago' },
  { id:'b6', billNumber:'BILL-0406', orderNumber:'#1011', table:'T-15', items:[{name:'Kadhai Chicken',qty:1,price:360},{name:'Butter Naan',qty:3,price:60},{name:'Sweet Lassi',qty:2,price:90}], subtotal:720, cgst:18, sgst:18, total:756, status:'PENDING', time:'Just now' },
  { id:'b7', billNumber:'BILL-0407', orderNumber:'#1009', table:'Counter', items:[{name:'Egg Biryani',qty:1,price:280},{name:'Mirchi Ka Salan',qty:1,price:120}], subtotal:400, cgst:10, sgst:10, total:420, status:'PAID', method:'Cash', time:'10 min ago' },
  { id:'b8', billNumber:'BILL-0408', orderNumber:'#1013', table:'T-02', items:[{name:'Malai Kofta',qty:1,price:300},{name:'Jeera Rice',qty:1,price:180}], subtotal:480, cgst:12, sgst:12, total:504, status:'PARTIAL', method:'Cash', time:'22 min ago' },
  { id:'b9', billNumber:'BILL-0409', orderNumber:'#1014', table:'T-10', items:[{name:'Chicken Biryani',qty:2,price:360},{name:'Gulab Jamun',qty:4,price:60}], subtotal:960, cgst:24, sgst:24, total:1008, status:'PAID', method:'UPI', time:'40 min ago' },
  { id:'b10', billNumber:'BILL-0410', orderNumber:'#1015', table:'T-07', items:[{name:'Veg Thali',qty:3,price:250},{name:'Buttermilk',qty:3,price:60}], subtotal:930, cgst:23.25, sgst:23.25, total:976.5, status:'PENDING', time:'3 min ago' },
];

const STATUS_COLORS: Record<PaymentStatus, { bg: string; text: string }> = {
  PENDING: { bg: '#fef3c7', text: '#92400e' },
  PAID: { bg: '#d1fae5', text: '#065f46' },
  PARTIAL: { bg: '#dbeafe', text: '#1e40af' },
};

const TABS = ['Pending', 'Paid', 'All'] as const;
const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'UPI', 'Card', 'Wallet'];
const CASH_DENOMS = [2000, 500, 200, 100, 50, 20, 10];

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>(SAMPLE_BILLS);
  const [activeTab, setActiveTab] = useState<string>('Pending');
  const [paymentModal, setPaymentModal] = useState<Bill | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('Cash');
  const [cashGiven, setCashGiven] = useState(0);
  const [splitMode, setSplitMode] = useState(false);
  const [splitCount, setSplitCount] = useState(2);

  const filtered = bills.filter(b => {
    if (activeTab === 'Pending') return b.status === 'PENDING' || b.status === 'PARTIAL';
    if (activeTab === 'Paid') return b.status === 'PAID';
    return true;
  });

  const todayTotal = bills.filter(b => b.status === 'PAID').reduce((s, b) => s + b.total, 0);
  const cashTotal = bills.filter(b => b.status === 'PAID' && b.method === 'Cash').reduce((s, b) => s + b.total, 0);
  const upiTotal = bills.filter(b => b.status === 'PAID' && b.method === 'UPI').reduce((s, b) => s + b.total, 0);
  const cardTotal = bills.filter(b => b.status === 'PAID' && b.method === 'Card').reduce((s, b) => s + b.total, 0);
  const pendingCount = bills.filter(b => b.status === 'PENDING' || b.status === 'PARTIAL').length;

  const kpis = [
    { label: "Today's Collections", value: `Rs ${todayTotal.toLocaleString('en-IN')}`, color: '#10b981' },
    { label: 'Cash', value: `Rs ${cashTotal.toLocaleString('en-IN')}`, color: '#6366f1' },
    { label: 'UPI', value: `Rs ${upiTotal.toLocaleString('en-IN')}`, color: '#8b5cf6' },
    { label: 'Card', value: `Rs ${cardTotal.toLocaleString('en-IN')}`, color: '#ec4899' },
    { label: 'Pending Bills', value: pendingCount, color: '#f59e0b' },
  ];

  const collectPayment = () => {
    if (!paymentModal) return;
    setBills(prev => prev.map(b => b.id === paymentModal.id ? { ...b, status: 'PAID' as PaymentStatus, method: selectedMethod } : b));
    setPaymentModal(null);
    setCashGiven(0);
    setSplitMode(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 20px' }}>Billing & Payments</h1>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 16 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: '14px 16px' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 16, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: activeTab === t ? '#fff' : 'transparent', color: activeTab === t ? '#1e293b' : '#64748b',
            boxShadow: activeTab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {/* Bills Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {filtered.map(bill => (
          <div key={bill.id} style={{
            background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16,
            borderLeft: `4px solid ${STATUS_COLORS[bill.status].text}`,
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{bill.billNumber}</span>
              <span style={{
                padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                background: STATUS_COLORS[bill.status].bg, color: STATUS_COLORS[bill.status].text,
              }}>{bill.status}</span>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#64748b', marginBottom: 10 }}>
              <span>Order: {bill.orderNumber}</span>
              <span>Table: {bill.table}</span>
              <span>{bill.items.length} items</span>
            </div>

            {/* Amounts */}
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: 10, marginBottom: 10, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#64748b' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>Rs {bill.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#64748b' }}>CGST (2.5%)</span>
                <span>Rs {bill.cgst.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#64748b' }}>SGST (2.5%)</span>
                <span>Rs {bill.sgst.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#1e293b' }}>Rs {bill.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Time & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{bill.time}</span>
              {bill.status !== 'PAID' && (
                <button onClick={() => { setPaymentModal(bill); setCashGiven(0); setSplitMode(false); }} style={{
                  padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700, color: '#fff', background: '#10b981',
                }}>Collect Payment</button>
              )}
              {bill.status === 'PAID' && bill.method && (
                <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Paid via {bill.method}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <>
          <div onClick={() => setPaymentModal(null)} style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100,
          }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: 16, zIndex: 101, width: 480, maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)', padding: 28,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Collect Payment</h2>
              <button onClick={() => setPaymentModal(null)} style={{
                border: 'none', background: '#f1f5f9', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16,
              }}>X</button>
            </div>

            {/* Amount Due */}
            <div style={{
              textAlign: 'center', padding: 20, background: '#f0fdf4', borderRadius: 12, marginBottom: 20,
            }}>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Amount Due</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#065f46' }}>
                Rs {splitMode ? (paymentModal.total / splitCount).toFixed(0) : paymentModal.total.toLocaleString('en-IN')}
              </div>
              {splitMode && (
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  Split {splitCount} ways (Total: Rs {paymentModal.total.toLocaleString('en-IN')})
                </div>
              )}
            </div>

            {/* Split Bill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <button onClick={() => setSplitMode(!splitMode)} style={{
                padding: '6px 14px', borderRadius: 8, border: `1px solid ${splitMode ? '#6366f1' : '#e2e8f0'}`, cursor: 'pointer',
                fontSize: 12, fontWeight: 600, background: splitMode ? '#eef2ff' : '#fff', color: splitMode ? '#4f46e5' : '#64748b',
              }}>Split Bill</button>
              {splitMode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => setSplitCount(Math.max(2, splitCount - 1))} style={{
                    width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                  }}>-</button>
                  <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{splitCount}</span>
                  <button onClick={() => setSplitCount(splitCount + 1)} style={{
                    width: 28, height: 28, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700,
                  }}>+</button>
                </div>
              )}
            </div>

            {/* Payment Method Grid */}
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Payment Method</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
              {PAYMENT_METHODS.map(m => (
                <button key={m} onClick={() => setSelectedMethod(m)} style={{
                  padding: '14px 0', borderRadius: 10, border: `2px solid ${selectedMethod === m ? '#6366f1' : '#e2e8f0'}`,
                  cursor: 'pointer', fontSize: 13, fontWeight: 700, textAlign: 'center',
                  background: selectedMethod === m ? '#eef2ff' : '#fff', color: selectedMethod === m ? '#4f46e5' : '#475569',
                }}>{m}</button>
              ))}
            </div>

            {/* Cash Denominations */}
            {selectedMethod === 'Cash' && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Cash Received</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {CASH_DENOMS.map(d => (
                    <button key={d} onClick={() => setCashGiven(cashGiven + d)} style={{
                      padding: '8px 14px', borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600, background: '#f8fafc', color: '#1e293b',
                    }}>Rs {d}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: 8 }}>
                  <div>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Given: </span>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>Rs {cashGiven}</span>
                  </div>
                  <div>
                    <span style={{ fontSize: 12, color: '#64748b' }}>Change: </span>
                    <span style={{ fontWeight: 700, fontSize: 15, color: cashGiven - paymentModal.total >= 0 ? '#10b981' : '#ef4444' }}>
                      Rs {Math.max(0, cashGiven - (splitMode ? Math.ceil(paymentModal.total / splitCount) : paymentModal.total))}
                    </span>
                  </div>
                  <button onClick={() => setCashGiven(0)} style={{
                    padding: '4px 10px', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer',
                    fontSize: 11, background: '#fff', color: '#64748b',
                  }}>Clear</button>
                </div>
              </div>
            )}

            {/* UPI QR Placeholder */}
            {selectedMethod === 'UPI' && (
              <div style={{
                textAlign: 'center', padding: 24, background: '#f8fafc', borderRadius: 12, marginBottom: 20,
              }}>
                <div style={{
                  width: 160, height: 160, margin: '0 auto 12px', background: '#e2e8f0', borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13,
                }}>QR Code</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Scan to pay via UPI</div>
              </div>
            )}

            {/* Collect Button */}
            <button onClick={collectPayment} style={{
              width: '100%', padding: '14px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: 700, color: '#fff', background: '#10b981',
            }}>Collect Payment</button>
          </div>
        </>
      )}
    </div>
  );
}
