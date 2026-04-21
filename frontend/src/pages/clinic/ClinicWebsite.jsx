import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../../utils/api';
import ClinicHome from './ClinicHome';
import ClinicAbout from './ClinicAbout';
import ClinicDoctors from './ClinicDoctors';
import ClinicServices from './ClinicServices';
import ClinicFacilities from './ClinicFacilities';
import ClinicContact from './ClinicContact';
import ClinicBlog from './ClinicBlog';
import BookAppointment from './BookAppointment';
import './Clinic.css';

export default function ClinicWebsite() {
  const { slug } = useParams();
  const location = useLocation();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const hash = location.hash.replace('#', '') || 'home';

  useEffect(() => {
    api.get(`/clinic/slug/${slug}`)
      .then(c => { setClinic(c); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="page-loader">
      <div className="spinner spinner-dark" style={{ width: 36, height: 36, borderWidth: 3 }} />
      <p style={{ color: 'var(--brand-muted)', fontSize: 14 }}>Loading clinic...</p>
    </div>
  );

  if (notFound) return (
    <div className="page-loader">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64 }}>🏥</div>
        <h2 style={{ marginTop: 16, marginBottom: 8 }}>Clinic Not Found</h2>
        <p style={{ color: 'var(--brand-muted)' }}>This clinic website doesn't exist or hasn't been published.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>← Back to Home</Link>
      </div>
    </div>
  );

  // Apply theme CSS variables
  const themeVars = {
    '--clinic-primary': clinic.primary_color || '#2563EB',
    '--clinic-secondary': clinic.secondary_color || '#10B981',
    '--clinic-accent': clinic.accent_color || '#F59E0B',
    '--clinic-bg': clinic.background_color || '#FFFFFF',
    '--clinic-text': clinic.text_color || '#1F2937',
    '--clinic-radius': clinic.border_radius || '8px',
  };

  const NAV_LINKS = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'doctors', label: 'Doctors' },
    { id: 'services', label: 'Services' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'blog', label: 'Blog' },
    { id: 'contact', label: 'Contact' },
  ];

  const scrollTo = (id) => {
    setMenuOpen(false);
    window.location.hash = id;
  };

  return (
    <div className={`clinic-site template-${clinic.template_id || 'modern'}`} style={themeVars}>
      {/* CLINIC NAV */}
      <nav className="clinic-nav">
        <div className="clinic-container clinic-nav-inner">
          <div className="clinic-logo-area" onClick={() => scrollTo('home')} style={{ cursor: 'pointer' }}>
            {clinic.logo_url
              ? <img src={clinic.logo_url} alt={clinic.clinic_name} className="clinic-logo-img" />
              : <div className="clinic-logo-placeholder">⚕</div>
            }
            <div>
              <div className="clinic-logo-name">{clinic.clinic_name}</div>
              {clinic.tagline && <div className="clinic-logo-tag">{clinic.tagline}</div>}
            </div>
          </div>

          <div className={`clinic-nav-links ${menuOpen ? 'open' : ''}`}>
            {NAV_LINKS.map(n => (
              <button key={n.id} className={`clinic-nav-link ${hash === n.id ? 'active' : ''}`} onClick={() => scrollTo(n.id)}>
                {n.label}
              </button>
            ))}
            <button className="btn clinic-book-btn" onClick={() => scrollTo('book')}>
              📅 Book Appointment
            </button>
          </div>

          <button className="clinic-hamburger" onClick={() => setMenuOpen(m => !m)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className="clinic-page">
        {hash === 'home' && <ClinicHome clinic={clinic} onBook={() => scrollTo('book')} onNav={scrollTo} />}
        {hash === 'about' && <ClinicAbout clinic={clinic} />}
        {hash === 'doctors' && <ClinicDoctors clinic={clinic} onBook={() => scrollTo('book')} />}
        {hash === 'services' && <ClinicServices clinic={clinic} />}
        {hash === 'facilities' && <ClinicFacilities clinic={clinic} />}
        {hash === 'blog' && <ClinicBlog clinic={clinic} />}
        {hash === 'contact' && <ClinicContact clinic={clinic} />}
        {hash === 'book' && <BookAppointment clinic={clinic} />}
      </div>

      {/* FOOTER */}
      <footer className="clinic-footer">
        <div className="clinic-container">
          <div className="clinic-footer-grid">
            <div>
              <div className="clinic-footer-logo">
                {clinic.logo_url ? <img src={clinic.logo_url} alt="" style={{ height: 36 }} /> : <span style={{ fontSize: 28 }}>⚕</span>}
                <span>{clinic.clinic_name}</span>
              </div>
              {clinic.tagline && <p className="clinic-footer-tag">{clinic.tagline}</p>}
              {clinic.established_year && <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>Est. {clinic.established_year}</p>}
            </div>
            <div>
              <h4 className="clinic-footer-heading">Quick Links</h4>
              <div className="clinic-footer-links">
                {NAV_LINKS.map(n => (
                  <button key={n.id} className="clinic-footer-link" onClick={() => scrollTo(n.id)}>{n.label}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="clinic-footer-heading">Contact</h4>
              <div className="clinic-footer-contact">
                {clinic.phone && <p>📞 {clinic.phone}</p>}
                {clinic.email && <p>✉️ {clinic.email}</p>}
                {clinic.address_line1 && <p>📍 {clinic.address_line1}, {clinic.city}</p>}
              </div>
            </div>
            <div>
              <button className="clinic-cta-btn" onClick={() => scrollTo('book')}>
                📅 Book Appointment
              </button>
              {clinic.whatsapp && (
                <a href={`https://wa.me/${clinic.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="clinic-wa-btn">
                  💬 WhatsApp Us
                </a>
              )}
            </div>
          </div>
          <div className="clinic-footer-bottom">
            <span>© {new Date().getFullYear()} {clinic.clinic_name}. All rights reserved.</span>
            <span style={{ fontSize: 11, opacity: 0.4 }}>Powered by ClinicCraft</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
