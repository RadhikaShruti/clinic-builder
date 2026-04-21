import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../src/contexts/AuthContext';
import { useToast } from '../../src/components/common/Toast';
import './Auth.css';

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-logo"><span className="logo-icon">⚕</span> ClinicCraft</Link>
          <div className="auth-left-text">
            <h2>Welcome back,<br/>Doctor 👋</h2>
            <p>Manage your clinic website, appointments, and patient bookings from one powerful dashboard.</p>
            <div className="auth-features">
              {['Real-time appointment booking', 'Doctor schedule management', 'Blog & content updates', 'Analytics & insights'].map(f => (
                <div key={f} className="auth-feature"><span>✓</span>{f}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <h1>Sign In</h1>
          <p className="auth-sub">Enter your credentials to access your dashboard</p>
          <form onSubmit={handle} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@clinic.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? <><div className="spinner" />Signing in...</> : 'Sign In →'}
            </button>
          </form>
          <p className="auth-switch">Don't have an account? <Link to="/signup">Create one free</Link></p>
        </div>
      </div>
    </div>
  );
}

export function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handle = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast('Password must be at least 6 characters', 'error');
    setLoading(true);
    try {
      await signup(form.email, form.password, form.full_name, form.phone);
      toast('Account created successfully!', 'success');
      navigate('/login');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-logo"><span className="logo-icon">⚕</span> ClinicCraft</Link>
          <div className="auth-left-text">
            <h2>Start Building<br/>Your Clinic Website 🏥</h2>
            <p>Join 500+ clinics who launched their professional website in under 15 minutes with ClinicCraft.</p>
            <div className="auth-stats">
              <div className="auth-stat"><strong>500+</strong><span>Clinics</span></div>
              <div className="auth-stat"><strong>15 min</strong><span>Avg Setup</span></div>
              <div className="auth-stat"><strong>Free</strong><span>To Start</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <h1>Create Account</h1>
          <p className="auth-sub">Build your clinic website for free. No credit card required.</p>
          <form onSubmit={handle} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" placeholder="Dr. Rajesh Kumar"
                value={form.full_name} onChange={set('full_name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@clinic.com"
                value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" type="tel" placeholder="+91 98765 43210"
                value={form.phone} onChange={set('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={set('password')} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
              {loading ? <><div className="spinner" />Creating account...</> : 'Create Account & Start Building →'}
            </button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
