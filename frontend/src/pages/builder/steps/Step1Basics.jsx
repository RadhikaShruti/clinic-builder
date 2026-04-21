import { useState } from 'react';

export default function Step1Basics({ clinic, saveClinic, onNext, saving }) {
  const [form, setForm] = useState({
    clinic_name: clinic?.clinic_name || '',
    tagline: clinic?.tagline || '',
    phone: clinic?.phone || '',
    email: clinic?.email || '',
    whatsapp: clinic?.whatsapp || '',
    website: clinic?.website || '',
    address_line1: clinic?.address_line1 || '',
    address_line2: clinic?.address_line2 || '',
    city: clinic?.city || '',
    state: clinic?.state || '',
    pincode: clinic?.pincode || '',
    country: clinic?.country || 'India',
    established_year: clinic?.established_year || '',
    registration_number: clinic?.registration_number || '',
    gstin: clinic?.gstin || '',
  });

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveClinic(form);
      onNext();
    } catch {}
  };

  return (
    <form className="step-form" onSubmit={handleSubmit}>
      <div className="step-section-title">Clinic Identity</div>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Clinic Name *</label>
          <input className="form-input" placeholder="e.g. Apollo Dental Care" value={form.clinic_name} onChange={set('clinic_name')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Tagline</label>
          <input className="form-input" placeholder="e.g. Advanced Care, Trusted Smiles" value={form.tagline} onChange={set('tagline')} />
        </div>
      </div>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Established Year</label>
          <input className="form-input" type="number" placeholder="2010" value={form.established_year} onChange={set('established_year')} min="1900" max={new Date().getFullYear()} />
        </div>
        <div className="form-group">
          <label className="form-label">Registration Number</label>
          <input className="form-input" placeholder="Clinic/Hospital Registration No." value={form.registration_number} onChange={set('registration_number')} />
          <span className="form-hint">State/Central Medical Council registration</span>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">GSTIN</label>
        <input className="form-input" placeholder="GST Identification Number (optional)" value={form.gstin} onChange={set('gstin')} />
      </div>

      <div className="step-section-title">Contact Details</div>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input className="form-input" type="email" placeholder="clinic@email.com" value={form.email} onChange={set('email')} required />
        </div>
      </div>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">WhatsApp Number</label>
          <input className="form-input" placeholder="+91 98765 43210" value={form.whatsapp} onChange={set('whatsapp')} />
        </div>
        <div className="form-group">
          <label className="form-label">Website (if any)</label>
          <input className="form-input" placeholder="https://yourclinic.com" value={form.website} onChange={set('website')} />
        </div>
      </div>

      <div className="step-section-title">Clinic Address</div>
      <div className="form-group">
        <label className="form-label">Address Line 1 *</label>
        <input className="form-input" placeholder="Building No, Street Name" value={form.address_line1} onChange={set('address_line1')} required />
      </div>
      <div className="form-group">
        <label className="form-label">Address Line 2</label>
        <input className="form-input" placeholder="Area, Landmark" value={form.address_line2} onChange={set('address_line2')} />
      </div>
      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label">City *</label>
          <input className="form-input" placeholder="Mumbai" value={form.city} onChange={set('city')} required />
        </div>
        <div className="form-group">
          <label className="form-label">State *</label>
          <input className="form-input" placeholder="Maharashtra" value={form.state} onChange={set('state')} required />
        </div>
        <div className="form-group">
          <label className="form-label">Pincode *</label>
          <input className="form-input" placeholder="400001" value={form.pincode} onChange={set('pincode')} required />
        </div>
      </div>

      <div className="step-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <><div className="spinner" />Saving...</> : 'Save & Continue →'}
        </button>
      </div>
    </form>
  );
}
