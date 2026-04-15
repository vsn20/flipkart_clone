'use client';

export default function Footer() {
  const cols = [
    {
      title: 'ABOUT',
      links: ['Contact Us','About Us','Careers','Flipkart Stories','Press','Corporate Information'],
    },
    {
      title: 'GROUP COMPANIES',
      links: ['Myntra','Cleartrip','Shopsy'],
    },
    {
      title: 'HELP',
      links: ['Payments','Shipping','Cancellation & Returns','FAQ','Report Infringement'],
    },
    {
      title: 'CONSUMER POLICY',
      links: ['Cancellation & Returns','Terms Of Use','Security','Privacy','Sitemap','Grievance Redressal','EPR Compliance'],
    },
  ];

  return (
    <footer style={{ background: '#172337', marginTop: 8 }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '40px 20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, paddingBottom: 32, borderBottom: '1px solid #2a3f5f' }}>
          {cols.map(col => (
            <div key={col.title}>
              <h4 style={{ color: '#878787', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, marginBottom: 16 }}>{col.title}</h4>
              {col.links.map(l => (
                <p key={l}><a href="#" style={{ color: '#fff', fontSize: 13, textDecoration: 'none', lineHeight: '2.2' }}
                  onMouseEnter={e => e.target.style.textDecoration='underline'}
                  onMouseLeave={e => e.target.style.textDecoration='none'}
                >{l}</a></p>
              ))}
            </div>
          ))}

          {/* Mail & Registered */}
          <div>
            <h4 style={{ color: '#878787', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, marginBottom: 16 }}>MAIL US:</h4>
            <p style={{ color: '#fff', fontSize: 13, lineHeight: 1.8 }}>
              Flipkart Internet Private Limited,<br/>
              Buildings Alyssa, Begonia &amp;<br/>
              Cascade Towers, Embassy Tech Village,<br/>
              Outer Ring Road, Devarabeesanahalli Village,<br/>
              Bengaluru, 560103,<br/>
              Karnataka, India<br/>
              CIN: U51109KA2012PTC066107<br/>
              Telephone: <a href="tel:044-45614700" style={{ color: '#fff' }}>044-45614700</a>
            </p>
          </div>

          <div>
            <h4 style={{ color: '#878787', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, marginBottom: 16 }}>REGISTERED OFFICE ADDRESS:</h4>
            <p style={{ color: '#fff', fontSize: 13, lineHeight: 1.8 }}>
              Flipkart Internet Private Limited,<br/>
              Buildings Alyssa, Begonia &amp;<br/>
              Clove Embassy Tech Village,<br/>
              Outer Ring Road, Devarabeesanahalli Village,<br/>
              Bengaluru, 560103,<br/>
              Karnataka, India
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { icon: '🏬', label: 'Become a Seller' },
              { icon: '📢', label: 'Advertise' },
              { icon: '🎁', label: 'Gift Cards' },
              { icon: '❓', label: 'Help Center' },
            ].map(item => (
              <a key={item.label} href="#" style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#fff', fontSize: 12, textDecoration: 'none', fontWeight: 500 }}>
                <span>{item.icon}</span>{item.label}
              </a>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span style={{ color: '#fff', fontSize: 12 }}>
              © {new Date().getFullYear()} Flipkart Clone. Built for educational purposes.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
