export default function LandingPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: '4rem', margin: 0, fontWeight: 800 }}>RestOS</h1>
        <p style={{ fontSize: '1.5rem', opacity: 0.9, marginTop: 8 }}>Complete Restaurant Management Platform</p>
        <p style={{ fontSize: '1rem', opacity: 0.7, marginTop: 4 }}>POS, Billing, Kitchen Display, Online Orders, Inventory & more</p>
      </div>
    </div>
  );
}
