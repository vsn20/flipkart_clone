'use client';
export default function PanPage() {
  return (
    <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)', minHeight: 300 }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#212121' }}>PAN Card Information</h2>
      </div>
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🪪</div>
        <p style={{ fontSize: 14, color: '#878787', marginBottom: 8 }}>No PAN Card details added</p>
        <p style={{ fontSize: 12, color: '#c2c2c2' }}>Add your PAN Card information for a seamless shopping experience</p>
        <button style={{ marginTop: 16, background: '#2874f0', color: '#fff', padding: '10px 32px', border: 'none', borderRadius: 2, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          ADD PAN CARD
        </button>
      </div>
    </div>
  );
}
