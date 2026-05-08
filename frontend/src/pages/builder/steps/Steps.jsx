// Step2Services.jsx
import { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useToast } from '../../../components/common/Toast';

export function Step2Services({ clinic, onNext, onPrev }) {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', category: '', duration_minutes: 30, price_display: '' });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (clinic?.id) api.get(`/clinic/${clinic.id}/services`).then(setServices).catch(() => {});
  }, [clinic]);

  const add = async () => {
    if (!form.name) return toast('Service name required', 'error');
    setLoading(true);
    try {
      const s = await api.post('/services', { ...form, clinic_id: clinic.id });
      setServices(p => [...p, s]);
      setForm({ name: '', description: '', category: '', duration_minutes: 30, price_display: '' });
      setShowForm(false);
      toast('Service added!', 'success');
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    try { await api.delete(`/services/${id}`); setServices(p => p.filter(s => s.id !== id)); }
    catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div className="step-form">
      <p style={{ color: 'var(--brand-text-light)', fontSize: 14 }}>Add treatments and services your clinic offers.</p>
      <div className="item-list">
        {services.map(s => (
          <div key={s.id} className="item-card">
            <div className="item-card-info">
              <h4>{s.name}</h4>
              <p>{s.category_name || s.category} {s.price_display ? '• ' + s.price_display : ''} {s.duration_minutes ? `• ${s.duration_minutes} min` : ''}</p>
            </div>
            <div className="item-card-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => remove(s.id)}>🗑</button>
            </div>
          </div>
        ))}
        {showForm ? (
          <div style={{ background: 'white', border: '1.5px solid var(--brand-border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <div className="form-grid-2" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label">Service Name *</label>
                <input className="form-input" placeholder="e.g. Root Canal Treatment" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-input" placeholder="e.g. Dental, General, Cardiology" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
              </div>
            </div>
            <div className="form-grid-2" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label">Duration (minutes)</label>
                <input className="form-input" type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Price Display</label>
                <input className="form-input" placeholder="e.g. ₹500 - ₹2000" value={form.price_display} onChange={e => setForm(p => ({ ...p, price_display: e.target.value }))} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={2} placeholder="Brief description of the service..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={add} disabled={loading}>
                {loading ? <div className="spinner" /> : '+ Add Service'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="add-item-btn" onClick={() => setShowForm(true)}>+ Add Service / Treatment</button>
        )}
      </div>
      <div className="step-actions">
        <button className="btn btn-outline" onClick={onPrev}>← Back</button>
        <button className="btn btn-primary" onClick={onNext}>Save & Continue →</button>
      </div>
    </div>
  );
}

// Step3Doctors.jsx
export function Step3Doctors({ clinic, onNext, onPrev }) {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    full_name: '', qualification: '', specialization: '', experience_years: '',
    designation: '', department: '', medical_registration_number: '',
    registration_council: '', consultation_fee: '', bio: '', phone: '', email: ''
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (clinic?.id) api.get(`/clinic/${clinic.id}/doctors`).then(setDoctors).catch(() => {});
  }, [clinic]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const add = async () => {
    if (!form.full_name || !form.qualification || !form.specialization) {
      return toast('Name, qualification, and specialization are required', 'error');
    }
    setLoading(true);
    try {
      const d = await api.post('/doctors', form);
      setDoctors(p => [...p, d]);
      setForm({ full_name: '', qualification: '', specialization: '', experience_years: '', designation: '', department: '', medical_registration_number: '', registration_council: '', consultation_fee: '', bio: '', phone: '', email: '' });
      setShowForm(false);
      toast('Doctor added!', 'success');
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    try { await api.delete(`/doctors/${id}`); setDoctors(p => p.filter(d => d.id !== id)); }
    catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div className="step-form">
      <p style={{ color: 'var(--brand-text-light)', fontSize: 14 }}>Add doctors and specialists at your clinic.</p>
      <div className="item-list">
        {doctors.map(d => (
          <div key={d.id} className="item-card">
            <div className="item-card-info">
              <h4>Dr. {d.full_name}</h4>
              <p>{d.qualification} • {d.specialization} • {d.experience_years} yrs exp</p>
            </div>
            <div className="item-card-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => remove(d.id)}>🗑</button>
            </div>
          </div>
        ))}
        {showForm ? (
          <div style={{ background: 'white', border: '1.5px solid var(--brand-border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <div className="form-grid-2" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="Dr. Anita Sharma" value={form.full_name} onChange={set('full_name')} />
              </div>
              <div className="form-group">
                <label className="form-label">Qualification *</label>
                <input className="form-input" placeholder="MBBS, MD, BDS..." value={form.qualification} onChange={set('qualification')} />
              </div>
            </div>
            <div className="form-grid-2" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label">Specialization *</label>
                <input className="form-input" placeholder="Cardiologist, Dentist..." value={form.specialization} onChange={set('specialization')} />
              </div>
              <div className="form-group">
                <label className="form-label">Experience (Years) *</label>
                <input className="form-input" type="number" placeholder="5" value={form.experience_years} onChange={set('experience_years')} />
              </div>
            </div>
            <div className="form-grid-2" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input className="form-input" placeholder="Senior Consultant" value={form.designation} onChange={set('designation')} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-input" placeholder="Cardiology" value={form.department} onChange={set('department')} />
              </div>
            </div>
            <div className="form-grid-2" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label">Medical Registration No.</label>
                <input className="form-input" placeholder="MCI/State Reg. Number" value={form.medical_registration_number} onChange={set('medical_registration_number')} />
              </div>
              <div className="form-group">
                <label className="form-label">Registration Council</label>
                <input className="form-input" placeholder="MCI, Delhi Medical Council..." value={form.registration_council} onChange={set('registration_council')} />
              </div>
            </div>
            <div className="form-grid-2" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label">Consultation Fee (₹)</label>
                <input className="form-input" type="number" placeholder="500" value={form.consultation_fee} onChange={set('consultation_fee')} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="Doctor's contact" value={form.phone} onChange={set('phone')} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows={2} placeholder="Brief professional bio..." value={form.bio} onChange={set('bio')} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={add} disabled={loading}>
                {loading ? <div className="spinner" /> : '+ Add Doctor'}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="add-item-btn" onClick={() => setShowForm(true)}>+ Add Doctor / Specialist</button>
        )}
      </div>
      <div className="step-actions">
        <button className="btn btn-outline" onClick={onPrev}>← Back</button>
        <button className="btn btn-primary" onClick={onNext}>Save & Continue →</button>
      </div>
    </div>
  );
}

// Step4Facilities.jsx
export function Step4Facilities({ clinic, onNext, onPrev }) {
  const [allFacilities, setAllFacilities] = useState([]);
  const [selected, setSelected] = useState([]);
  const [custom, setCustom] = useState('');
  const toast = useToast();

  useEffect(() => {
    api.get('/facilities').then(setAllFacilities).catch(() => {});
    if (clinic?.id) {
      api.get(`/clinic/${clinic.id}/facilities`).then(f => {
        setSelected(f.map(x => x.facility_id || x.custom_name));
      }).catch(() => {});
    }
  }, [clinic]);

  const toggle = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const save = async () => {
    const facilities = selected.map(id => {
      const fac = allFacilities.find(f => f.id === id);
      if (fac) return { facility_id: id };
      return { custom_name: id };
    });
    if (custom.trim()) facilities.push({ custom_name: custom.trim() });
    try {
      await api.post('/clinic/facilities', { facilities });
      toast('Facilities saved!', 'success');
      onNext();
    } catch (err) { toast(err.message, 'error'); }
  };

  // const facilityIcon = { Parking: '🚗', Pharmacy: '💊', Laboratory: '🔬', Emergency: '🚨', Ambulance: '🚑', ICU: '❤️', OT: '🏥', Cafeteria: '🍽', Wheelchair: '♿', WiFi: '📶', 'AC Rooms': '❄️', 'X-Ray': '📡', Ultrasound: '🔊', ECG: '📊', 'Blood Bank': '🩸' };

  return (
    <div className="step-form">
      <p style={{ color: 'var(--brand-text-light)', fontSize: 14 }}>Select available facilities at your clinic.</p>
      <div className="facilities-grid">
        {allFacilities.map(f => (
          <div key={f.id} className={`facility-chip ${selected.includes(f.id) ? 'selected' : ''}`} onClick={() => toggle(f.id)}>
            <span className="chip-icon">{f.icon || '🏥'}</span>
            {f.name}
          </div>
        ))}
      </div>
      <div className="form-group">
        <label className="form-label">Custom Facility</label>
        <input className="form-input" placeholder="Add any other facility..." value={custom} onChange={e => setCustom(e.target.value)} />
      </div>
      <div className="step-actions">
        <button className="btn btn-outline" onClick={onPrev}>← Back</button>
        <button className="btn btn-primary" onClick={save}>Save & Continue →</button>
      </div>
    </div>
  );
}

// Step5About.jsx
export function Step5About({ clinic, saveClinic, onNext, onPrev, saving }) {
  const [form, setForm] = useState({
    about_us: clinic?.about_us || '',
    mission: clinic?.mission || '',
    vision: clinic?.vision || '',
  });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handle = async () => {
    try { await saveClinic(form); onNext(); } catch {}
  };

  return (
    <div className="step-form">
      <div className="form-group">
        <label className="form-label">About Us *</label>
        <textarea className="form-input" rows={5} placeholder="Tell patients about your clinic — history, specialties, what makes you special..." value={form.about_us} onChange={set('about_us')} />
      </div>
      <div className="form-group">
        <label className="form-label">Mission Statement</label>
        <textarea className="form-input" rows={3} placeholder="Your clinic's mission..." value={form.mission} onChange={set('mission')} />
      </div>
      <div className="form-group">
        <label className="form-label">Vision Statement</label>
        <textarea className="form-input" rows={3} placeholder="Your clinic's vision..." value={form.vision} onChange={set('vision')} />
      </div>
      <div className="step-actions">
        <button className="btn btn-outline" onClick={onPrev}>← Back</button>
        <button className="btn btn-primary" onClick={handle} disabled={saving}>
          {saving ? <><div className="spinner" />Saving...</> : 'Save & Continue →'}
        </button>
      </div>
    </div>
  );
}

// Step6Contact.jsx
export function Step6Contact({ clinic, saveClinic, onNext, onPrev, saving }) {
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [form, setForm] = useState({ google_maps_link: clinic?.google_maps_link || '' });
  const [hours, setHours] = useState(
    DAYS.map((_, i) => ({ day_of_week: i, is_open: i !== 0, open_time: '09:00', close_time: '18:00', has_break: false, break_start: '13:00', break_end: '14:00' }))
  );
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const setHour = (i, k, v) => setHours(h => h.map((d, idx) => idx === i ? { ...d, [k]: v } : d));

  const handle = async () => {
    try {
      await saveClinic(form);
      await api.post('/clinic/working-hours', { hours });
      onNext();
    } catch {}
  };

  return (
    <div className="step-form">
      <div className="form-group">
        <label className="form-label">Google Maps Link</label>
        <input className="form-input" placeholder="https://maps.google.com/..." value={form.google_maps_link} onChange={set('google_maps_link')} />
        <span className="form-hint">Patients can get directions directly to your clinic.</span>
      </div>
      <div className="step-section-title">Working Hours</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {hours.map((h, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 60px 1fr', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--brand-border)' }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{DAYS[i]}</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={h.is_open} onChange={e => setHour(i, 'is_open', e.target.checked)} />
              {h.is_open ? 'Open' : 'Closed'}
            </label>
            {h.is_open && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                <input type="time" className="form-input" style={{ width: 120 }} value={h.open_time} onChange={e => setHour(i, 'open_time', e.target.value)} />
                <span>to</span>
                <input type="time" className="form-input" style={{ width: 120 }} value={h.close_time} onChange={e => setHour(i, 'close_time', e.target.value)} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="step-actions">
        <button className="btn btn-outline" onClick={onPrev}>← Back</button>
        <button className="btn btn-primary" onClick={handle} disabled={saving}>
          {saving ? <><div className="spinner" />Saving...</> : 'Save & Continue →'}
        </button>
      </div>
    </div>
  );
}

// Step7Theme.jsx
export function Step7Theme({ clinic, onNext, onPrev }) {
  const TEMPLATES = [
    { id: 'modern', label: 'Modern', colors: ['#2563EB', '#10B981', '#F59E0B'] },
    { id: 'classic', label: 'Classic', colors: ['#7C3AED', '#EC4899', '#F97316'] },
    { id: 'minimal', label: 'Minimal', colors: ['#1F2937', '#6B7280', '#374151'] },
    { id: 'vibrant', label: 'Vibrant', colors: ['#DC2626', '#F97316', '#EAB308'] },
    { id: 'elegant', label: 'Elegant', colors: ['#D97706', '#92400E', '#78350F'] },
  ];
  const [theme, setTheme] = useState({
    template_id: clinic?.template_id || 'modern',
    primary_color: clinic?.primary_color || '#2563EB',
    secondary_color: clinic?.secondary_color || '#10B981',
    accent_color: clinic?.accent_color || '#F59E0B',
  });
  const toast = useToast();

  const save = async () => {
    try {
      await api.put('/clinic/theme', theme);
      toast('Theme saved!', 'success');
      onNext();
    } catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div className="step-form">
      <div className="step-section-title">Choose Template</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {TEMPLATES.map(t => (
          <div key={t.id}
            style={{ border: `2px solid ${theme.template_id === t.id ? t.colors[0] : 'var(--brand-border)'}`, borderRadius: 'var(--radius)', padding: 12, cursor: 'pointer', textAlign: 'center', background: theme.template_id === t.id ? t.colors[0] + '10' : 'white', transition: 'all 0.2s' }}
            onClick={() => setTheme(p => ({ ...p, template_id: t.id, primary_color: t.colors[0], secondary_color: t.colors[1], accent_color: t.colors[2] }))}>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 8 }}>
              {t.colors.map(c => <div key={c} style={{ width: 16, height: 16, borderRadius: '50%', background: c }} />)}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: theme.template_id === t.id ? t.colors[0] : 'var(--brand-text)' }}>{t.label}</span>
          </div>
        ))}
      </div>
      <div className="step-section-title">Custom Colors</div>
      <div className="form-grid-3">
        {[['primary_color', 'Primary Color'], ['secondary_color', 'Secondary Color'], ['accent_color', 'Accent Color']].map(([k, label]) => (
          <div key={k} className="form-group">
            <label className="form-label">{label}</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="color" value={theme[k]} onChange={e => setTheme(p => ({ ...p, [k]: e.target.value }))} style={{ width: 44, height: 40, padding: 2, border: '1.5px solid var(--brand-border)', borderRadius: 8, cursor: 'pointer' }} />
              <input className="form-input" value={theme[k]} onChange={e => setTheme(p => ({ ...p, [k]: e.target.value }))} />
            </div>
          </div>
        ))}
      </div>
      <div className="step-actions">
        <button className="btn btn-outline" onClick={onPrev}>← Back</button>
        <button className="btn btn-primary" onClick={save}>Save & Continue →</button>
      </div>
    </div>
  );
}

// Step8Preview.jsx  
export function Step8Preview({ clinic, onNext, onPrev }) {
  if (!clinic) return <div>Loading preview...</div>;
  return (
    <div className="step-form">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ color: 'var(--brand-text-light)', fontSize: 14 }}>Preview your clinic website before publishing.</p>
        <a href={`/clinic/${clinic.clinic_id_slug}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Open Full Preview ↗</a>
      </div>
      <div style={{ border: '2px solid var(--brand-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: 500 }}>
        <div style={{ background: '#F4F7FC', padding: '10px 14px', borderBottom: '1px solid var(--brand-border)', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57', display: 'block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E', display: 'block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840', display: 'block' }} />
          <span style={{ fontSize: 11, color: 'var(--brand-muted)', marginLeft: 8 }}>cliniccraft.in/clinic/{clinic.clinic_id_slug}</span>
        </div>
        <iframe
          src={`/clinic/${clinic.clinic_id_slug}`}
          style={{ width: '100%', height: 460, border: 'none' }}
          title="Clinic Preview"
        />
      </div>
      <div className="step-actions">
        <button className="btn btn-outline" onClick={onPrev}>← Back</button>
        <button className="btn btn-primary" onClick={onNext}>Looks Good! Publish →</button>
      </div>
    </div>
  );
}
