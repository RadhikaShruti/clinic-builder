import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../components/common/Toast';
import Step1Basics from './steps/Step1Basics';
import { Step2Services, Step3Doctors, Step4Facilities, Step5About, Step6Contact, Step7Theme, Step8Preview } from './steps/Steps';
import './Builder.css';

const STEPS = [
  { num: 1, label: 'Basics', icon: '🏥' },
  { num: 2, label: 'Services', icon: '💊' },
  { num: 3, label: 'Doctors', icon: '👨‍⚕️' },
  { num: 4, label: 'Facilities', icon: '🏢' },
  { num: 5, label: 'About', icon: '📖' },
  { num: 6, label: 'Contact', icon: '📍' },
  { num: 7, label: 'Theme', icon: '🎨' },
  { num: 8, label: 'Preview', icon: '👁' },
  { num: 9, label: 'Publish', icon: '🚀' },
];

export default function BuilderWizard() {
  const [step, setStep] = useState(() => {
  return Number(localStorage.getItem('builderStep')) || 1;
  });
  const [clinic, setClinic] = useState(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // useEffect(() => {
  //   api.get('/clinic/me').then(c => setClinic(c)).catch(() => {});
  // }, []);

  useEffect(() => {
  const loadBuilderData = async () => {
    try {
      // 1. Get clinic
      const c = await api.get('/clinic/me');

      if (!c) return;

      setClinic(c);

      // If localStorage already has step, use it
      const savedStep = localStorage.getItem('builderStep');

      if (savedStep) {
        setStep(Number(savedStep));
        return;
      }

      // 2. Check services
      const services = await api.get(`/clinic/${c.id}/services`);

      if (!services || services.length === 0) {
        setStep(2);
        return;
      }

      // 3. Check doctors
      const doctors = await api.get(`/clinic/${c.id}/doctors`);

      if (!doctors || doctors.length === 0) {
        setStep(3);
        return;
      }

      // 4. Check facilities
      const facilities = await api.get(`/clinic/${c.id}/facilities`);

      if (!facilities || facilities.length === 0) {
        setStep(4);
        return;
      }

      // 5. About section
      if (!c.about_us) {
        setStep(5);
        return;
      }

      // 6. Contact section
      if (!c.google_maps_link) {
        setStep(6);
        return;
      }

      // 7. Theme section
      if (!c.template_id) {
        setStep(7);
        return;
      }

      // Everything completed
      setStep(8);

    } catch (err) {
      console.error(err);
    }
  };

  loadBuilderData();
}, []);

  useEffect(() => {
  localStorage.setItem('builderStep', step);
  }, [step]);

  const saveClinic = async (data) => {
    setSaving(true);
    try {
      const result = await api.post('/clinic', data);
      setClinic(result);
      toast('Saved!', 'success');
      return result;
    } catch (err) {
      toast(err.message, 'error');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const next = () => setStep(s => Math.min(s + 1, 9));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const publish = async () => {
    setPublishing(true);
    try {
      await api.post('/clinic/publish', {});
      localStorage.removeItem('builderStep');
      toast('Your clinic website is now LIVE!', 'success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setPublishing(false);
    }
  };

  const renderStep = () => {
    const props = { clinic, setClinic, onNext: next, onPrev: prev, saving, saveClinic };
    switch (step) {
      case 1: return <Step1Basics {...props} />;
      case 2: return <Step2Services {...props} />;
      case 3: return <Step3Doctors {...props} />;
      case 4: return <Step4Facilities {...props} />;
      case 5: return <Step5About {...props} />;
      case 6: return <Step6Contact {...props} />;
      case 7: return <Step7Theme {...props} />;
      case 8: return <Step8Preview {...props} />;
      case 9: return (
        <div className="step-publish">
          <div className="publish-icon">🚀</div>
          <h2>Ready to Go Live?</h2>
          <p>Your clinic website is fully set up. Click the button below to publish it and share the link with your patients!</p>
          {clinic && (
            <div className="publish-url">
              <span>Your URL:</span>
              <code>cliniccraft.in/clinic/{clinic.clinic_id_slug}</code>
            </div>
          )}
          <div className="publish-checklist">
            {['Clinic details complete', 'Doctors added', 'Services listed', 'Theme selected', 'Contact info saved'].map(item => (
              <div key={item} className="publish-check"><span>✓</span>{item}</div>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" onClick={publish} disabled={publishing}>
            {publishing ? <><div className="spinner" />Publishing...</> : '🚀 Publish Website'}
          </button>
          <button className="btn btn-ghost" onClick={prev} style={{ marginTop: 12 }}>← Back to Preview</button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="builder-layout">
      <aside className="builder-sidebar">
        <div className="builder-logo"><span className="logo-icon">⚕</span><span>ClinicCraft</span></div>
        <div className="builder-steps-nav">
          {STEPS.map(s => (
            <button key={s.num} className={`step-nav-item ${step === s.num ? 'active' : ''} ${step > s.num ? 'done' : ''}`} onClick={() => s.num < step && setStep(s.num)}>
              <div className="step-nav-icon">{step > s.num ? '✓' : s.icon}</div>
              <div className="step-nav-label"><span className="step-nav-num">Step {s.num}</span><span>{s.label}</span></div>
            </button>
          ))}
        </div>
        <div className="builder-sidebar-footer">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>← Dashboard</button>
        </div>
      </aside>
      <main className="builder-main">
        <div className="builder-header">
          <div><h1 className="builder-title">{STEPS[step - 1].label}</h1><p className="builder-sub">Step {step} of {STEPS.length}</p></div>
          <div className="builder-progress">
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${(step / STEPS.length) * 100}%` }} /></div>
            <span>{Math.round((step / STEPS.length) * 100)}%</span>
          </div>
        </div>
        <div className="builder-content">{renderStep()}</div>
      </main>
    </div>
  );
}
