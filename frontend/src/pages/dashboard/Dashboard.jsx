import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/common/Toast';
import AppointmentsPanel from './AppointmentsPanel';
import DoctorsPanel from './DoctorsPanel';
import ServicesPanel from './ServicesPanel';
import BlogPanel from './BlogPanel';
import SettingsPanel from './SettingsPanel';
import './Dashboard.css';

const NAV = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'appointments', label: 'Appointments', icon: '📅' },
  { id: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
  { id: 'services', label: 'Services', icon: '💊' },
  { id: 'blog', label: 'Blog', icon: '📝' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Dashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [clinic, setClinic] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    api.get('/dashboard/stats').then(setStats).catch(() => {});
    api.get('/clinic/me').then(setClinic).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-logo">
          <span className="logo-icon">⚕</span>
          <span>ClinicCraft</span>
        </div>
        {clinic && (
          <div className="dashboard-clinic-info">
            <div className="clinic-avatar">{clinic.clinic_name?.[0] || '🏥'}</div>
            <div>
              <div className="clinic-name-small">{clinic.clinic_name}</div>
              <div className={`clinic-status ${clinic.is_published ? 'live' : 'draft'}`}>
                {clinic.is_published ? '● Live' : '○ Draft'}
              </div>
            </div>
          </div>
        )}
        <nav className="dashboard-nav">
          {NAV.map(n => (
            <button key={n.id} className={`dash-nav-item ${tab === n.id ? 'active' : ''}`} onClick={() => setTab(n.id)}>
              <span>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="dashboard-sidebar-footer">
          {clinic && (
            <a href={`/clinic/${clinic.clinic_id_slug}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ width: '100%', marginBottom: 8, justifyContent: 'center' }}>
              View Website ↗
            </a>
          )}
          <Link to="/builder" className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
            Edit Website
          </Link>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center', color: 'var(--brand-danger)' }}>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <h1 className="dashboard-page-title">{NAV.find(n => n.id === tab)?.label}</h1>
          <div className="dashboard-user">
            <span style={{ fontSize: 14, color: 'var(--brand-text-light)' }}>Welcome, {user?.full_name?.split(' ')[0]}</span>
            <div className="user-avatar">{user?.full_name?.[0] || 'U'}</div>
          </div>
        </div>

        <div className="dashboard-content">
          {tab === 'overview' && stats && clinic && (
            <OverviewPanel stats={stats} clinic={clinic} navigate={navigate} setTab={setTab} />
          )}
          {tab === 'appointments' && clinic && <AppointmentsPanel clinic={clinic} />}
          {tab === 'doctors' && clinic && <DoctorsPanel clinic={clinic} />}
          {tab === 'services' && clinic && <ServicesPanel clinic={clinic} />}
          {tab === 'blog' && clinic && <BlogPanel clinic={clinic} />}
          {tab === 'settings' && clinic && <SettingsPanel clinic={clinic} setClinic={setClinic} />}
          {!clinic && <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner spinner-dark" style={{ margin: '0 auto' }} /></div>}
        </div>
      </main>
    </div>
  );
}

function OverviewPanel({ stats, clinic, navigate, setTab }) {
  const STAT_CARDS = [
    { label: 'Total Appointments', value: stats.total_appointments, icon: '📅', color: '#3B82F6' },
    { label: "Today's Appointments", value: stats.today_appointments, icon: '🌅', color: '#10B981' },
    { label: 'Pending Review', value: stats.pending_appointments, icon: '⏳', color: '#F59E0B' },
    { label: 'Completed', value: stats.completed_appointments, icon: '✅', color: '#8B5CF6' },
    { label: 'Active Doctors', value: stats.total_doctors, icon: '👨‍⚕️', color: '#EC4899' },
  ];

  const statusColor = { pending: 'badge-yellow', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' };

  return (
    <div>
      {!clinic.is_published && (
        <div className="publish-banner">
          <span>🎯 Your website is not published yet.</span>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/builder')}>Complete Setup & Publish →</button>
        </div>
      )}
      <div className="stats-grid">
        {STAT_CARDS.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + '20', color: s.color }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="dashboard-grid-2">
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 15 }}>Recent Appointments</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setTab('appointments')}>View All</button>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            {stats.recent_appointments?.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--brand-muted)', fontSize: 14 }}>No appointments yet</div>
            ) : (
              <table className="data-table">
                <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {stats.recent_appointments?.map(a => (
                    <tr key={a.id}>
                      <td><strong>{a.patient_name}</strong></td>
                      <td style={{ color: 'var(--brand-text-light)' }}>{a.doctor_name}</td>
                      <td style={{ fontSize: 12, color: 'var(--brand-muted)' }}>{new Date(a.appointment_date).toLocaleDateString('en-IN')}</td>
                      <td><span className={`badge ${statusColor[a.status] || 'badge-gray'}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h3 style={{ fontSize: 15 }}>Quick Actions</h3></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '+ Add Doctor', action: () => setTab('doctors'), icon: '👨‍⚕️' },
              { label: '+ Add Service', action: () => setTab('services'), icon: '💊' },
              { label: '+ Write Blog Post', action: () => setTab('blog'), icon: '📝' },
              { label: '✏️ Edit Website', action: () => navigate('/builder'), icon: '' },
            ].map(q => (
              <button key={q.label} className="btn btn-outline" style={{ justifyContent: 'flex-start', gap: 10 }} onClick={q.action}>
                {q.icon && <span>{q.icon}</span>}{q.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
