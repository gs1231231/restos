import Link from 'next/link';

const brand = '#6C3CE1';

const features = [
  { icon: '💳', title: 'POS & Billing', desc: 'Lightning-fast billing with GST, split payments, discounts, and offline mode.' },
  { icon: '🪑', title: 'Table Management', desc: 'Visual floor plan, real-time status, merge/split tables, QR ordering.' },
  { icon: '📱', title: 'Online Orders', desc: 'Unified Zomato, Swiggy, ONDC dashboard with auto-accept.' },
  { icon: '🖥️', title: 'Kitchen Display', desc: 'Station-wise KDS with bump-bar, timers, and sound alerts.' },
  { icon: '📦', title: 'Inventory & Recipes', desc: 'Recipe costing, auto-deduction, low-stock alerts, purchase orders.' },
  { icon: '❤️', title: 'CRM & Loyalty', desc: 'Customer profiles, loyalty points, birthday offers, WhatsApp campaigns.' },
];

const plans = [
  { name: 'Starter', price: '999', features: ['1 Outlet', 'POS & Billing', 'Table Management', 'Basic Reports', 'Email Support'], highlighted: false },
  { name: 'Professional', price: '2,499', features: ['Up to 3 Outlets', 'Online Orders', 'Kitchen Display', 'Inventory', 'Priority Support'], highlighted: true },
  { name: 'Enterprise', price: '4,999', features: ['Unlimited Outlets', 'CRM & Loyalty', 'Advanced Analytics', 'API Access', 'Dedicated Manager'], highlighted: false },
];

const demoAccounts = [
  { role: 'Owner', phone: '9876543210', password: 'demo1234', pin: '1234', desc: 'Full access — all modules' },
  { role: 'Manager', phone: '9876543211', password: 'demo1234', pin: '2345', desc: 'Operations — orders, staff, reports' },
  { role: 'Captain', phone: '9876543212', pin: '3456', desc: 'Tables, orders, KOT (PIN login)' },
];

export default function HomePage(): React.JSX.Element {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' }}>
      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e5e7eb', padding: '0 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: brand }}>RestOS</span>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <a href="#features" style={{ color: '#64748b', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Features</a>
            <a href="#pricing" style={{ color: '#64748b', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Pricing</a>
            <a href="#demo" style={{ color: '#64748b', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Demo</a>
            <Link href="/login" style={{ color: brand, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Sign In</Link>
            <Link href="/register" style={{ padding: '8px 20px', background: brand, color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header style={{ background: `linear-gradient(135deg, ${brand} 0%, #4F1D91 50%, #2D0B56 100%)`, padding: '140px 24px 100px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(255,255,255,0.12)', borderRadius: 100, color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>#1 Restaurant OS for India</div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.1 }}>Restaurant Management,<br />Simplified.</h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.3rem)', color: 'rgba(255,255,255,0.8)', marginTop: 16, lineHeight: 1.5 }}>POS, Billing, Kitchen Display, Online Orders, Inventory & CRM — all in one platform.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32, flexWrap: 'wrap' }}>
            <Link href="/register" style={{ padding: '14px 32px', background: '#fff', color: brand, borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>Start Free 14-Day Trial</Link>
            <a href="#demo" style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 15, border: '2px solid rgba(255,255,255,0.3)' }}>Try Live Demo</a>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 12 }}>No credit card required</p>
        </div>
      </header>

      {/* Stats */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 48, padding: '32px 24px', borderBottom: '1px solid #e5e7eb', background: '#fff', flexWrap: 'wrap' }}>
        {[['500+', 'Restaurants'], ['₹50Cr+', 'Processed'], ['4.8★', 'Rating'], ['99.9%', 'Uptime']].map(([val, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: brand }}>{val}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', margin: 0 }}>Everything You Need to Run Your Restaurant</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginTop: 8, fontSize: 16 }}>From dine-in to delivery, we&apos;ve got you covered.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginTop: 40 }}>
          {features.map(f => (
            <div key={f.title} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: 14, marginTop: 6, lineHeight: 1.5 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '80px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', margin: 0 }}>Simple, Transparent Pricing</h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginTop: 8 }}>Start free, upgrade as you grow.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 40 }}>
            {plans.map(p => (
              <div key={p.name} style={{ background: '#fff', border: p.highlighted ? `2px solid ${brand}` : '1px solid #e5e7eb', borderRadius: 16, padding: 32, position: 'relative' }}>
                {p.highlighted && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: brand, color: '#fff', padding: '4px 16px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>MOST POPULAR</div>}
                <h3 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{p.name}</h3>
                <div style={{ marginTop: 12 }}><span style={{ fontSize: 36, fontWeight: 800 }}>₹{p.price}</span><span style={{ color: '#64748b', fontSize: 14 }}>/month</span></div>
                <ul style={{ listStyle: 'none', padding: 0, marginTop: 20 }}>
                  {p.features.map(f => <li key={f} style={{ padding: '6px 0', fontSize: 14, color: '#374151' }}>✓ {f}</li>)}
                </ul>
                <Link href="/register" style={{ display: 'block', textAlign: 'center', padding: '12px 0', marginTop: 20, background: p.highlighted ? brand : '#f1f5f9', color: p.highlighted ? '#fff' : '#374151', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Credentials */}
      <section id="demo" style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', margin: 0 }}>Try the Live Demo</h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginTop: 8 }}>No signup needed. Use these credentials to explore.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginTop: 32 }}>
          {demoAccounts.map(a => (
            <div key={a.role} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ width: 36, height: 36, borderRadius: '50%', background: brand, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{a.role[0]}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{a.role}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{a.desc}</div>
                </div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ color: '#64748b' }}>Phone:</span><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{a.phone}</span></div>
                {a.password && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ color: '#64748b' }}>Password:</span><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{a.password}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#64748b' }}>PIN:</span><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{a.pin}</span></div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Link href="/login" style={{ flex: 1, textAlign: 'center', padding: '8px 0', background: brand, color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Sign In →</Link>
                <Link href="/pin" style={{ flex: 1, textAlign: 'center', padding: '8px 0', background: '#f1f5f9', color: '#374151', borderRadius: 6, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>PIN Login →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations */}
      <div style={{ padding: '48px 24px', background: '#f8fafc', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>Integrates with</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[['Zomato', '#E23744'], ['Swiggy', '#FC8019'], ['ONDC', '#0066FF'], ['Razorpay', '#2D5BFF'], ['WhatsApp', '#25D366']].map(([name, color]) => (
            <span key={name} style={{ padding: '8px 20px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontWeight: 600, color: color as string }}>{name}</span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '60px 24px', background: brand, textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>Ready to transform your restaurant?</h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8, fontSize: 15 }}>Join 500+ restaurants already using RestOS.</p>
        <Link href="/register" style={{ display: 'inline-block', marginTop: 24, padding: '14px 36px', background: '#fff', color: brand, borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>Start Free Trial</Link>
      </div>

      {/* Footer */}
      <footer style={{ padding: '40px 24px', background: '#111827', color: '#9ca3af', fontSize: 13 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>RestOS</span>
            <p style={{ marginTop: 8, maxWidth: 250 }}>Complete restaurant management platform. Made in India.</p>
          </div>
          <div style={{ display: 'flex', gap: 40 }}>
            <div>
              <div style={{ fontWeight: 600, color: '#fff', marginBottom: 8 }}>Product</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <a href="#features" style={{ color: '#9ca3af', textDecoration: 'none' }}>Features</a>
                <a href="#pricing" style={{ color: '#9ca3af', textDecoration: 'none' }}>Pricing</a>
                <a href="#demo" style={{ color: '#9ca3af', textDecoration: 'none' }}>Demo</a>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#fff', marginBottom: 8 }}>Support</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span>help@restos.in</span>
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: '24px auto 0', paddingTop: 16, borderTop: '1px solid #1f2937', textAlign: 'center' }}>
          © 2026 RestOS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
