import { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function ClinicHome({ clinic, onBook, onNav }) {
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get(`/clinic/${clinic.id}/doctors`).then(d => setDoctors(d.slice(0, 4))).catch(() => {});
    api.get(`/clinic/${clinic.id}/services`).then(s => setServices(s.slice(0, 6))).catch(() => {});
  }, [clinic.id]);

  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date().getDay();
  const todayHours = clinic.working_hours?.find(h => h.day_of_week === today);

  return (
    <div>
      {/* HERO */}
      <section className="clinic-hero">
        <div className="clinic-hero-pattern" />
        <div className="clinic-container">
          <div className="clinic-hero-content">
            <div>
              {clinic.established_year && (
                <div className="clinic-hero-badge">🏥 Est. {clinic.established_year}</div>
              )}
              <h1>{clinic.clinic_name}</h1>
              <p className="clinic-hero-sub">
                {clinic.tagline || clinic.description?.slice(0, 150) || 'Professional healthcare services with compassion and expertise.'}
              </p>
              <div className="clinic-hero-actions">
                <button className="clinic-btn-white" onClick={onBook}>
                  📅 Book Appointment
                </button>
                <button className="clinic-btn-outline-white" onClick={() => onNav('doctors')}>
                  Meet Our Doctors
                </button>
              </div>
              <div style={{ marginTop: 28, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {clinic.phone && (
                  <a href={`tel:${clinic.phone}`} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    📞 {clinic.phone}
                  </a>
                )}
                {todayHours && (
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>
                    🕐 {todayHours.is_open ? `Open today: ${todayHours.open_time?.slice(0,5)} – ${todayHours.close_time?.slice(0,5)}` : 'Closed today'}
                  </span>
                )}
              </div>
            </div>
            <div className="clinic-hero-stats">
              {[
                { num: `${clinic.total_doctors || doctors.length || '10'}+`, label: 'Expert Doctors' },
                { num: `${services.length || '20'}+`, label: 'Services' },
                { num: clinic.rating ? `${clinic.rating}★` : '4.8★', label: 'Patient Rating' },
                { num: clinic.established_year ? `${new Date().getFullYear() - clinic.established_year}+` : '5+', label: 'Years Experience' },
              ].map(s => (
                <div key={s.label} className="clinic-stat-box">
                  <div className="clinic-stat-num">{s.num}</div>
                  <div className="clinic-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* QUICK INFO BAR */}
      <div style={{ background: 'var(--cp)', padding: '16px 0' }}>
        <div className="clinic-container" style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: '📞', label: 'Call Us', val: clinic.phone },
            { icon: '✉️', label: 'Email', val: clinic.email },
            { icon: '📍', label: 'Location', val: `${clinic.city}, ${clinic.state}` },
            { icon: '🕐', label: 'Today', val: todayHours?.is_open ? `${todayHours.open_time?.slice(0,5)}–${todayHours.close_time?.slice(0,5)}` : 'Closed' },
          ].filter(i => i.val).map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 10, opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SERVICES PREVIEW */}
      {services.length > 0 && (
        <section className="clinic-section">
          <div className="clinic-container">
            <div className="clinic-section-header">
              <div className="clinic-section-eyebrow">Our Specialties</div>
              <h2 className="clinic-section-title">Services We Offer</h2>
              <p className="clinic-section-sub">Comprehensive healthcare services delivered with care and expertise.</p>
            </div>
            <div className="clinic-services-grid">
              {services.map(s => (
                <div key={s.id} className="clinic-service-card">
                  <div className="clinic-service-icon">💊</div>
                  <div className="clinic-service-name">{s.name}</div>
                  <div className="clinic-service-desc">{s.description?.slice(0, 80) || 'Professional medical care with advanced techniques.'}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="clinic-service-meta">{s.duration_minutes} min</span>
                    {s.price_display && <span className="clinic-service-price">{s.price_display}</span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button className="clinic-btn-outline-primary" onClick={() => onNav('services')} style={{ background: 'transparent', border: '2px solid var(--cp)', color: 'var(--cp)', padding: '12px 28px', borderRadius: 'var(--cr)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                View All Services →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* DOCTORS PREVIEW */}
      {doctors.length > 0 && (
        <section className="clinic-section clinic-section-alt">
          <div className="clinic-container">
            <div className="clinic-section-header">
              <div className="clinic-section-eyebrow">Our Team</div>
              <h2 className="clinic-section-title">Meet Our Doctors</h2>
            </div>
            <div className="clinic-doctors-grid">
              {doctors.map(d => (
                <div key={d.id} className="clinic-doctor-card">
                  <div className="clinic-doctor-img">
                    {d.profile_image ? <img src={d.profile_image} alt={d.full_name} /> : '👨‍⚕️'}
                  </div>
                  <div className="clinic-doctor-body">
                    <div className="clinic-doctor-name">Dr. {d.full_name}</div>
                    <div className="clinic-doctor-spec">{d.specialization}</div>
                    <div className="clinic-doctor-qual">{d.qualification}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="clinic-doctor-exp">⭐ {d.experience_years} yrs exp</span>
                      {d.consultation_fee && <span className="clinic-doctor-fee">₹{d.consultation_fee}</span>}
                    </div>
                    <button onClick={onBook} style={{ marginTop: 12, width: '100%', background: 'var(--cp)', color: 'white', border: 'none', borderRadius: 'var(--cr)', padding: '9px 0', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button onClick={() => onNav('doctors')} style={{ background: 'transparent', border: '2px solid var(--cp)', color: 'var(--cp)', padding: '12px 28px', borderRadius: 'var(--cr)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                View All Doctors →
              </button>
            </div>
          </div>
        </section>
      )}

      {/* WHY CHOOSE US */}
      <section className="clinic-section">
        <div className="clinic-container">
          <div className="clinic-section-header">
            <div className="clinic-section-eyebrow">Why Choose Us</div>
            <h2 className="clinic-section-title">Your Health, Our Priority</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: '🏆', title: 'Expert Specialists', desc: 'Highly qualified doctors with years of experience in their fields.' },
              { icon: '🔬', title: 'Advanced Technology', desc: 'Latest medical equipment and diagnostic tools for accurate results.' },
              { icon: '❤️', title: 'Patient-Centered Care', desc: 'We treat every patient with compassion, dignity, and respect.' },
              { icon: '📅', title: 'Easy Appointments', desc: 'Book appointments online 24/7 at your convenience.' },
              { icon: '🏥', title: 'Modern Facilities', desc: 'State-of-the-art clinic infrastructure for your comfort.' },
              { icon: '💊', title: 'Comprehensive Services', desc: 'From consultation to treatment, all under one roof.' },
            ].map(f => (
              <div key={f.title} style={{ padding: 24, borderRadius: 14, border: '1px solid #E5E7EB', background: 'white' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ background: 'linear-gradient(135deg, var(--cp), color-mix(in srgb, var(--cp) 70%, var(--cs)))', padding: '60px 0' }}>
        <div className="clinic-container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'white', fontSize: 32, marginBottom: 12 }}>Ready to Book Your Appointment?</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 28 }}>Get expert medical care from our qualified doctors. Book your slot now.</p>
          <button className="clinic-btn-white" onClick={onBook} style={{ fontSize: 16, padding: '14px 36px' }}>
            📅 Book Appointment Now
          </button>
        </div>
      </section>
    </div>
  );
}
