import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../components/common/Toast';

const STATUS_LABELS = { pending: '⏳ Pending', confirmed: '✅ Confirmed', completed: '🏁 Completed', cancelled: '❌ Cancelled', no_show: '👻 No Show' };
const STATUS_COLORS = { pending: 'badge-yellow', confirmed: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red', no_show: 'badge-gray' };

export default function AppointmentsPanel({ clinic }) {
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (dateFilter) params.set('date', dateFilter);
      const data = await api.get(`/appointments?${params}`);
      setAppointments(data.appointments);
      setTotal(data.total);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter, dateFilter]);

  const updateStatus = async (id, status) => {
    try {
      const updated = await api.put(`/appointments/${id}/status`, { status });
      setAppointments(p => p.map(a => a.id === id ? { ...a, ...updated } : a));
      if (selected?.id === id) setSelected({ ...selected, ...updated });
      toast(`Appointment ${status}`, 'success');
    } catch (err) { toast(err.message, 'error'); }
  };

  return (
    <div>
      <div className="panel-toolbar">
        <div>
          <h2 style={{ fontSize: 18, color: 'var(--brand-primary)' }}>Appointments</h2>
          <p style={{ fontSize: 13, color: 'var(--brand-muted)' }}>{total} total</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input type="date" className="form-input" style={{ width: 160 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        </div>
      </div>

      <div className="panel-filters" style={{ marginBottom: 20 }}>
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
          <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner spinner-dark" style={{ margin: '0 auto' }} /></div>
          ) : appointments.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--brand-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
              <p>No appointments found</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Ref</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id} onClick={() => setSelected(selected?.id === a.id ? null : a)} style={{ cursor: 'pointer', background: selected?.id === a.id ? 'var(--brand-accent-light)' : '' }}>
                    <td>
                      <strong style={{ fontSize: 13 }}>{a.patient_name}</strong>
                      <div style={{ fontSize: 11, color: 'var(--brand-muted)' }}>{a.patient_phone}</div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--brand-text-light)' }}>{a.doctor_name}</td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{new Date(a.appointment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      <div style={{ fontSize: 11, color: 'var(--brand-muted)' }}>{a.appointment_time?.slice(0,5)}</div>
                    </td>
                    <td><span className={`badge ${STATUS_COLORS[a.status]}`}>{a.status}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--brand-muted)', fontFamily: 'monospace' }}>{a.booking_reference}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {a.status === 'pending' && (
                          <>
                            <button className="btn btn-sm btn-primary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => updateStatus(a.id, 'confirmed')}>Confirm</button>
                            <button className="btn btn-sm btn-danger" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => updateStatus(a.id, 'cancelled')}>Cancel</button>
                          </>
                        )}
                        {a.status === 'confirmed' && (
                          <button className="btn btn-sm btn-outline" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => updateStatus(a.id, 'completed')}>Complete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* DETAIL PANEL */}
        {selected && (
          <div className="card" style={{ alignSelf: 'start' }}>
            <div className="card-header">
              <h3 style={{ fontSize: 14 }}>Appointment Detail</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <DetailRow label="Ref" value={selected.booking_reference} mono />
                <DetailRow label="Patient" value={selected.patient_name} />
                <DetailRow label="Phone" value={selected.patient_phone} />
                <DetailRow label="Email" value={selected.patient_email} />
                {selected.patient_age && <DetailRow label="Age" value={`${selected.patient_age} yrs, ${selected.patient_gender}`} />}
                <DetailRow label="Doctor" value={selected.doctor_name} />
                <DetailRow label="Date" value={new Date(selected.appointment_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} />
                <DetailRow label="Time" value={selected.appointment_time?.slice(0, 5)} />
                {selected.reason_for_visit && <DetailRow label="Reason" value={selected.reason_for_visit} />}
                {selected.symptoms && <DetailRow label="Symptoms" value={selected.symptoms} />}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--brand-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</div>
                  <span className={`badge ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
                </div>
                {selected.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => updateStatus(selected.id, 'confirmed')}>✅ Confirm</button>
                    <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => updateStatus(selected.id, 'cancelled')}>❌ Cancel</button>
                  </div>
                )}
                {selected.status === 'confirmed' && (
                  <button className="btn btn-outline btn-sm" onClick={() => updateStatus(selected.id, 'completed')}>Mark Completed</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--brand-muted)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--brand-text)', fontFamily: mono ? 'monospace' : 'inherit', fontWeight: 500 }}>{value || '—'}</div>
    </div>
  );
}
