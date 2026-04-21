import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/contexts/AuthContext';
import './Landing.css';

const features = [
  { icon: '⚡', title: 'Launch in Minutes', desc: 'Step-by-step guided wizard creates your complete clinic website without any coding.' },
  { icon: '🎨', title: '5 Premium Templates', desc: 'Choose from Modern, Classic, Minimal, Vibrant, and Elegant themes with custom colors.' },
  { icon: '📅', title: 'Smart Appointment Booking', desc: 'Patients book slots in real-time. Auto-generates doctor schedules and manages availability.' },
  { icon: '🏥', title: 'Complete Clinic Profile', desc: 'Doctors, services, facilities, certificates, working hours — everything in one place.' },
  { icon: '📝', title: 'Blog & Content', desc: 'Keep patients informed with clinic news, health tips, and updates.' },
  { icon: '📊', title: 'Admin Dashboard', desc: 'Manage appointments, doctors, services, and content from a clean dashboard.' },
];

const steps = [
  { num: '01', title: 'Sign Up', desc: 'Create your free account in 30 seconds.' },
  { num: '02', title: 'Fill Details', desc: 'Enter clinic info, doctors, services through our guided wizard.' },
  { num: '03', title: 'Choose Theme', desc: 'Pick colors and template that match your brand.' },
  { num: '04', title: 'Publish', desc: 'One click to go live with your professional website.' },
];

const templates = [
  { id: 'modern', label: 'Modern', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'classic', label: 'Classic', color: '#7C3AED', bg: '#F5F3FF' },
  { id: 'minimal', label: 'Minimal', color: '#1F2937', bg: '#F9FAFB' },
  { id: 'vibrant', label: 'Vibrant', color: '#DC2626', bg: '#FEF2F2' },
  { id: 'elegant', label: 'Elegant', color: '#D97706', bg: '#FFFBEB' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="landing">
      {/* NAV */}
      <nav className="landing-nav">
        <div className="container flex-between">
          <div className="landing-logo">
            <span className="logo-icon">⚕</span>
            <span>ClinicCraft</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#templates">Templates</a>
            {user ? (
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>Dashboard</button>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/login')}>Login</button>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg-grid" />
        <div className="hero-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">🚀 Trusted by 500+ clinics across India</div>
            <h1 className="hero-title">
              Build Your Clinic<br />
              <span className="hero-highlight">Website in Minutes</span>
            </h1>
            <p className="hero-sub">
              Professional clinic websites with appointment booking, doctor profiles,
              service listings — everything your patients need. No code. No designer.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate(user ? '/dashboard' : '/signup')}>
                {user ? 'Go to Dashboard' : 'Create Your Website Free'}
                <span>→</span>
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/clinic/demo-clinic')}>
                View Live Demo
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><strong>500+</strong><span>Clinics</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>50K+</strong><span>Appointments</span></div>
              <div className="hero-stat-divider" />
              <div className="hero-stat"><strong>4.9★</strong><span>Rating</span></div>
            </div>
          </div>
          <div className="hero-preview">
            <div className="browser-frame">
              <div className="browser-bar">
                <span /><span /><span />
                <div className="browser-url">cliniccraft.in/clinic/apollo-dental</div>
              </div>
              <div className="browser-content">
                <div className="preview-hero-bar" style={{ background: 'linear-gradient(135deg,#0A2540,#1a4a7a)' }}>
                  <div className="preview-clinic-name">Apollo Dental Care</div>
                  <div className="preview-clinic-tag">Advanced Dental Solutions</div>
                  <div className="preview-cta-bar">
                    <div style={{ background: '#00C896', borderRadius: 6, padding: '6px 14px', color: 'white', fontSize: 11, fontWeight: 700 }}>Book Appointment</div>
                  </div>
                </div>
                <div className="preview-stats-row">
                  {['12 Doctors', '24 Services', '★ 4.9', '10+ Yrs'].map(s => (
                    <div key={s} className="preview-stat-pill">{s}</div>
                  ))}
                </div>
                <div className="preview-section-label">Our Specialties</div>
                <div className="preview-cards">
                  {['Dental Implants', 'Braces & Aligners', 'Root Canal', 'Teeth Whitening'].map(s => (
                    <div key={s} className="preview-card-item">🦷 {s}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-center">
            <div className="section-eyebrow">Everything You Need</div>
            <h2 className="section-title">Built for Modern Clinics</h2>
            <p className="section-sub" style={{ margin: '12px auto 0', textAlign: 'center' }}>
              Everything a patient expects from a professional healthcare website, built in.
            </p>
          </div>
          <div className="features-grid">
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="how-section">
        <div className="container">
          <div className="section-center">
            <div className="section-eyebrow">How It Works</div>
            <h2 className="section-title">From Signup to Live in 4 Steps</h2>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={s.num} className="step-card">
                <div className="step-num">{s.num}</div>
                {i < steps.length - 1 && <div className="step-connector" />}
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATES */}
      <section id="templates" className="templates-section">
        <div className="container">
          <div className="section-center">
            <div className="section-eyebrow">Templates</div>
            <h2 className="section-title">5 Stunning Templates</h2>
            <p className="section-sub" style={{ margin: '12px auto 0', textAlign: 'center' }}>
              Each template is fully customizable. Change colors, fonts, and layout to match your brand.
            </p>
          </div>
          <div className="templates-grid">
            {templates.map(t => (
              <div key={t.id} className="template-card" style={{ '--tc': t.color, '--tb': t.bg }}>
                <div className="template-preview">
                  <div className="template-header" style={{ background: t.color }} />
                  <div className="template-lines">
                    <div className="tl" /><div className="tl tl-sm" />
                    <div className="tl-row">
                      <div className="tl-block" style={{ background: t.bg, borderColor: t.color + '40' }} />
                      <div className="tl-block" style={{ background: t.bg, borderColor: t.color + '40' }} />
                      <div className="tl-block" style={{ background: t.bg, borderColor: t.color + '40' }} />
                    </div>
                  </div>
                </div>
                <div className="template-label">
                  <span className="template-dot" style={{ background: t.color }} />
                  {t.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <div className="cta-orb" />
            <h2>Ready to Build Your Clinic Website?</h2>
            <p>Join hundreds of clinics that trust ClinicCraft. Free to start, no credit card needed.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate(user ? '/dashboard' : '/signup')}>
              {user ? 'Go to Dashboard' : 'Start Building — It\'s Free'} →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="container flex-between">
          <div className="landing-logo">
            <span className="logo-icon">⚕</span>
            <span>ClinicCraft</span>
          </div>
          <p style={{ color: 'var(--brand-muted)', fontSize: 13 }}>
            © 2025 ClinicCraft. Built for healthcare professionals.
          </p>
        </div>
      </footer>
    </div>
  );
}
