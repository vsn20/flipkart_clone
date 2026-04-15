'use client';
export default function GiftCardsPage() {
  return (
    <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)', minHeight: 300 }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#212121' }}>Gift Cards</h2>
      </div>
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
        <p style={{ fontSize: 20, fontWeight: 600, color: '#212121', marginBottom: 4 }}>₹0</p>
        <p style={{ fontSize: 13, color: '#878787' }}>Gift Card Balance</p>
        <button style={{ marginTop: 16, background: '#2874f0', color: '#fff', padding: '10px 32px', border: 'none', borderRadius: 2, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          ADD GIFT CARD
        </button>
      </div>
    </div>
  );
}
