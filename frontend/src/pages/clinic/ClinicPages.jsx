import { useState, useEffect } from 'react';
import api from '../../utils/api';

// ClinicAbout.jsx
export function ClinicAbout({ clinic }) {
  return (
    <div>
      <div style={{ background: 'var(--cp)', padding: '60px 0' }}>
        <div className="clinic-container">
          <div className="clinic-section-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>About Us</div>
          <h1 style={{ color: 'white', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900 }}>{clinic.clinic_name}</h1>
          {clinic.tagline && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginTop: 8 }}>{clinic.tagline}</p>}
        </div>
      </div>

      <section className="clinic-section">
        <div className="clinic-container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div className="clinic-section-eyebrow">Our Story</div>
              <h2 className="clinic-section-title" style={{ textAlign: 'left', margin: '8px 0 20px' }}>About {clinic.clinic_name}</h2>
              <p style={{ fontSize: 15, color: '#4B5563', lineHeight: 1.8 }}>{clinic.about_us || 'We are committed to providing exceptional healthcare services to our community with compassion, expertise, and the latest medical technologies.'}</p>
              {clinic.established_year && (
                <div style={{ marginTop: 24, display: 'flex', gap: 24 }}>
                  <div style={{ textAlign: 'center', padding: '16px 24px', background: '#F8FAFF', borderRadius: 12, border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--cp)', fontFamily: 'var(--font-heading)' }}>{new Date().getFullYear() - clinic.established_year}+</div>
                    <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>Years of Excellence</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px 24px', background: '#F8FAFF', borderRadius: 12, border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--cp)', fontFamily: 'var(--font-heading)' }}>{clinic.total_doctors || '10'}+</div>
                    <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>Expert Doctors</div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ background: 'linear-gradient(135deg, var(--cp)15, var(--cs)15)', borderRadius: 20, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 80 }}>🏥</div>
              <h3 style={{ marginTop: 16, fontSize: 20, fontWeight: 800 }}>{clinic.clinic_name}</h3>
              {clinic.city && <p style={{ color: '#6B7280', marginTop: 4 }}>📍 {clinic.city}, {clinic.state}</p>}
              {clinic.registration_number && <div style={{ marginTop: 16, padding: '10px 16px', background: 'white', borderRadius: 10, fontSize: 13 }}>Reg. No: {clinic.registration_number}</div>}
            </div>
          </div>
        </div>
      </section>

      {(clinic.mission || clinic.vision) && (
        <section className="clinic-section clinic-section-alt">
          <div className="clinic-container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              {clinic.mission && (
                <div style={{ background: 'white', borderRadius: 16, padding: 32, border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Our Mission</h3>
                  <p style={{ color: '#4B5563', lineHeight: 1.7 }}>{clinic.mission}</p>
                </div>
              )}
              {clinic.vision && (
                <div style={{ background: 'white', borderRadius: 16, padding: 32, border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔭</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Our Vision</h3>
                  <p style={{ color: '#4B5563', lineHeight: 1.7 }}>{clinic.vision}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {clinic.certifications?.length > 0 && (
        <section className="clinic-section">
          <div className="clinic-container">
            <div className="clinic-section-header">
              <div className="clinic-section-eyebrow">Accreditations</div>
              <h2 className="clinic-section-title">Certifications & Awards</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {clinic.certifications.map(c => (
                <div key={c.id} style={{ background: 'white', borderRadius: 14, padding: 24, border: '1px solid #E5E7EB', display: 'flex', gap: 14 }}>
                  <div style={{ fontSize: 32, flexShrink: 0 }}>🏅</div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.title}</div>
                    <div style={{ fontSize: 13, color: '#6B7280' }}>{c.issuing_authority}</div>
                    {c.certificate_number && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>#{c.certificate_number}</div>}
                    {c.expiry_date && <div style={{ fontSize: 12, color: '#9CA3AF' }}>Valid till: {new Date(c.expiry_date).toLocaleDateString('en-IN')}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ClinicDoctors.jsx
export function ClinicDoctors({ clinic, onBook }) {
  const [doctors, setDoctors] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.get(`/clinic/${clinic.id}/doctors`).then(setDoctors).catch(() => {});
  }, [clinic.id]);

  const specs = ['All', ...new Set(doctors.map(d => d.specialization))];
  const filtered = filter === 'All' ? doctors : doctors.filter(d => d.specialization === filter);

  return (
    <div>
      <div style={{ background: 'var(--cp)', padding: '60px 0' }}>
        <div className="clinic-container">
          <div className="clinic-section-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>Our Team</div>
          <h1 style={{ color: 'white', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900 }}>Meet Our Doctors</h1>
        </div>
      </div>

      <section className="clinic-section">
        <div className="clinic-container">
          {specs.length > 2 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
              {specs.map(s => (
                <button key={s} onClick={() => setFilter(s)} style={{ padding: '7px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: '1.5px solid', borderColor: filter === s ? 'var(--cp)' : '#E5E7EB', background: filter === s ? 'var(--cp)' : 'white', color: filter === s ? 'white' : '#6B7280', cursor: 'pointer', transition: 'all 0.15s' }}>
                  {s}
                </button>
              ))}
            </div>
          )}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>No doctors found</div>
          ) : (
            <div className="clinic-doctors-grid">
              {filtered.map(d => (
                <div key={d.id} className="clinic-doctor-card">
                  <div className="clinic-doctor-img">
                    {d.profile_image ? <img src={d.profile_image} alt={d.full_name} /> : '👨‍⚕️'}
                  </div>
                  <div className="clinic-doctor-body">
                    <div className="clinic-doctor-name">Dr. {d.full_name}</div>
                    <div className="clinic-doctor-spec">{d.specialization}</div>
                    <div className="clinic-doctor-qual">{d.qualification}</div>
                    {d.designation && <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>{d.designation}</div>}
                    {d.bio && <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5, marginBottom: 12 }}>{d.bio?.slice(0, 100)}...</p>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span className="clinic-doctor-exp">⭐ {d.experience_years} yrs</span>
                      {d.consultation_fee && <span className="clinic-doctor-fee">₹{d.consultation_fee}</span>}
                    </div>
                    {d.medical_registration_number && <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 10 }}>Reg: {d.medical_registration_number}</div>}
                    <button onClick={onBook} style={{ width: '100%', background: 'var(--cp)', color: 'white', border: 'none', borderRadius: 'var(--cr)', padding: '10px 0', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                      📅 Book with Dr. {d.full_name.split(' ')[0]}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ClinicServices.jsx
export function ClinicServices({ clinic }) {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    api.get(`/clinic/${clinic.id}/services`).then(setServices).catch(() => {});
  }, [clinic.id]);

  const cats = ['All', ...new Set(services.map(s => s.category_name || s.category).filter(Boolean))];
  const filtered = filter === 'All' ? services : services.filter(s => (s.category_name || s.category) === filter);

  const SERVICE_ICONS = ['💊', '🔬', '🩺', '❤️', '🦷', '👁️', '🦴', '🧠', '🫁', '🩸', '💉', '🏥'];
  const getIcon = (i) => SERVICE_ICONS[i % SERVICE_ICONS.length];

  return (
    <div>
      <div style={{ background: 'var(--cp)', padding: '60px 0' }}>
        <div className="clinic-container">
          <div className="clinic-section-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>What We Offer</div>
          <h1 style={{ color: 'white', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900 }}>Our Services</h1>
        </div>
      </div>
      <section className="clinic-section">
        <div className="clinic-container">
          {cats.length > 2 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
              {cats.map(c => (
                <button key={c} onClick={() => setFilter(c)} style={{ padding: '7px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: '1.5px solid', borderColor: filter === c ? 'var(--cp)' : '#E5E7EB', background: filter === c ? 'var(--cp)' : 'white', color: filter === c ? 'white' : '#6B7280', cursor: 'pointer' }}>
                  {c}
                </button>
              ))}
            </div>
          )}
          <div className="clinic-services-grid">
            {filtered.map((s, i) => (
              <div key={s.id} className="clinic-service-card">
                <div className="clinic-service-icon">{getIcon(i)}</div>
                <div className="clinic-service-name">{s.name}</div>
                <div className="clinic-service-desc">{s.description || 'Professional medical service with expert care.'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="clinic-service-meta">⏱ {s.duration_minutes} min{s.category_name ? ` • ${s.category_name}` : ''}</div>
                  {s.price_display && <span className="clinic-service-price">{s.price_display}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ClinicFacilities.jsx
export function ClinicFacilities({ clinic }) {
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    api.get(`/clinic/${clinic.id}/facilities`).then(setFacilities).catch(() => {});
  }, [clinic.id]);

  const ICONS = { Parking: '🚗', Pharmacy: '💊', Laboratory: '🔬', Emergency: '🚨', Ambulance: '🚑', ICU: '❤️‍🔥', OT: '🏥', Cafeteria: '🍽', Wheelchair: '♿', WiFi: '📶', 'AC Rooms': '❄️', 'X-Ray': '📡', Ultrasound: '🔊', ECG: '📊', 'Blood Bank': '🩸' };

  return (
    <div>
      <div style={{ background: 'var(--cp)', padding: '60px 0' }}>
        <div className="clinic-container">
          <div className="clinic-section-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>Infrastructure</div>
          <h1 style={{ color: 'white', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900 }}>Our Facilities</h1>
        </div>
      </div>
      <section className="clinic-section">
        <div className="clinic-container">
          {facilities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>Facility information coming soon.</div>
          ) : (
            <div className="clinic-facilities-grid">
              {facilities.map(f => (
                <div key={f.id} className="clinic-facility-card">
                  <div className="clinic-facility-icon">{ICONS[f.facility_name || f.custom_name] || '🏥'}</div>
                  <div className="clinic-facility-name">{f.facility_name || f.custom_name}</div>
                  {f.description && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{f.description}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ClinicContact.jsx
export function ClinicContact({ clinic }) {
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();

  return (
    <div>
      <div style={{ background: 'var(--cp)', padding: '60px 0' }}>
        <div className="clinic-container">
          <div className="clinic-section-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>Get In Touch</div>
          <h1 style={{ color: 'white', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900 }}>Contact Us</h1>
        </div>
      </div>
      <section className="clinic-section">
        <div className="clinic-container">
          <div className="clinic-contact-grid">
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}>Reach Us</h3>
              {[
                { icon: '📞', label: 'Phone', val: clinic.phone, href: `tel:${clinic.phone}` },
                { icon: '✉️', label: 'Email', val: clinic.email, href: `mailto:${clinic.email}` },
                { icon: '💬', label: 'WhatsApp', val: clinic.whatsapp, href: `https://wa.me/${clinic.whatsapp?.replace(/\D/g,'')}` },
                { icon: '📍', label: 'Address', val: [clinic.address_line1, clinic.address_line2, clinic.city, clinic.state, clinic.pincode].filter(Boolean).join(', ') },
              ].filter(c => c.val).map(item => (
                <div key={item.label} className="clinic-contact-item">
                  <div className="clinic-contact-icon">{item.icon}</div>
                  <div>
                    <div className="clinic-contact-label">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} target="_blank" rel="noreferrer" className="clinic-contact-value" style={{ color: 'var(--cp)' }}>{item.val}</a>
                    ) : (
                      <div className="clinic-contact-value">{item.val}</div>
                    )}
                  </div>
                </div>
              ))}
              {clinic.google_maps_link && (
                <a href={clinic.google_maps_link} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--cp)', color: 'white', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 14, marginTop: 8, textDecoration: 'none' }}>
                  🗺 Get Directions
                </a>
              )}
            </div>
            <div>
              {clinic.working_hours?.length > 0 && (
                <>
                  <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Working Hours</h3>
                  <div style={{ background: 'white', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                    {clinic.working_hours.map(h => (
                      <div key={h.day_of_week} className="clinic-hours-row" style={{ padding: '12px 20px', background: h.day_of_week === today ? '#F0FDF4' : 'white' }}>
                        <span className="clinic-hours-day" style={{ color: h.day_of_week === today ? 'var(--cp)' : 'inherit' }}>
                          {h.day_of_week === today ? '▶ ' : ''}{DAYS[h.day_of_week]}
                        </span>
                        {h.is_open
                          ? <span className="clinic-hours-time">{h.open_time?.slice(0,5)} – {h.close_time?.slice(0,5)}</span>
                          : <span className="clinic-hours-closed">Closed</span>
                        }
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ClinicBlog.jsx
export function ClinicBlog({ clinic }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/clinic/${clinic.id}/blog`).then(p => { setPosts(p); setLoading(false); }).catch(() => setLoading(false));
  }, [clinic.id]);

  return (
    <div>
      <div style={{ background: 'var(--cp)', padding: '60px 0' }}>
        <div className="clinic-container">
          <div className="clinic-section-eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>Latest Updates</div>
          <h1 style={{ color: 'white', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900 }}>Health Blog</h1>
        </div>
      </div>
      <section className="clinic-section">
        <div className="clinic-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner spinner-dark" style={{ margin: '0 auto' }} /></div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80, color: '#9CA3AF' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
              <h3>No posts yet</h3>
              <p>Check back soon for health tips and clinic updates!</p>
            </div>
          ) : (
            <div className="clinic-blog-grid">
              {posts.map(p => (
                <div key={p.id} className="clinic-blog-card">
                  <div className="clinic-blog-img">
                    {p.cover_image ? <img src={p.cover_image} alt={p.title} /> : '📰'}
                  </div>
                  <div className="clinic-blog-body">
                    {p.category && <div className="clinic-blog-cat">{p.category}</div>}
                    <h3 className="clinic-blog-title">{p.title}</h3>
                    <p className="clinic-blog-excerpt">{p.excerpt || p.content?.slice(0, 120)}...</p>
                    <div className="clinic-blog-meta">
                      {p.author_name && `By ${p.author_name} • `}
                      {p.published_at ? new Date(p.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      {p.views ? ` • ${p.views} views` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
