'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', gender: '' });
  const [emailForm, setEmailForm] = useState('');
  const [phoneForm, setPhoneForm] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ');
      setForm({
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || '',
        gender: user.gender || '',
      });
      setEmailForm(user.email || '');
      setPhoneForm(user.phone || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      const name = `${form.firstName} ${form.lastName}`.trim();
      await authAPI.updateProfile({ name, gender: form.gender });
      updateUser({ name, gender: form.gender });
      setEditing(false);
      toast.success('Profile updated');
    } catch { toast.error('Update failed'); }
  };

  const handleSaveEmail = async () => {
    setEditingEmail(false);
    toast.success('Email saved');
  };

  const handleSavePhone = async () => {
    try {
      await authAPI.updateProfile({ phone: phoneForm });
      updateUser({ phone: phoneForm });
      setEditingPhone(false);
      toast.success('Phone number updated');
    } catch { toast.error('Update failed'); }
  };

  if (!user) return null;

  const sectionPad = isMobile ? '16px 14px' : '24px 32px';
  const inputMaxW = isMobile ? '100%' : 250;

  return (
    <div style={{ background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.08)', width: '100%' }}>
      {/* Personal Information */}
      <div style={{ padding: sectionPad, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: isMobile ? 16 : 24, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, color: '#212121', margin: 0 }}>Personal Information</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)}
              style={{ fontSize: 13, color: '#2874f0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Edit
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSaveProfile}
                style={{ fontSize: 13, color: '#fff', fontWeight: 600, background: '#2874f0', border: 'none', cursor: 'pointer', padding: '6px 20px', borderRadius: 2 }}>
                Save
              </button>
              <button onClick={() => setEditing(false)}
                style={{ fontSize: 13, color: '#212121', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Name Fields */}
        <div style={{ display: 'flex', gap: isMobile ? 10 : 16, marginBottom: isMobile ? 16 : 24, flexDirection: isMobile ? 'column' : 'row' }}>
          <div style={{ flex: 1, maxWidth: inputMaxW }}>
            <input
              type="text"
              value={form.firstName}
              onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
              disabled={!editing}
              placeholder="First Name"
              style={{
                width: '100%', padding: '12px 14px', border: '1px solid #c2c2c2', borderRadius: 2,
                fontSize: 14, color: '#212121', outline: 'none', background: editing ? '#fff' : '#f5f5f5',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ flex: 1, maxWidth: inputMaxW }}>
            <input
              type="text"
              value={form.lastName}
              onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
              disabled={!editing}
              placeholder="Last Name"
              style={{
                width: '100%', padding: '12px 14px', border: '1px solid #c2c2c2', borderRadius: 2,
                fontSize: 14, color: '#212121', outline: 'none', background: editing ? '#fff' : '#f5f5f5',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Gender */}
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#212121', marginBottom: 8 }}>Your Gender</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Male', 'Female'].map(g => (
              <label key={g} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: editing ? 'pointer' : 'default', fontSize: 14, color: '#212121' }}>
                <input
                  type="radio"
                  name="gender"
                  value={g.toLowerCase()}
                  checked={form.gender === g.toLowerCase()}
                  onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                  disabled={!editing}
                  style={{ accentColor: '#2874f0', width: 16, height: 16 }}
                />
                {g}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Email Address */}
      <div style={{ padding: sectionPad, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 600, color: '#212121', margin: 0 }}>Email Address</h3>
          {!editingEmail ? (
            <button onClick={() => setEditingEmail(true)}
              style={{ fontSize: 13, color: '#2874f0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Edit
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSaveEmail}
                style={{ fontSize: 13, color: '#fff', fontWeight: 600, background: '#2874f0', border: 'none', cursor: 'pointer', padding: '6px 20px', borderRadius: 2 }}>
                Save
              </button>
              <button onClick={() => setEditingEmail(false)}
                style={{ fontSize: 13, color: '#212121', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          )}
        </div>
        <input
          type="email"
          value={emailForm}
          onChange={e => setEmailForm(e.target.value)}
          disabled={!editingEmail}
          style={{
            width: '100%', maxWidth: inputMaxW, padding: '12px 14px', border: '1px solid #c2c2c2', borderRadius: 2,
            fontSize: 14, color: '#212121', outline: 'none', background: editingEmail ? '#fff' : '#f5f5f5',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Mobile Number */}
      <div style={{ padding: sectionPad, borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 600, color: '#212121', margin: 0 }}>Mobile Number</h3>
          {!editingPhone ? (
            <button onClick={() => setEditingPhone(true)}
              style={{ fontSize: 13, color: '#2874f0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Edit
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSavePhone}
                style={{ fontSize: 13, color: '#fff', fontWeight: 600, background: '#2874f0', border: 'none', cursor: 'pointer', padding: '6px 20px', borderRadius: 2 }}>
                Save
              </button>
              <button onClick={() => setEditingPhone(false)}
                style={{ fontSize: 13, color: '#212121', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          )}
        </div>
        <input
          type="tel"
          value={phoneForm}
          onChange={e => setPhoneForm(e.target.value)}
          disabled={!editingPhone}
          placeholder="Add phone number"
          style={{
            width: '100%', maxWidth: inputMaxW, padding: '12px 14px', border: '1px solid #c2c2c2', borderRadius: 2,
            fontSize: 14, color: '#212121', outline: 'none', background: editingPhone ? '#fff' : '#f5f5f5',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* FAQs */}
      <div style={{ padding: sectionPad }}>
        <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, color: '#212121', marginBottom: 16 }}>FAQs</h3>
        {[
          {
            q: 'What happens when I update my email address (or mobile number)?',
            a: 'Your login email id (or mobile number) changes, likewise. You\'ll receive all your account related communication on your updated email address (or mobile number).',
          },
          {
            q: 'When will my Flipkart account be updated with the new email address (or mobile number)?',
            a: 'It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes.',
          },
          {
            q: 'What happens to my existing Flipkart account when I update my email address (or mobile number)?',
            a: 'Updating your email address (or mobile number) doesn\'t invalidate your existing Flipkart account. Your account remains fully functional.',
          },
          {
            q: 'Does my Seller account get affected when I update my email address?',
            a: 'Flipkart has a single sign-on. Any changes will reflect in your Seller account also.',
          },
        ].map((faq, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <p style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: '#212121', marginBottom: 4 }}>{faq.q}</p>
            <p style={{ fontSize: isMobile ? 12 : 13, color: '#878787', lineHeight: 1.6 }}>{faq.a}</p>
          </div>
        ))}

        {/* Deactivate */}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#ff6161', fontWeight: 600 }}>
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  );
}
