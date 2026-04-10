'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// ─── Types ───────────────────────────────────────────────────────
interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  veg: boolean;
  description?: string;
}

interface CartItem extends MenuItem {
  qty: number;
}

// ─── Sample Menu Data ────────────────────────────────────────────
const CATEGORIES = ['All', 'Starters', 'Tandoor', 'Curries', 'Biryani', 'Breads', 'Chinese', 'Dosa', 'Beverages', 'Desserts'];

const MENU_ITEMS: MenuItem[] = [
  // Starters
  { id: 1, name: 'Paneer Tikka', price: 320, category: 'Starters', veg: true, description: 'Cottage cheese marinated & grilled' },
  { id: 2, name: 'Chicken 65', price: 340, category: 'Starters', veg: false, description: 'Spicy deep-fried chicken' },
  { id: 3, name: 'Veg Spring Roll', price: 220, category: 'Starters', veg: true },
  { id: 4, name: 'Fish Amritsari', price: 380, category: 'Starters', veg: false },
  { id: 5, name: 'Hara Bhara Kebab', price: 260, category: 'Starters', veg: true },
  { id: 6, name: 'Mutton Seekh Kebab', price: 420, category: 'Starters', veg: false },
  // Tandoor
  { id: 7, name: 'Tandoori Chicken (H)', price: 320, category: 'Tandoor', veg: false },
  { id: 8, name: 'Tandoori Chicken (F)', price: 560, category: 'Tandoor', veg: false },
  { id: 9, name: 'Malai Tikka', price: 360, category: 'Tandoor', veg: false },
  { id: 10, name: 'Paneer Malai Tikka', price: 300, category: 'Tandoor', veg: true },
  // Curries
  { id: 11, name: 'Butter Chicken', price: 380, category: 'Curries', veg: false, description: 'Creamy tomato-based curry' },
  { id: 12, name: 'Dal Makhani', price: 280, category: 'Curries', veg: true, description: 'Black lentils slow cooked' },
  { id: 13, name: 'Palak Paneer', price: 300, category: 'Curries', veg: true },
  { id: 14, name: 'Chicken Kadhai', price: 360, category: 'Curries', veg: false },
  { id: 15, name: 'Shahi Paneer', price: 320, category: 'Curries', veg: true },
  { id: 16, name: 'Mutton Rogan Josh', price: 440, category: 'Curries', veg: false },
  { id: 17, name: 'Chole Masala', price: 240, category: 'Curries', veg: true },
  { id: 18, name: 'Egg Curry', price: 260, category: 'Curries', veg: false },
  // Biryani
  { id: 19, name: 'Chicken Biryani', price: 360, category: 'Biryani', veg: false, description: 'Hyderabadi dum biryani' },
  { id: 20, name: 'Veg Biryani', price: 280, category: 'Biryani', veg: true },
  { id: 21, name: 'Mutton Biryani', price: 440, category: 'Biryani', veg: false },
  { id: 22, name: 'Egg Biryani', price: 300, category: 'Biryani', veg: false },
  // Breads
  { id: 23, name: 'Butter Naan', price: 50, category: 'Breads', veg: true },
  { id: 24, name: 'Garlic Naan', price: 60, category: 'Breads', veg: true },
  { id: 25, name: 'Tandoori Roti', price: 30, category: 'Breads', veg: true },
  { id: 26, name: 'Lachha Paratha', price: 60, category: 'Breads', veg: true },
  { id: 27, name: 'Cheese Naan', price: 80, category: 'Breads', veg: true },
  // Chinese
  { id: 28, name: 'Veg Manchurian', price: 260, category: 'Chinese', veg: true },
  { id: 29, name: 'Chilli Chicken', price: 320, category: 'Chinese', veg: false },
  { id: 30, name: 'Hakka Noodles', price: 240, category: 'Chinese', veg: true },
  { id: 31, name: 'Fried Rice', price: 240, category: 'Chinese', veg: true },
  // Dosa
  { id: 32, name: 'Masala Dosa', price: 180, category: 'Dosa', veg: true },
  { id: 33, name: 'Plain Dosa', price: 140, category: 'Dosa', veg: true },
  { id: 34, name: 'Mysore Masala Dosa', price: 200, category: 'Dosa', veg: true },
  { id: 35, name: 'Rava Dosa', price: 180, category: 'Dosa', veg: true },
  // Beverages
  { id: 36, name: 'Sweet Lassi', price: 80, category: 'Beverages', veg: true },
  { id: 37, name: 'Masala Chaas', price: 60, category: 'Beverages', veg: true },
  { id: 38, name: 'Fresh Lime Soda', price: 70, category: 'Beverages', veg: true },
  { id: 39, name: 'Filter Coffee', price: 60, category: 'Beverages', veg: true },
  { id: 40, name: 'Mango Lassi', price: 100, category: 'Beverages', veg: true },
  // Desserts
  { id: 41, name: 'Gulab Jamun (2)', price: 100, category: 'Desserts', veg: true },
  { id: 42, name: 'Rasmalai (2)', price: 120, category: 'Desserts', veg: true },
  { id: 43, name: 'Kulfi', price: 90, category: 'Desserts', veg: true },
  { id: 44, name: 'Gajar Ka Halwa', price: 130, category: 'Desserts', veg: true },
];

const TAX_RATE = 0.05;

// ─── Toast ───────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: '#1e293b', color: '#fff', padding: '10px 24px', borderRadius: 8,
      fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    }}>
      {message}
    </div>
  );
}

// ─── POS Inner (needs searchParams) ─────────────────────────────
function PosInner() {
  const searchParams = useSearchParams();
  const tableId = searchParams.get('tableId');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  // Filter items
  const filteredItems = MENU_ITEMS.filter(item => {
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    if (vegOnly && !item.veg) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, qty: c.qty + delta } : c);
      return updated.filter(c => c.qty > 0);
    });
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  // Styles
  const btnBase: React.CSSProperties = { border: 'none', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' };
  const btnPrimary: React.CSSProperties = { ...btnBase, background: '#6366f1', color: '#fff' };

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 116px)', margin: '-20px', padding: 0 }}>
      {/* ─── LEFT: Menu Panel ─────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px 0 16px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexShrink: 0 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
            POS {tableId && <span style={{ fontSize: 14, color: '#6366f1', fontWeight: 600 }}>&mdash; Table T{tableId}</span>}
          </h1>
        </div>

        {/* Search + Veg Toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexShrink: 0 }}>
          <input
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0',
              fontSize: 13, outline: 'none', background: '#fff',
            }}
            placeholder="Search menu items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            onClick={() => setVegOnly(!vegOnly)}
            style={{
              ...btnBase, display: 'flex', alignItems: 'center', gap: 6,
              background: vegOnly ? '#f0fdf4' : '#f1f5f9',
              color: vegOnly ? '#166534' : '#64748b',
              border: vegOnly ? '1px solid #22c55e' : '1px solid #e2e8f0',
            }}
          >
            <span style={{
              width: 10, height: 10, borderRadius: 2, display: 'inline-block',
              border: `2px solid ${vegOnly ? '#22c55e' : '#94a3b8'}`,
              background: vegOnly ? '#22c55e' : 'transparent',
            }} />
            Veg Only
          </button>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexShrink: 0, overflowX: 'auto', paddingBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                ...btnBase, fontSize: 12, whiteSpace: 'nowrap',
                background: activeCategory === cat ? '#1e293b' : '#f1f5f9',
                color: activeCategory === cat ? '#fff' : '#64748b',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 10,
          }}>
            {filteredItems.map(item => {
              const inCart = cart.find(c => c.id === item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  style={{
                    background: '#fff', borderRadius: 10,
                    border: inCart ? '2px solid #6366f1' : '1px solid #e2e8f0',
                    padding: 14, cursor: 'pointer', transition: 'border-color 0.15s, transform 0.1s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {/* Veg / Non-veg indicator */}
                  <div style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 14, height: 14, borderRadius: 3,
                    border: `2px solid ${item.veg ? '#22c55e' : '#dc2626'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: item.veg ? '#22c55e' : '#dc2626',
                    }} />
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 4, paddingRight: 20 }}>
                    {item.name}
                  </div>
                  {item.description && (
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, lineHeight: 1.3 }}>{item.description}</div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>₹{item.price}</span>
                    {inCart && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, color: '#fff', background: '#6366f1',
                        borderRadius: 6, padding: '2px 8px', minWidth: 20, textAlign: 'center',
                      }}>
                        {inCart.qty}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>
                No items found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── RIGHT: Cart Panel ────────────────────────────────── */}
      <div style={{
        width: 340, background: '#fff', borderLeft: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        {/* Cart Header */}
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Current Order</span>
            {totalItems > 0 && (
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, background: '#6366f1', color: '#fff', borderRadius: 10, padding: '2px 8px' }}>
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} style={{ ...btnBase, fontSize: 11, background: '#fee2e2', color: '#dc2626', padding: '4px 10px' }}>
              Clear
            </button>
          )}
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🛒</div>
              <p style={{ fontSize: 13 }}>Tap menu items to add to order</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Veg indicator */}
                  <div style={{
                    width: 12, height: 12, borderRadius: 2, flexShrink: 0,
                    border: `2px solid ${item.veg ? '#22c55e' : '#dc2626'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: item.veg ? '#22c55e' : '#dc2626' }} />
                  </div>
                  {/* Name + Price */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>₹{item.price} each</div>
                  </div>
                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                    <button onClick={() => updateQty(item.id, -1)} style={{
                      ...btnBase, width: 30, height: 30, padding: 0, borderRadius: 0,
                      background: '#f8fafc', color: '#64748b', fontSize: 16,
                    }}>-</button>
                    <span style={{ width: 28, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} style={{
                      ...btnBase, width: 30, height: 30, padding: 0, borderRadius: 0,
                      background: '#f8fafc', color: '#64748b', fontSize: 16,
                    }}>+</button>
                  </div>
                  {/* Line Total */}
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', minWidth: 52, textAlign: 'right' }}>
                    ₹{(item.price * item.qty).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid #e2e8f0', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: '#64748b' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: '#64748b' }}>GST (5%)</span>
              <span style={{ fontWeight: 600 }}>₹{tax.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, paddingTop: 8, borderTop: '1px solid #f1f5f9', marginBottom: 16 }}>
              <span>Total</span>
              <span>₹{total.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button style={{ ...btnPrimary, width: '100%' }} onClick={() => {
                showToast(`KOT sent to kitchen — ${totalItems} items, ₹${total.toLocaleString('en-IN')}`);
              }}>
                Send to Kitchen (KOT)
              </button>
              <button style={{ ...btnBase, width: '100%', background: '#f0fdf4', color: '#166534', border: '1px solid #22c55e' }} onClick={() => {
                showToast(`Bill generated — ₹${total.toLocaleString('en-IN')}`);
                clearCart();
              }}>
                Generate Bill
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}

// ─── Main Page (Suspense boundary for useSearchParams) ───────────
export default function PosPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading POS...</div>}>
      <PosInner />
    </Suspense>
  );
}
