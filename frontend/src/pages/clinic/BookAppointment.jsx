import { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import './BookAppointment.css';

const STEPS = ['Select Doctor', 'Choose Date & Time', 'Your Details', 'Confirm'];

export default function BookAppointment({ clinic }) {
  const [step, setStep] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [form, setForm] = useState({ patient_name: '', patient_email: '', patient_phone: '', patient_age: '', patient_gender: '', patient_address: '', reason_for_visit: '', symptoms: '' });
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/clinic/${clinic.id}/doctors`).then(setDoctors).catch(() => {});
  }, [clinic.id]);

  // Load slots when doctor + date selected
  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    api.get(`/appointments/slots?doctorId=${selectedDoctor.id}&date=${selectedDate}`)
      .then(s => setSlots(s))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedDoctor, selectedDate]);

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${m.toString().padStart(2,'0')} ${ampm}`;
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const step1Valid = !!selectedDoctor;
  const step2Valid = !!selectedDate && !!selectedSlot;
  const step3Valid = form.patient_name && form.patient_email && form.patient_phone;

  const goNext = () => {
    if (step === 0 && !step1Valid) return setError('Please select a doctor');
    if (step === 1 && !step2Valid) return setError('Please select a date and time slot');
    if (step === 2 && !step3Valid) return setError('Please fill in all required fields');
    setError('');
    setStep(s => s + 1);
  };

  const submit = async () => {
    setBooking(true);
    setError('');
    try {
      const result = await api.post('/appointments', {
        clinic_id: clinic.id,
        doctor_id: selectedDoctor.id,
        slot_id: selectedSlot.id,
        appointment_date: selectedDate,
        appointment_time: selectedSlot.start_time,
        ...form,
      });
      setBooked(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBooking(false);
    }
  };

  const reset = () => {
    setStep(0);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSlots([]);
    setSelectedSlot(null);
    setForm({ patient_name: '', patient_email: '', patient_phone: '', patient_age: '', patient_gender: '', patient_address: '', reason_for_visit: '', symptoms: '' });
    setBooked(null);
    setError('');
  };

  if (booked) {
    return (
      <div className="book-success">
        <div className="book-success-icon">🎉</div>
        <h2>Appointment Booked!</h2>
        <p>Your appointment has been successfully booked. You'll receive a confirmation shortly.</p>
        <div className="book-confirm-card">
          <div className="book-ref">
            <span>Booking Reference</span>
            <strong>{booked.booking_reference}</strong>
          </div>
          <div className="book-confirm-details">
            <ConfirmRow label="Patient" value={booked.patient_name} />
            <ConfirmRow label="Doctor" value={`Dr. ${selectedDoctor?.full_name}`} />
            <ConfirmRow label="Date" value={formatDate(booked.appointment_date)} />
            <ConfirmRow label="Time" value={formatTime(booked.appointment_time)} />
            <ConfirmRow label="Clinic" value={clinic.clinic_name} />
            <ConfirmRow label="Status" value={<span className="badge badge-yellow">Pending Confirmation</span>} />
          </div>
        </div>
        <div style={{ fontSize: 13, color: '#6B7280', margin: '20px 0 28px', textAlign: 'center' }}>
          Please arrive 10 minutes before your appointment time. Contact us at {clinic.phone} for any queries.
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="clinic-btn-white" style={{ background: 'var(--cp)', color: 'white', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }} onClick={reset}>
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-page">
      <div style={{ background: 'var(--cp)', padding: '50px 0 0' }}>
        <div className="clinic-container">
          <h1 style={{ color: 'white', fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900, marginBottom: 8 }}>Book Appointment</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, marginBottom: 32 }}>Schedule your visit with our expert doctors.</p>
          {/* STEP INDICATORS */}
          <div className="book-steps">
            {STEPS.map((s, i) => (
              <div key={s} className={`book-step-ind ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
                <div className="book-step-circle">{i < step ? '✓' : i + 1}</div>
                <span>{s}</span>
                {i < STEPS.length - 1 && <div className="book-step-line" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="clinic-container book-container">
        <div className="book-main">
          {/* STEP 1: SELECT DOCTOR */}
          {step === 0 && (
            <div className="book-step">
              <h3 className="book-step-title">Choose Your Doctor</h3>
              {doctors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF' }}>No doctors available. Please contact the clinic.</div>
              ) : (
                <div className="doctor-select-grid">
                  {doctors.map(d => (
                    <div key={d.id} className={`doctor-select-card ${selectedDoctor?.id === d.id ? 'selected' : ''}`} onClick={() => { setSelectedDoctor(d); setError(''); }}>
                      <div className="doctor-select-avatar">
                        {d.profile_image ? <img src={d.profile_image} alt={d.full_name} /> : '👨‍⚕️'}
                      </div>
                      <div className="doctor-select-info">
                        <div className="doctor-select-name">Dr. {d.full_name}</div>
                        <div className="doctor-select-spec">{d.specialization}</div>
                        <div className="doctor-select-qual">{d.qualification} • {d.experience_years} yrs</div>
                        {d.consultation_fee && <div className="doctor-select-fee">₹{d.consultation_fee} consultation</div>}
                        {d.schedules?.filter(s => s.is_available).length > 0 && (
                          <div className="doctor-select-avail">
                            Available: {d.schedules.filter(s => s.is_available).map(s => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][s.day_of_week]).join(', ')}
                          </div>
                        )}
                      </div>
                      {selectedDoctor?.id === d.id && <div className="doctor-select-check">✓</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DATE & TIME */}
          {step === 1 && (
            <div className="book-step">
              <h3 className="book-step-title">Select Date & Time</h3>
              <div className="date-time-grid">
                <div>
                  <div className="book-field-label">Pick a Date</div>
                  <input
                    type="date"
                    className="book-date-input"
                    value={selectedDate}
                    min={getMinDate()}
                    max={getMaxDate()}
                    onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
                  />
                  {selectedDate && (
                    <div className="selected-date-display">
                      📅 {formatDate(selectedDate)}
                    </div>
                  )}
                </div>

                <div>
                  <div className="book-field-label">
                    Available Slots
                    {selectedDate && <span style={{ fontWeight: 400, color: '#9CA3AF', marginLeft: 8 }}>({slots.filter(s => !s.is_booked).length} available)</span>}
                  </div>
                  {!selectedDate ? (
                    <div className="slots-empty">👆 Please select a date first</div>
                  ) : slotsLoading ? (
                    <div className="slots-loading"><div className="spinner spinner-dark" />Loading slots...</div>
                  ) : slots.length === 0 ? (
                    <div className="slots-empty">No slots available for this date. Please try another day.</div>
                  ) : (
                    <div className="slots-grid">
                      {slots.map(slot => (
                        <button
                          key={slot.id}
                          className={`slot-btn ${slot.is_booked ? 'booked' : ''} ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                          disabled={slot.is_booked}
                          onClick={() => { setSelectedSlot(slot); setError(''); }}
                        >
                          <span className="slot-time">{formatTime(slot.start_time)}</span>
                          {slot.is_booked && <span className="slot-tag">Booked</span>}
                          {selectedSlot?.id === slot.id && <span className="slot-tag selected">Selected</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedSlot && (
                <div className="slot-confirm-banner">
                  ✅ Selected: <strong>{formatDate(selectedDate)}</strong> at <strong>{formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}</strong>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PATIENT DETAILS */}
          {step === 2 && (
            <div className="book-step">
              <h3 className="book-step-title">Your Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name <span style={{ color: 'red' }}>*</span></label>
                    <input className="form-input" placeholder="Your full name" value={form.patient_name} onChange={e => setForm(p => ({ ...p, patient_name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number <span style={{ color: 'red' }}>*</span></label>
                    <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.patient_phone} onChange={e => setForm(p => ({ ...p, patient_phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address <span style={{ color: 'red' }}>*</span></label>
                  <input className="form-input" type="email" placeholder="your@email.com" value={form.patient_email} onChange={e => setForm(p => ({ ...p, patient_email: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input className="form-input" type="number" placeholder="30" value={form.patient_age} onChange={e => setForm(p => ({ ...p, patient_age: e.target.value }))} min="0" max="120" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-input" value={form.patient_gender} onChange={e => setForm(p => ({ ...p, patient_gender: e.target.value }))}>
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Reason for Visit</label>
                  <input className="form-input" placeholder="e.g. Regular checkup, tooth pain, fever..." value={form.reason_for_visit} onChange={e => setForm(p => ({ ...p, reason_for_visit: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Symptoms / Additional Notes</label>
                  <textarea className="form-input" rows={3} placeholder="Describe your symptoms or any important information for the doctor..." value={form.symptoms} onChange={e => setForm(p => ({ ...p, symptoms: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRM */}
          {step === 3 && (
            <div className="book-step">
              <h3 className="book-step-title">Confirm Your Appointment</h3>
              <div className="confirm-summary">
                <div className="confirm-section">
                  <h4>Appointment Details</h4>
                  <ConfirmRow label="Doctor" value={`Dr. ${selectedDoctor?.full_name} — ${selectedDoctor?.specialization}`} />
                  <ConfirmRow label="Date" value={formatDate(selectedDate)} />
                  <ConfirmRow label="Time" value={`${formatTime(selectedSlot?.start_time)} – ${formatTime(selectedSlot?.end_time)}`} />
                  <ConfirmRow label="Clinic" value={clinic.clinic_name} />
                  {selectedDoctor?.consultation_fee && <ConfirmRow label="Consultation Fee" value={`₹${selectedDoctor.consultation_fee}`} />}
                </div>
                <div className="confirm-section">
                  <h4>Patient Details</h4>
                  <ConfirmRow label="Name" value={form.patient_name} />
                  <ConfirmRow label="Phone" value={form.patient_phone} />
                  <ConfirmRow label="Email" value={form.patient_email} />
                  {form.patient_age && <ConfirmRow label="Age / Gender" value={`${form.patient_age} yrs, ${form.patient_gender}`} />}
                  {form.reason_for_visit && <ConfirmRow label="Reason" value={form.reason_for_visit} />}
                </div>
              </div>
              <div className="confirm-note">
                📋 Your appointment will be confirmed by the clinic team. You may receive a call to verify your booking.
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', color: '#B91C1C', fontSize: 14, marginTop: 12 }}>
              ⚠️ {error}
            </div>
          )}

          {/* NAVIGATION */}
          <div className="book-nav">
            {step > 0 && (
              <button className="btn btn-outline" onClick={() => { setStep(s => s - 1); setError(''); }}>
                ← Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < 3 ? (
              <button className="btn btn-primary" style={{ background: 'var(--cp)', borderColor: 'var(--cp)', minWidth: 160 }} onClick={goNext}>
                Continue →
              </button>
            ) : (
              <button className="btn btn-primary" style={{ background: 'var(--cp)', borderColor: 'var(--cp)', minWidth: 180 }} onClick={submit} disabled={booking}>
                {booking ? <><div className="spinner" />Booking...</> : '✅ Confirm Booking'}
              </button>
            )}
          </div>
        </div>

        {/* SIDEBAR SUMMARY */}
        <div className="book-sidebar">
          <div className="book-summary-card">
            <h4 className="book-summary-title">Booking Summary</h4>
            {selectedDoctor ? (
              <div className="book-summary-doctor">
                <div style={{ fontSize: 28 }}>👨‍⚕️</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Dr. {selectedDoctor.full_name}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{selectedDoctor.specialization}</div>
                  {selectedDoctor.consultation_fee && <div style={{ fontSize: 12, color: 'var(--cp)', fontWeight: 700, marginTop: 2 }}>₹{selectedDoctor.consultation_fee}</div>}
                </div>
              </div>
            ) : (
              <div style={{ color: '#9CA3AF', fontSize: 13, padding: '12px 0' }}>No doctor selected yet</div>
            )}
            {selectedDate && (
              <div className="book-summary-row">
                <span>📅</span>
                <span>{formatDate(selectedDate)}</span>
              </div>
            )}
            {selectedSlot && (
              <div className="book-summary-row">
                <span>🕐</span>
                <span>{formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}</span>
              </div>
            )}
            {form.patient_name && (
              <div className="book-summary-row">
                <span>👤</span>
                <span>{form.patient_name}</span>
              </div>
            )}
            <div className="book-summary-clinic">
              <div style={{ fontWeight: 700, fontSize: 13 }}>{clinic.clinic_name}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>{clinic.city}, {clinic.state}</div>
              {clinic.phone && <a href={`tel:${clinic.phone}`} style={{ fontSize: 12, color: 'var(--cp)', fontWeight: 600, display: 'block', marginTop: 4 }}>📞 {clinic.phone}</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', width: 120, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: '#1F2937', fontWeight: 500 }}>{value}</span>
    </div>
  );
}
