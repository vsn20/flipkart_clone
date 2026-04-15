'use client';
export default function SavedUPIPage() {
  return (
    <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)', minHeight: 300 }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#212121' }}>Saved UPI</h2>
      </div>
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📱</div>
        <p style={{ fontSize: 14, color: '#878787' }}>No UPI IDs saved</p>
        <p style={{ fontSize: 12, color: '#c2c2c2', marginTop: 4 }}>Save your UPI IDs for faster checkout</p>
      </div>
    </div>
  );
}
