'use client';

import { useState, useEffect, useCallback } from 'react';

/* ─── types ─── */
type ItemStatus = 'NEW' | 'PREPARING' | 'READY';
type Station = 'HOT' | 'COLD' | 'BAR' | 'TANDOOR';
type Platform = 'Zomato' | 'Swiggy' | null;

interface KOTItem {
  id: string;
  name: string;
  qty: number;
  modifiers: string[];
  status: ItemStatus;
  station: Station;
}

interface KOT {
  id: string;
  kotNumber: number;
  table: string;
  captain: string;
  createdAt: number;          // epoch ms
  platform: Platform;
  items: KOTItem[];
}

/* ─── palette ─── */
const c = {
  bg: '#0A0A0A',
  card: '#1A1A1A',
  cardBorder: '#2A2A2A',
  text: '#F5F5F5',
  muted: '#888',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
  brand: '#6C3CE1',
  zomato: '#E23744',
  swiggy: '#FC8019',
  settingsBg: '#141414',
};

const statusColor: Record<ItemStatus, string> = { NEW: c.red, PREPARING: c.amber, READY: c.green };
const nextStatus: Record<ItemStatus, ItemStatus> = { NEW: 'PREPARING', PREPARING: 'READY', READY: 'READY' };

/* ─── elapsed helpers ─── */
function elapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function elapsedColor(ms: number) {
  const m = ms / 60000;
  if (m < 10) return c.green;
  if (m < 20) return c.amber;
  return c.red;
}

/* ─── sample data factory ─── */
function makeSampleKots(): KOT[] {
  const now = Date.now();
  return [
    {
      id: 'k1', kotNumber: 1041, table: 'Table 5', captain: 'Ravi', createdAt: now - 3 * 60000, platform: null,
      items: [
        { id: 'i1', name: 'Paneer Tikka', qty: 2, modifiers: ['Extra Spicy'], status: 'NEW', station: 'TANDOOR' },
        { id: 'i2', name: 'Dal Makhani', qty: 1, modifiers: [], status: 'NEW', station: 'HOT' },
        { id: 'i3', name: 'Butter Naan', qty: 4, modifiers: [], status: 'PREPARING', station: 'TANDOOR' },
      ],
    },
    {
      id: 'k2', kotNumber: 1042, table: 'Table 12', captain: 'Suresh', createdAt: now - 12 * 60000, platform: null,
      items: [
        { id: 'i4', name: 'Chicken Biryani', qty: 2, modifiers: ['No Onion'], status: 'PREPARING', station: 'HOT' },
        { id: 'i5', name: 'Raita', qty: 2, modifiers: [], status: 'READY', station: 'COLD' },
        { id: 'i6', name: 'Gulab Jamun', qty: 2, modifiers: [], status: 'NEW', station: 'COLD' },
      ],
    },
    {
      id: 'k3', kotNumber: 1043, table: 'Zomato #Z4821', captain: '-', createdAt: now - 22 * 60000, platform: 'Zomato',
      items: [
        { id: 'i7', name: 'Veg Thali', qty: 1, modifiers: ['No Garlic'], status: 'PREPARING', station: 'HOT' },
        { id: 'i8', name: 'Masala Papad', qty: 2, modifiers: [], status: 'READY', station: 'COLD' },
        { id: 'i9', name: 'Sweet Lassi', qty: 1, modifiers: ['Less Sugar'], status: 'NEW', station: 'COLD' },
      ],
    },
    {
      id: 'k4', kotNumber: 1044, table: 'Table 3', captain: 'Amit', createdAt: now - 7 * 60000, platform: null,
      items: [
        { id: 'i10', name: 'Tandoori Roti', qty: 6, modifiers: [], status: 'PREPARING', station: 'TANDOOR' },
        { id: 'i11', name: 'Kadhai Paneer', qty: 1, modifiers: ['Medium Spice'], status: 'NEW', station: 'HOT' },
      ],
    },
    {
      id: 'k5', kotNumber: 1045, table: 'Swiggy #S9917', captain: '-', createdAt: now - 15 * 60000, platform: 'Swiggy',
      items: [
        { id: 'i12', name: 'Butter Chicken', qty: 1, modifiers: [], status: 'READY', station: 'HOT' },
        { id: 'i13', name: 'Jeera Rice', qty: 1, modifiers: [], status: 'READY', station: 'HOT' },
        { id: 'i14', name: 'Rumali Roti', qty: 3, modifiers: [], status: 'READY', station: 'TANDOOR' },
      ],
    },
    {
      id: 'k6', kotNumber: 1046, table: 'Table 8', captain: 'Pooja', createdAt: now - 1 * 60000, platform: null,
      items: [
        { id: 'i15', name: 'Mojito', qty: 2, modifiers: ['Virgin'], status: 'NEW', station: 'BAR' },
        { id: 'i16', name: 'Blue Lagoon', qty: 1, modifiers: [], status: 'NEW', station: 'BAR' },
        { id: 'i17', name: 'Nachos Platter', qty: 1, modifiers: ['Extra Cheese'], status: 'NEW', station: 'COLD' },
      ],
    },
    {
      id: 'k7', kotNumber: 1047, table: 'Table 1', captain: 'Ravi', createdAt: now - 18 * 60000, platform: null,
      items: [
        { id: 'i18', name: 'Fish Tikka', qty: 1, modifiers: ['Boneless'], status: 'PREPARING', station: 'TANDOOR' },
        { id: 'i19', name: 'Prawn Curry', qty: 1, modifiers: [], status: 'PREPARING', station: 'HOT' },
        { id: 'i20', name: 'Naan', qty: 3, modifiers: [], status: 'NEW', station: 'TANDOOR' },
        { id: 'i21', name: 'Whiskey Sour', qty: 2, modifiers: [], status: 'READY', station: 'BAR' },
      ],
    },
    {
      id: 'k8', kotNumber: 1048, table: 'Zomato #Z4833', captain: '-', createdAt: now - 5 * 60000, platform: 'Zomato',
      items: [
        { id: 'i22', name: 'Chole Bhature', qty: 2, modifiers: [], status: 'NEW', station: 'HOT' },
        { id: 'i23', name: 'Mango Lassi', qty: 2, modifiers: [], status: 'NEW', station: 'COLD' },
      ],
    },
  ];
}

/* ─── component ─── */
export default function KitchenPage() {
  const [kots, setKots] = useState<KOT[]>(() => makeSampleKots());
  const [activeStation, setActiveStation] = useState<'ALL' | Station>('ALL');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [columns, setColumns] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedStation, setSelectedStation] = useState<'ALL' | Station>('ALL');
  const [, setTick] = useState(0);

  // auto-increment timers every second
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const bumpItem = useCallback((kotId: string, itemId: string) => {
    setKots((prev) =>
      prev.map((kot) => {
        if (kot.id !== kotId) return kot;
        return {
          ...kot,
          items: kot.items.map((item) => {
            if (item.id !== itemId) return item;
            return { ...item, status: nextStatus[item.status] };
          }),
        };
      }),
    );
  }, []);

  const applyStation = () => {
    setActiveStation(selectedStation);
    setSettingsOpen(false);
  };

  const stations: Array<'ALL' | Station> = ['ALL', 'HOT', 'COLD', 'BAR', 'TANDOOR'];

  // filter KOTs by station
  const visibleKots = kots
    .map((kot) => {
      if (activeStation === 'ALL') return kot;
      const filtered = kot.items.filter((i) => i.station === activeStation);
      return filtered.length > 0 ? { ...kot, items: filtered } : null;
    })
    .filter((k): k is KOT => k !== null);

  const now = Date.now();

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'system-ui, sans-serif', position: 'relative' }}>
      {/* ── Station filter bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 20px',
          background: '#111',
          borderBottom: `1px solid ${c.cardBorder}`,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: '1.3rem', marginRight: 16, color: c.brand }}>KDS</span>

        {stations.map((s) => {
          const active = s === activeStation;
          return (
            <button
              key={s}
              onClick={() => setActiveStation(s)}
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '.5px',
                background: active ? c.brand : '#222',
                color: active ? '#fff' : c.muted,
                transition: 'background .15s',
              }}
            >
              {s}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        {/* live count */}
        <span style={{ fontSize: '.95rem', color: c.muted, marginRight: 12 }}>
          {visibleKots.length} active KOTs
        </span>

        {/* settings gear */}
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            color: c.muted,
            padding: 4,
            lineHeight: 1,
          }}
          aria-label="Settings"
        >
          &#9881;
        </button>
      </div>

      {/* ── Settings panel ── */}
      {settingsOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 340,
            height: '100vh',
            background: c.settingsBg,
            borderLeft: `1px solid ${c.cardBorder}`,
            zIndex: 100,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Settings</h2>
            <button
              onClick={() => setSettingsOpen(false)}
              style={{ background: 'none', border: 'none', color: c.muted, fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>
          </div>

          {/* Station select */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: c.muted, fontSize: '.9rem' }}>
              Station
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {stations.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStation(s)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 8,
                    border: `1px solid ${selectedStation === s ? c.brand : c.cardBorder}`,
                    background: selectedStation === s ? c.brand : 'transparent',
                    color: selectedStation === s ? '#fff' : c.muted,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '.9rem',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: c.muted, fontSize: '.9rem' }}>
              Columns: {columns}
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={columns}
              onChange={(e) => setColumns(Number(e.target.value))}
              style={{ width: '100%', accentColor: c.brand }}
            />
          </div>

          {/* Sound toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: c.muted, fontSize: '.9rem' }}>Sound Alerts</span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                width: 52,
                height: 28,
                borderRadius: 14,
                border: 'none',
                cursor: 'pointer',
                background: soundEnabled ? c.green : '#333',
                position: 'relative',
                transition: 'background .2s',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: 3,
                  left: soundEnabled ? 27 : 3,
                  transition: 'left .2s',
                }}
              />
            </button>
          </div>

          {/* Apply */}
          <button
            onClick={applyStation}
            style={{
              padding: '14px 0',
              background: c.brand,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: 'auto',
            }}
          >
            Apply
          </button>
        </div>
      )}

      {/* ── KOT Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 16,
          padding: 20,
          alignItems: 'start',
        }}
      >
        {visibleKots.map((kot) => {
          const allReady = kot.items.every((i) => i.status === 'READY');
          const age = now - kot.createdAt;

          return (
            <div
              key={kot.id}
              style={{
                background: c.card,
                borderRadius: 14,
                border: `2px solid ${allReady ? c.green : c.cardBorder}`,
                overflow: 'hidden',
                boxShadow: allReady ? `0 0 20px ${c.green}33` : 'none',
              }}
            >
              {/* card header */}
              <div
                style={{
                  padding: '14px 18px',
                  background: allReady ? '#14532d' : '#222',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>#{kot.kotNumber}</span>
                  {kot.platform && (
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontSize: '.75rem',
                        fontWeight: 700,
                        color: '#fff',
                        background: kot.platform === 'Zomato' ? c.zomato : c.swiggy,
                      }}
                    >
                      {kot.platform}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    fontVariantNumeric: 'tabular-nums',
                    color: elapsedColor(age),
                  }}
                >
                  {elapsed(age)}
                </span>
              </div>

              {/* table + captain */}
              <div
                style={{
                  padding: '8px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${c.cardBorder}`,
                  fontSize: '.9rem',
                }}
              >
                <span style={{ fontWeight: 600 }}>{kot.table}</span>
                <span style={{ color: c.muted }}>Cpt: {kot.captain}</span>
              </div>

              {/* items */}
              <div>
                {kot.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => bumpItem(kot.id, item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      padding: '12px 18px',
                      borderBottom: `1px solid ${c.cardBorder}`,
                      background: item.status === 'READY' ? 'rgba(34,197,94,.08)' : 'transparent',
                      border: 'none',
                      color: c.text,
                      cursor: item.status === 'READY' ? 'default' : 'pointer',
                      textAlign: 'left',
                      gap: 14,
                      fontFamily: 'inherit',
                      transition: 'background .15s',
                    }}
                  >
                    {/* qty */}
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: '1.3rem',
                        minWidth: 36,
                        textAlign: 'center',
                      }}
                    >
                      {item.qty}x
                    </span>

                    {/* name + modifiers */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '1.15rem',
                          textDecoration: item.status === 'READY' ? 'line-through' : 'none',
                          opacity: item.status === 'READY' ? 0.5 : 1,
                        }}
                      >
                        {item.name}
                      </div>
                      {item.modifiers.length > 0 && (
                        <div style={{ fontSize: '.85rem', color: c.amber, marginTop: 2 }}>
                          {item.modifiers.join(', ')}
                        </div>
                      )}
                    </div>

                    {/* station badge */}
                    <span
                      style={{
                        fontSize: '.7rem',
                        fontWeight: 700,
                        color: c.muted,
                        background: '#222',
                        padding: '3px 8px',
                        borderRadius: 4,
                        letterSpacing: '.5px',
                      }}
                    >
                      {item.station}
                    </span>

                    {/* status dot */}
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: statusColor[item.status],
                        flexShrink: 0,
                        boxShadow: `0 0 8px ${statusColor[item.status]}66`,
                      }}
                      title={item.status}
                    />
                  </button>
                ))}
              </div>

              {/* footer status */}
              {allReady && (
                <div
                  style={{
                    padding: '10px 18px',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: c.green,
                    background: 'rgba(34,197,94,.1)',
                    letterSpacing: '.5px',
                  }}
                >
                  ALL ITEMS READY
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
