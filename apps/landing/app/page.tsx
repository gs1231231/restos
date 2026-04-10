import type { CSSProperties } from 'react';

/* ─── colour tokens ─── */
const brand = '#6C3CE1';
const brandDark = '#5528C8';
const brandLight = '#8B5CF6';
const bg = '#fafafa';
const surface = '#ffffff';
const textPrimary = '#111827';
const textSecondary = '#6B7280';
const border = '#E5E7EB';

/* ─── helpers ─── */
const section = (extra: CSSProperties = {}): CSSProperties => ({
  padding: '80px 24px',
  maxWidth: 1200,
  margin: '0 auto',
  ...extra,
});

const heading = (extra: CSSProperties = {}): CSSProperties => ({
  fontSize: '2rem',
  fontWeight: 700,
  color: textPrimary,
  textAlign: 'center' as const,
  margin: 0,
  ...extra,
});

const sub = (extra: CSSProperties = {}): CSSProperties => ({
  fontSize: '1.125rem',
  color: textSecondary,
  textAlign: 'center' as const,
  maxWidth: 600,
  margin: '12px auto 0',
  lineHeight: 1.6,
  ...extra,
});

const btnPrimary: CSSProperties = {
  display: 'inline-block',
  padding: '16px 36px',
  background: surface,
  color: brand,
  fontWeight: 700,
  fontSize: '1.05rem',
  borderRadius: 12,
  border: 'none',
  cursor: 'pointer',
  textDecoration: 'none',
  transition: 'transform .15s',
};

const btnSecondary: CSSProperties = {
  ...btnPrimary,
  background: 'rgba(255,255,255,.15)',
  color: '#fff',
  border: '2px solid rgba(255,255,255,.35)',
};

/* ─── data ─── */
const features = [
  { icon: '💳', title: 'POS & Billing', desc: 'Lightning-fast billing with split payments, discounts, GST invoicing, and offline mode. Works on any device.' },
  { icon: '🪑', title: 'Table Management', desc: 'Visual floor plan, real-time table status, merge/split tables, and automatic cover tracking.' },
  { icon: '📱', title: 'Online Orders', desc: 'Unified dashboard for Zomato, Swiggy, and ONDC orders. Auto-accept, menu sync, and rider tracking.' },
  { icon: '🖥️', title: 'Kitchen Display', desc: 'Station-wise KDS with auto-routing, bump-bar support, and preparation time analytics.' },
  { icon: '📦', title: 'Inventory & Recipes', desc: 'Recipe costing, auto-deduction, low-stock alerts, purchase orders, and vendor management.' },
  { icon: '❤️', title: 'CRM & Loyalty', desc: 'Customer profiles, visit history, points-based loyalty, birthday offers, and WhatsApp campaigns.' },
];

const plans = [
  {
    name: 'Starter',
    price: '999',
    period: '/mo',
    desc: 'Perfect for small cafes and QSRs',
    features: ['1 Outlet', 'POS & Billing', 'Table Management', 'Basic Reports', 'Email Support', 'Menu Management'],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '2,499',
    period: '/mo',
    desc: 'For growing restaurants',
    features: ['Up to 3 Outlets', 'Everything in Starter', 'Online Order Integration', 'Kitchen Display System', 'Inventory & Recipes', 'Priority Support'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '4,999',
    period: '/mo',
    desc: 'For chains and cloud kitchens',
    features: ['Unlimited Outlets', 'Everything in Professional', 'CRM & Loyalty Program', 'Advanced Analytics', 'API Access', 'Dedicated Account Manager'],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const integrations = ['Zomato', 'Swiggy', 'ONDC', 'Razorpay', 'WhatsApp'];

/* ─── page ─── */
export default function LandingPage() {
  return (
    <div style={{ background: bg, color: textPrimary }}>
      {/* ── NAV ── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(255,255,255,.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${border}`,
          padding: '0 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}
        >
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: brand }}>RestOS</span>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {['Features', 'Pricing', 'Integrations'].map((t) => (
              <a
                key={t}
                href={`#${t.toLowerCase()}`}
                style={{ color: textSecondary, textDecoration: 'none', fontSize: '.95rem', fontWeight: 500 }}
              >
                {t}
              </a>
            ))}
            <a
              href="#pricing"
              style={{
                padding: '10px 24px',
                background: brand,
                color: '#fff',
                borderRadius: 8,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '.95rem',
              }}
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header
        style={{
          background: `linear-gradient(135deg, ${brand} 0%, #4F1D91 50%, #2D0B56 100%)`,
          padding: '160px 24px 100px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* decorative circles */}
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.04)',
            top: -150,
            right: -100,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,.03)',
            bottom: -80,
            left: -60,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 18px',
              background: 'rgba(255,255,255,.12)',
              borderRadius: 100,
              color: '#fff',
              fontSize: '.85rem',
              fontWeight: 600,
              marginBottom: 24,
              letterSpacing: '.5px',
            }}
          >
            #1 Restaurant OS in India
          </div>

          <h1 style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.08 }}>
            RestOS
          </h1>

          <p style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.65rem)', color: 'rgba(255,255,255,.9)', marginTop: 16, fontWeight: 500, lineHeight: 1.4 }}>
            Complete Restaurant Management Platform
          </p>

          <p style={{ fontSize: 'clamp(.95rem, 1.5vw, 1.15rem)', color: 'rgba(255,255,255,.6)', marginTop: 8, lineHeight: 1.6, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            POS, Billing, Kitchen Display, Online Orders, Inventory — all in one
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
            <a href="#pricing" style={btnPrimary}>Start Free Trial</a>
            <a href="#demo" style={btnSecondary}>Book Demo</a>
          </div>
        </div>
      </header>

      {/* ── STATS BAR ── */}
      <div
        style={{
          background: surface,
          borderBottom: `1px solid ${border}`,
          padding: '28px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          {[
            { value: '500+', label: 'Restaurants' },
            { value: '₹50Cr+', label: 'Processed' },
            { value: '4.8', label: 'Rating' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: brand }}>{s.value}</div>
              <div style={{ fontSize: '.9rem', color: textSecondary, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section id="features" style={section()}>
        <h2 style={heading()}>Everything your restaurant needs</h2>
        <p style={sub()}>
          One platform to run dine-in, delivery, and cloud kitchens — no more juggling five different apps.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
            marginTop: 48,
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                background: surface,
                borderRadius: 16,
                padding: 32,
                border: `1px solid ${border}`,
                transition: 'box-shadow .2s',
              }}
            >
              <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: textPrimary }}>{f.title}</h3>
              <p style={{ margin: '10px 0 0', color: textSecondary, lineHeight: 1.6, fontSize: '.95rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section
        id="pricing"
        style={{
          background: `linear-gradient(180deg, #F3F0FF 0%, ${bg} 100%)`,
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={heading()}>Simple, transparent pricing</h2>
          <p style={sub()}>No hidden fees. Cancel anytime. 14-day free trial on all plans.</p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 24,
              marginTop: 48,
              alignItems: 'start',
            }}
          >
            {plans.map((p) => (
              <div
                key={p.name}
                style={{
                  background: p.highlighted ? brand : surface,
                  color: p.highlighted ? '#fff' : textPrimary,
                  borderRadius: 20,
                  padding: '40px 32px',
                  border: p.highlighted ? 'none' : `1px solid ${border}`,
                  position: 'relative',
                  boxShadow: p.highlighted ? '0 20px 60px rgba(108,60,225,.3)' : '0 2px 8px rgba(0,0,0,.04)',
                }}
              >
                {p.highlighted && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -14,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#FBBF24',
                      color: '#000',
                      padding: '4px 18px',
                      borderRadius: 100,
                      fontSize: '.8rem',
                      fontWeight: 700,
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{p.name}</h3>
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: '.9rem',
                    opacity: 0.7,
                  }}
                >
                  {p.desc}
                </p>
                <div style={{ margin: '24px 0', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: '2.8rem', fontWeight: 800 }}>₹{p.price}</span>
                  <span style={{ fontSize: '1rem', opacity: 0.6 }}>{p.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
                  {p.features.map((ft) => (
                    <li
                      key={ft}
                      style={{
                        padding: '8px 0',
                        fontSize: '.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        borderBottom: `1px solid ${p.highlighted ? 'rgba(255,255,255,.15)' : border}`,
                      }}
                    >
                      <span style={{ color: p.highlighted ? '#A5F3FC' : '#10B981', fontWeight: 700 }}>&#10003;</span>
                      {ft}
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '14px 0',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: '1rem',
                    textDecoration: 'none',
                    background: p.highlighted ? '#fff' : brand,
                    color: p.highlighted ? brand : '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ── */}
      <section id="integrations" style={section()}>
        <h2 style={heading()}>Integrations that just work</h2>
        <p style={sub()}>Connect with the platforms your restaurant already uses.</p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 16,
            marginTop: 40,
          }}
        >
          {integrations.map((name) => {
            const colors: Record<string, string> = {
              Zomato: '#E23744',
              Swiggy: '#FC8019',
              ONDC: '#1A73E8',
              Razorpay: '#0066FF',
              WhatsApp: '#25D366',
            };
            return (
              <div
                key={name}
                style={{
                  padding: '14px 32px',
                  borderRadius: 12,
                  background: surface,
                  border: `2px solid ${colors[name] ?? border}`,
                  color: colors[name] ?? textPrimary,
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  letterSpacing: '.3px',
                }}
              >
                {name}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section
        style={{
          background: surface,
          borderTop: `1px solid ${border}`,
          borderBottom: `1px solid ${border}`,
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', color: brandLight, lineHeight: 1 }}>&ldquo;</div>
          <p style={{ fontSize: '1.2rem', lineHeight: 1.7, color: textPrimary, fontStyle: 'italic', margin: '0 0 24px' }}>
            RestOS replaced three separate apps we were using. Our billing is 2x faster, kitchen errors
            dropped by 70%, and we finally have one dashboard for Zomato and Swiggy orders. The ROI was
            obvious in the first month itself.
          </p>
          <div style={{ fontWeight: 700, color: textPrimary }}>Rajesh Malhotra</div>
          <div style={{ color: textSecondary, fontSize: '.9rem', marginTop: 4 }}>
            Owner, The Spice Route &mdash; 3 outlets, Bangalore
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section
        style={{
          background: `linear-gradient(135deg, ${brand} 0%, ${brandDark} 100%)`,
          padding: '64px 24px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, margin: 0 }}>
          Ready to modernise your restaurant?
        </h2>
        <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '1.1rem', marginTop: 8 }}>
          Start your 14-day free trial. No credit card required.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
          <a href="#" style={btnPrimary}>Start Free Trial</a>
          <a href="#" style={btnSecondary}>Book Demo</a>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: '#111',
          color: 'rgba(255,255,255,.7)',
          padding: '64px 24px 40px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 40,
          }}
        >
          {/* brand col */}
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 12 }}>RestOS</div>
            <p style={{ fontSize: '.9rem', lineHeight: 1.6, margin: 0 }}>
              Complete restaurant management platform built for Indian restaurants.
            </p>
            <div
              style={{
                display: 'inline-block',
                marginTop: 16,
                padding: '6px 14px',
                background: 'rgba(255,255,255,.08)',
                borderRadius: 8,
                fontSize: '.8rem',
                fontWeight: 600,
                color: '#F97316',
              }}
            >
              🇮🇳 Made in India
            </div>
          </div>

          {/* links */}
          {[
            { title: 'Product', items: ['POS', 'Kitchen Display', 'Online Orders', 'Inventory', 'CRM'] },
            { title: 'Company', items: ['About', 'Blog', 'Careers', 'Contact', 'Partners'] },
            { title: 'Support', items: ['Documentation', 'Help Center', 'API Reference', 'Status', 'Community'] },
          ].map((col) => (
            <div key={col.title}>
              <div style={{ fontWeight: 700, color: '#fff', marginBottom: 16, fontSize: '.95rem' }}>{col.title}</div>
              {col.items.map((item) => (
                <a
                  key={item}
                  href="#"
                  style={{
                    display: 'block',
                    color: 'rgba(255,255,255,.5)',
                    textDecoration: 'none',
                    fontSize: '.9rem',
                    padding: '5px 0',
                  }}
                >
                  {item}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* bottom row */}
        <div
          style={{
            maxWidth: 1200,
            margin: '48px auto 0',
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,.1)',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            fontSize: '.85rem',
          }}
        >
          <span>&copy; 2026 RestOS Technologies Pvt. Ltd. All rights reserved.</span>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Twitter', 'LinkedIn', 'Instagram', 'YouTube'].map((s) => (
              <a key={s} href="#" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
