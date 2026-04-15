'use client';
import { useState, useEffect } from 'react';
import { addressAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir',
  'Ladakh','Chandigarh','Puducherry','Andaman & Nicobar Islands','Dadra & Nagar Haveli',
  'Lakshadweep',
];

const emptyForm = { name: '', phone: '', pincode: '', locality: '', address: '', city: '', state: '', landmark: '', address_type: 'home' };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [menuOpen, setMenuOpen] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await addressAPI.getAll();
      setAddresses(res.data.addresses || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAddresses(); }, []);

  // Validation
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone.trim())) e.phone = 'Enter valid 10-digit number';
    if (!form.pincode.trim()) e.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.pincode.trim())) e.pincode = 'Enter valid 6-digit pincode';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state) e.state = 'State is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors');
      return;
    }
    try {
      if (editingId) {
        await addressAPI.update(editingId, form);
        toast.success('Address updated');
      } else {
        await addressAPI.add(form);
        toast.success('Address added');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setErrors({});
      fetchAddresses();
    } catch { toast.error('Failed to save address'); }
  };

  const handleEdit = (addr) => {
    setForm({
      name: addr.name, phone: addr.phone, pincode: addr.pincode,
      locality: addr.locality || '', address: addr.address, city: addr.city,
      state: addr.state, landmark: addr.landmark || '', address_type: addr.address_type || 'home',
    });
    setEditingId(addr.id);
    setShowForm(true);
    setErrors({});
    setMenuOpen(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await addressAPI.remove(id);
      toast.success('Address deleted');
      fetchAddresses();
    } catch { toast.error('Failed to delete'); }
    setMenuOpen(null);
  };

  const pad = isMobile ? '14px' : '20px 24px';

  return (
    <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)', minHeight: 400, width: '100%' }}>
      <div style={{ padding: isMobile ? '14px' : '20px 24px', borderBottom: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, color: '#212121', margin: 0 }}>Manage Addresses</h2>
      </div>

      {/* Add New Address Button / Form */}
      <div style={{ padding: isMobile ? '0 14px' : '0 24px' }}>
        {!showForm ? (
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); setErrors({}); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '16px 0',
              background: 'none', border: 'none', borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#2874f0', textTransform: 'uppercase',
            }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
            ADD A NEW ADDRESS
          </button>
        ) : (
          <div style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ background: '#f5faff', padding: isMobile ? '14px' : '16px 20px', borderRadius: 2, border: '1px solid #2874f0' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#2874f0', marginBottom: 16, textTransform: 'uppercase' }}>
                {editingId ? 'EDIT ADDRESS' : 'ADD A NEW ADDRESS'}
              </p>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 16, marginBottom: isMobile ? 12 : 16 }}>
                  <ValidatedInput label="Name *" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} error={errors.name} />
                  <ValidatedInput label="10-digit mobile number *" value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} error={errors.phone} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 16, marginBottom: isMobile ? 12 : 16 }}>
                  <ValidatedInput label="Pincode *" value={form.pincode} onChange={v => setForm(p => ({ ...p, pincode: v }))} error={errors.pincode} />
                  <ValidatedInput label="Locality" value={form.locality} onChange={v => setForm(p => ({ ...p, locality: v }))} />
                </div>
                <div style={{ marginBottom: isMobile ? 12 : 16 }}>
                  <textarea
                    value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="Address (Area and Street) *"
                    rows={3}
                    style={{
                      width: '100%', padding: '10px 14px', border: errors.address ? '1px solid #ff6161' : '1px solid #c2c2c2', borderRadius: 2,
                      fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                    }}
                  />
                  {errors.address && <p style={{ fontSize: 11, color: '#ff6161', marginTop: 4 }}>{errors.address}</p>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 12 : 16, marginBottom: isMobile ? 12 : 16 }}>
                  <ValidatedInput label="City/District/Town *" value={form.city} onChange={v => setForm(p => ({ ...p, city: v }))} error={errors.city} />
                  <div>
                    <select
                      value={form.state}
                      onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px 14px', border: errors.state ? '1px solid #ff6161' : '1px solid #c2c2c2', borderRadius: 2,
                        fontSize: 14, color: form.state ? '#212121' : '#878787', outline: 'none', background: '#fff', boxSizing: 'border-box',
                      }}
                    >
                      <option value="">--Select State--</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p style={{ fontSize: 11, color: '#ff6161', marginTop: 4 }}>{errors.state}</p>}
                  </div>
                </div>
                <div style={{ marginBottom: isMobile ? 12 : 16 }}>
                  <ValidatedInput label="Landmark (Optional)" value={form.landmark} onChange={v => setForm(p => ({ ...p, landmark: v }))} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#212121', marginBottom: 8 }}>Address Type</p>
                  <div style={{ display: 'flex', gap: 24 }}>
                    {['Home', 'Work'].map(t => (
                      <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 14 }}>
                        <input type="radio" name="address_type" value={t.toLowerCase()}
                          checked={form.address_type === t.toLowerCase()}
                          onChange={e => setForm(p => ({ ...p, address_type: e.target.value }))}
                          style={{ accentColor: '#2874f0', width: 16, height: 16 }}
                        />
                        {t}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button type="submit"
                    style={{ background: '#2874f0', color: '#fff', padding: isMobile ? '12px 28px' : '12px 40px', border: 'none', borderRadius: 2, fontSize: 14, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase' }}>
                    SAVE
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); setErrors({}); }}
                    style={{ background: 'none', color: '#2874f0', padding: '12px 24px', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase' }}>
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Address List */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#878787' }}>Loading addresses...</div>
      ) : addresses.length === 0 && !showForm ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 16, color: '#878787', marginBottom: 8 }}>No saved addresses</p>
          <p style={{ fontSize: 13, color: '#c2c2c2' }}>Add an address for hassle-free delivery</p>
        </div>
      ) : (
        <div style={{ padding: isMobile ? '0 14px' : '0 24px' }}>
          {addresses.map(addr => (
            <div key={addr.id} style={{ padding: isMobile ? '14px 0' : '20px 0', borderBottom: '1px solid #f0f0f0', position: 'relative' }}>
              {/* Type Badge */}
              <span style={{
                display: 'inline-block', background: '#f0f0f0', color: '#878787', fontSize: 10, fontWeight: 700,
                padding: '3px 8px', borderRadius: 2, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
              }}>
                {addr.address_type || 'HOME'}
              </span>

              {/* Three-dot menu */}
              <div style={{ position: 'absolute', right: 0, top: isMobile ? 14 : 20 }}>
                <button onClick={() => setMenuOpen(menuOpen === addr.id ? null : addr.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#878787', padding: '4px 8px' }}>
                  ⋮
                </button>
                {menuOpen === addr.id && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,.15)', borderRadius: 2, zIndex: 10, minWidth: 120,
                  }}>
                    <button onClick={() => handleEdit(addr)}
                      style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#212121', textAlign: 'left' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(addr.id)}
                      style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#ff6161', textAlign: 'left' }}>
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Address Content */}
              <div style={{ paddingRight: 40 }}>
                <p style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: '#212121', marginBottom: 4 }}>
                  {addr.name}
                  <span style={{ fontWeight: 400, color: '#212121', marginLeft: isMobile ? 8 : 16 }}>{addr.phone}</span>
                </p>
                <p style={{ fontSize: isMobile ? 12 : 13, color: '#212121', lineHeight: 1.6 }}>
                  {addr.address}
                  {addr.locality && `, ${addr.locality}`}
                  , {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ValidatedInput({ label, value, onChange, error }) {
  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={label}
        style={{
          width: '100%', padding: '10px 14px', border: error ? '1px solid #ff6161' : '1px solid #c2c2c2', borderRadius: 2,
          fontSize: 14, color: '#212121', outline: 'none', boxSizing: 'border-box',
        }}
      />
      {error && <p style={{ fontSize: 11, color: '#ff6161', marginTop: 4, margin: '4px 0 0' }}>{error}</p>}
    </div>
  );
}
