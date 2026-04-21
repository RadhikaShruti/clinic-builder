// DoctorsPanel.jsx
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/common/Toast';

export function DoctorsPanel({ clinic }) {
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editDoc, setEditDoc] = useState(null);
  const [form, setForm] = useState({ full_name: '', qualification: '', specialization: '', experience_years: '', designation: '', department: '', medical_registration_number: '', registration_council: '', consultation_fee: '', bio: '', phone: '', email: '', gender: '' });
  const [schedules, setSchedules] = useState(
    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((_, i) => ({ day_of_week: i, is_available: i !== 0, start_time: '09:00', end_time: '17:00', slot_duration: 20, max_appointments: 20 }))
  );
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get(`/clinic/${clinic.id}/doctors`).then(setDoctors).catch(() => {});
  }, [clinic]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const setSched = (i, k, v) => setSchedules(s => s.map((d, idx) => idx === i ? { ...d, [k]: v } : d));

  const openEdit = (doc) => {
    setEditDoc(doc);
    setForm({ full_name: doc.full_name, qualification: doc.qualification, specialization: doc.specialization, experience_years: doc.experience_years, designation: doc.designation || '', department: doc.department || '', medical_registration_number: doc.medical_registration_number || '', registration_council: doc.registration_council || '', consultation_fee: doc.consultation_fee || '', bio: doc.bio || '', phone: doc.phone || '', email: doc.email || '', gender: doc.gender || '' });
    if (doc.schedules?.length) setSchedules(doc.schedules);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.full_name || !form.qualification || !form.specialization) return toast('Name, qualification, specialization required', 'error');
    setLoading(true);
    try {
      if (editDoc) {
        const updated = await api.put(`/doctors/${editDoc.id}`, { ...form, schedules });
        setDoctors(p => p.map(d => d.id === editDoc.id ? { ...d, ...updated } : d));
        toast('Doctor updated!', 'success');
      } else {
        const d = await api.post('/doctors', { ...form, schedules });
        setDoctors(p => [...p, d]);
        toast('Doctor added!', 'success');
      }
      setShowForm(false); setEditDoc(null);
      setForm({ full_name: '', qualification: '', specialization: '', experience_years: '', designation: '', department: '', medical_registration_number: '', registration_council: '', consultation_fee: '', bio: '', phone: '', email: '', gender: '' });
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    if (!confirm('Remove this doctor?')) return;
    try { await api.delete(`/doctors/${id}`); setDoctors(p => p.filter(d => d.id !== id)); toast('Doctor removed', 'success'); }
    catch (err) { toast(err.message, 'error'); }
  };

  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div>
      <div className="panel-toolbar">
        <h2 style={{ fontSize: 18, color: 'var(--brand-primary)' }}>Doctors ({doctors.length})</h2>
        <button className="btn btn-primary" onClick={() => { setEditDoc(null); setShowForm(true); }}>+ Add Doctor</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {doctors.map(d => (
          <div key={d.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, background: 'var(--brand-soft)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>👨‍⚕️</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Dr. {d.full_name}</div>
                <div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>{d.specialization}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--brand-text-light)', marginBottom: 12 }}>
              <div>{d.qualification} • {d.experience_years} yrs</div>
              {d.medical_registration_number && <div style={{ marginTop: 4 }}>Reg: {d.medical_registration_number}</div>}
              {d.consultation_fee && <div style={{ marginTop: 4 }}>Fee: ₹{d.consultation_fee}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(d)}>Edit</button>
              <button className="btn btn-ghost btn-sm" onClick={() => remove(d.id)}>🗑</button>
            </div>
          </div>
        ))}
        <div className="add-item-btn" style={{ minHeight: 120 }} onClick={() => { setEditDoc(null); setShowForm(true); }}>+ Add Doctor</div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h3>{editDoc ? 'Edit Doctor' : 'Add New Doctor'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" value={form.full_name} onChange={set('full_name')} placeholder="Dr. Anita Sharma" /></div>
                  <div className="form-group"><label className="form-label">Qualification *</label><input className="form-input" value={form.qualification} onChange={set('qualification')} placeholder="MBBS, MD" /></div>
                  <div className="form-group"><label className="form-label">Specialization *</label><input className="form-input" value={form.specialization} onChange={set('specialization')} placeholder="Cardiologist" /></div>
                  <div className="form-group"><label className="form-label">Experience (Years)</label><input className="form-input" type="number" value={form.experience_years} onChange={set('experience_years')} /></div>
                  <div className="form-group"><label className="form-label">Designation</label><input className="form-input" value={form.designation} onChange={set('designation')} placeholder="Senior Consultant" /></div>
                  <div className="form-group"><label className="form-label">Department</label><input className="form-input" value={form.department} onChange={set('department')} /></div>
                  <div className="form-group"><label className="form-label">Medical Reg. No.</label><input className="form-input" value={form.medical_registration_number} onChange={set('medical_registration_number')} /></div>
                  <div className="form-group"><label className="form-label">Reg. Council</label><input className="form-input" value={form.registration_council} onChange={set('registration_council')} placeholder="MCI / State Council" /></div>
                  <div className="form-group"><label className="form-label">Consultation Fee (₹)</label><input className="form-input" type="number" value={form.consultation_fee} onChange={set('consultation_fee')} /></div>
                  <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={set('phone')} /></div>
                </div>
                <div className="form-group"><label className="form-label">Bio</label><textarea className="form-input" rows={2} value={form.bio} onChange={set('bio')} /></div>
                <div>
                  <div className="form-label" style={{ marginBottom: 10 }}>Weekly Schedule</div>
                  {schedules.map((s, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 60px 1fr', alignItems: 'center', gap: 12, marginBottom: 8, fontSize: 13 }}>
                      <span style={{ fontWeight: 600 }}>{DAYS[i]}</span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
                        <input type="checkbox" checked={s.is_available} onChange={e => setSched(i, 'is_available', e.target.checked)} />
                        {s.is_available ? 'Open' : 'Off'}
                      </label>
                      {s.is_available && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="time" className="form-input" style={{ width: 110 }} value={s.start_time} onChange={e => setSched(i, 'start_time', e.target.value)} />
                          <span>-</span>
                          <input type="time" className="form-input" style={{ width: 110 }} value={s.end_time} onChange={e => setSched(i, 'end_time', e.target.value)} />
                          <input type="number" className="form-input" style={{ width: 70 }} value={s.slot_duration} onChange={e => setSched(i, 'slot_duration', e.target.value)} title="Slot duration (mins)" />
                          <span style={{ color: 'var(--brand-muted)', fontSize: 11 }}>min/slot</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={loading}>
                {loading ? <div className="spinner" /> : editDoc ? 'Update Doctor' : 'Add Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ServicesPanel({ clinic }) {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: '', duration_minutes: 30, price_display: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => { api.get(`/clinic/${clinic.id}/services`).then(setServices).catch(() => {}); }, [clinic]);

  const save = async () => {
    if (!form.name) return toast('Service name required', 'error');
    setLoading(true);
    try {
      const s = await api.post('/services', form);
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
    <div>
      <div className="panel-toolbar">
        <h2 style={{ fontSize: 18, color: 'var(--brand-primary)' }}>Services ({services.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Add Service</button>
      </div>
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Service</th><th>Category</th><th>Duration</th><th>Price</th><th></th></tr></thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong><div style={{ fontSize: 12, color: 'var(--brand-muted)' }}>{s.description?.slice(0, 60)}{s.description?.length > 60 ? '...' : ''}</div></td>
                <td>{s.category_name || s.category || '—'}</td>
                <td>{s.duration_minutes} min</td>
                <td>{s.price_display || '—'}</td>
                <td><button className="btn btn-ghost btn-sm" onClick={() => remove(s.id)}>🗑</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--brand-muted)' }}>No services yet. Add your first service!</div>}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <div className="modal-header"><h3>Add Service</h3><button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button></div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group"><label className="form-label">Service Name *</label><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Root Canal Treatment" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Dental" /></div>
                  <div className="form-group"><label className="form-label">Duration (min)</label><input className="form-input" type="number" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} /></div>
                </div>
                <div className="form-group"><label className="form-label">Price Display</label><input className="form-input" value={form.price_display} onChange={e => setForm(p => ({ ...p, price_display: e.target.value }))} placeholder="₹500 - ₹2000" /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? <div className="spinner" /> : 'Add Service'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BlogPanel({ clinic }) {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', category: '', tags: '', status: 'draft', author_name: '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get(`/clinic/${clinic.id}/blog?status=all`).then(setPosts).catch(() => {});
  }, [clinic]);

  const save = async () => {
    if (!form.title || !form.content) return toast('Title and content required', 'error');
    setLoading(true);
    try {
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()) : [];
      const p = await api.post('/blog', { ...form, tags });
      setPosts(prev => [p, ...prev]);
      setForm({ title: '', excerpt: '', content: '', category: '', tags: '', status: 'draft', author_name: '' });
      setShowForm(false);
      toast('Post created!', 'success');
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    try { await api.delete(`/blog/${id}`); setPosts(p => p.filter(b => b.id !== id)); }
    catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div>
      <div className="panel-toolbar">
        <h2 style={{ fontSize: 18, color: 'var(--brand-primary)' }}>Blog Posts ({posts.length})</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ New Post</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        {posts.map(p => (
          <div key={p.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span className={`badge ${p.status === 'published' ? 'badge-green' : 'badge-gray'}`}>{p.status}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => remove(p.id)}>🗑</button>
            </div>
            <h4 style={{ fontSize: 14, marginBottom: 6 }}>{p.title}</h4>
            <p style={{ fontSize: 12, color: 'var(--brand-muted)', lineHeight: 1.5 }}>{p.excerpt?.slice(0, 80) || ''}...</p>
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--brand-muted)' }}>{new Date(p.created_at).toLocaleDateString('en-IN')} • {p.views} views</div>
          </div>
        ))}
        <div className="add-item-btn" style={{ minHeight: 120 }} onClick={() => setShowForm(true)}>+ New Blog Post</div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 680 }}>
            <div className="modal-header"><h3>New Blog Post</h3><button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button></div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Post title" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Author</label><input className="form-input" value={form.author_name} onChange={e => setForm(p => ({ ...p, author_name: e.target.value }))} /></div>
                  <div className="form-group"><label className="form-label">Status</label>
                    <select className="form-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                      <option value="draft">Draft</option><option value="published">Published</option>
                    </select>
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Tags (comma-separated)</label><input className="form-input" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="health, dental, tips" /></div>
                <div className="form-group"><label className="form-label">Excerpt</label><textarea className="form-input" rows={2} value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Content *</label><textarea className="form-input" rows={8} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write your blog post content here..." /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? <div className="spinner" /> : 'Publish Post'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SettingsPanel({ clinic, setClinic }) {
  const [form, setForm] = useState({ clinic_name: clinic.clinic_name, tagline: clinic.tagline || '', phone: clinic.phone, email: clinic.email, about_us: clinic.about_us || '' });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    setLoading(true);
    try {
      const updated = await api.post('/clinic', form);
      setClinic(updated);
      toast('Settings saved!', 'success');
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="card" style={{ maxWidth: 600 }}>
      <div className="card-header"><h3 style={{ fontSize: 16 }}>Clinic Settings</h3></div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group"><label className="form-label">Clinic Name</label><input className="form-input" value={form.clinic_name} onChange={set('clinic_name')} /></div>
        <div className="form-group"><label className="form-label">Tagline</label><input className="form-input" value={form.tagline} onChange={set('tagline')} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={set('phone')} /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={set('email')} /></div>
        </div>
        <div className="form-group"><label className="form-label">About Us</label><textarea className="form-input" rows={4} value={form.about_us} onChange={set('about_us')} /></div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingTop: 8, borderTop: '1px solid var(--brand-border)' }}>
          <div style={{ flex: 1, fontSize: 13, color: 'var(--brand-muted)' }}>
            Clinic URL: <code style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>/clinic/{clinic.clinic_id_slug}</code>
          </div>
          <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? <div className="spinner" /> : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}

export default DoctorsPanel;
