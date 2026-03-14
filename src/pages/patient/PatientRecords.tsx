import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientContext } from '@/hooks/usePatientContext';
import { supabase } from '@/integrations/supabase/client';
import JharokhaArch from '@/components/admin/JharokhaArch';
import { Pill, Plus, Edit2, BellOff, ChevronDown, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const TABS = ['Current Medications', 'Chronic Conditions', 'Allergy Management', 'Discharge Summaries'];
const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times', 'As needed', 'Other'];
const TIMES = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];

const PatientRecords = () => {
  const { patient } = usePatientContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [medications, setMedications] = useState<any[]>([]);
  const [showAddMed, setShowAddMed] = useState(false);
  const [editMed, setEditMed] = useState<any>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [inactiveMeds, setInactiveMeds] = useState<any[]>([]);

  const fetchMedications = async () => {
    const { data: active } = await supabase.from('patient_medications').select('*').eq('patient_id', patient.id).eq('is_active', true).order('created_at', { ascending: false });
    const { data: inactive } = await supabase.from('patient_medications').select('*').eq('patient_id', patient.id).eq('is_active', false).order('created_at', { ascending: false });
    setMedications(active || []);
    setInactiveMeds(inactive || []);
  };

  useEffect(() => { fetchMedications(); }, [patient.id]);

  const handleMarkInactive = async (id: string) => {
    await supabase.from('patient_medications').update({ is_active: false }).eq('id', id);
    toast.success('Medication marked inactive');
    fetchMedications();
  };

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 p-1 rounded-lg" style={{ background: '#F1F5F9' }}>
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            className="px-4 py-2 rounded-md text-[13px] font-medium transition-all"
            style={{
              background: activeTab === i ? '#FFFFFF' : 'transparent',
              color: activeTab === i ? '#0891B2' : '#64748B',
              boxShadow: activeTab === i ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab 0 — Medications */}
      {activeTab === 0 && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E2EEF1' }}>
          <JharokhaArch color="#0891B2" opacity={0.18} />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>
                Active Medications ({medications.length})
              </h3>
              <button onClick={() => { setEditMed(null); setShowAddMed(true); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-white" style={{ background: '#0891B2' }}>
                <Plus size={14} /> Add Medication
              </button>
            </div>

            {medications.length === 0 ? (
              <p className="py-8 text-center text-[13px]" style={{ color: '#94A3B8' }}>No active medications. Add one to start tracking.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {medications.map(m => (
                  <MedicationCard key={m.id} med={m}
                    onEdit={() => { setEditMed(m); setShowAddMed(true); }}
                    onDeactivate={() => handleMarkInactive(m.id)} />
                ))}
              </div>
            )}

            {inactiveMeds.length > 0 && (
              <div className="mt-6">
                <button onClick={() => setShowInactive(!showInactive)} className="flex items-center gap-1 text-[13px] font-medium" style={{ color: '#64748B' }}>
                  <ChevronDown size={14} className={`transition-transform ${showInactive ? 'rotate-180' : ''}`} />
                  Show past medications ({inactiveMeds.length})
                </button>
                {showInactive && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 opacity-60">
                    {inactiveMeds.map(m => (
                      <MedicationCard key={m.id} med={m} inactive />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 1 — Chronic Conditions */}
      {activeTab === 1 && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E2EEF1' }}>
          <JharokhaArch color="#F59E0B" opacity={0.18} />
          <div className="p-5">
            <h3 className="text-base font-bold mb-4" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>Chronic Conditions</h3>
            {(patient.chronic_conditions || []).length === 0 ? (
              <p className="py-8 text-center text-[13px]" style={{ color: '#94A3B8' }}>No chronic conditions recorded. Update in Settings.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(patient.chronic_conditions || []).map(c => (
                  <span key={c} className="px-3 py-1.5 rounded-full text-[12px] font-medium" style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }}>
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2 — Allergy Management */}
      {activeTab === 2 && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E2EEF1' }}>
          <JharokhaArch color="#EF4444" opacity={0.18} />
          <div className="p-5">
            <h3 className="text-base font-bold mb-4" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>Allergy Management</h3>
            {(patient.allergies || []).length === 0 ? (
              <p className="py-8 text-center text-[13px]" style={{ color: '#94A3B8' }}>No allergies recorded. Update in Settings.</p>
            ) : (
              <div className="space-y-2">
                {(patient.allergies || []).map(a => (
                  <div key={a} className="flex items-center gap-3 p-3 rounded-lg" style={{ borderLeft: '4px solid #EF4444', background: '#FEF2F2' }}>
                    <AlertTriangle size={16} style={{ color: '#EF4444' }} />
                    <p className="text-[13px] font-semibold" style={{ color: '#EF4444' }}>{a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3 — Discharge Summaries */}
      {activeTab === 3 && (
        <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E2EEF1' }}>
          <JharokhaArch color="#64748B" opacity={0.18} />
          <div className="p-5">
            <h3 className="text-base font-bold mb-4" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>Discharge Summaries</h3>
            <div className="py-8 text-center">
              <p className="text-[13px] mb-3" style={{ color: '#94A3B8' }}>View and manage your discharge summaries in the Lab Reports section.</p>
              <button 
                onClick={() => navigate('/patient/dashboard/reports')} 
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-white" 
                style={{ background: '#0891B2' }}>
                Go to Lab Reports →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Medication Modal */}
      {showAddMed && (
        <MedicationModal
          initial={editMed}
          patientId={patient.id}
          onClose={() => { setShowAddMed(false); setEditMed(null); }}
          onSaved={() => { setShowAddMed(false); setEditMed(null); fetchMedications(); }}
        />
      )}
    </div>
  );
};

/* Medication Card */
const MedicationCard = ({ med, onEdit, onDeactivate, inactive }: { med: any; onEdit?: () => void; onDeactivate?: () => void; inactive?: boolean }) => (
  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E2EEF1' }}>
    <JharokhaArch color="#0891B2" opacity={0.12} />
    <div className="p-4">
      <p className="text-[14px] font-bold mb-1" style={{ color: '#1E293B' }}>💊 {med.medicine_name}</p>
      {med.generic_name && <p className="text-[12px] mb-1" style={{ color: '#64748B' }}>Generic: {med.generic_name}</p>}
      <p className="text-[12px]" style={{ color: '#64748B' }}>
        {med.dosage && `${med.dosage} · `}{med.frequency}
      </p>
      {med.time_of_day?.length > 0 && (
        <p className="text-[12px]" style={{ color: '#64748B' }}>⏰ {med.time_of_day.join(' + ')}</p>
      )}
      {med.prescribed_by && <p className="text-[12px] mt-1" style={{ color: '#64748B' }}>Prescribed by {med.prescribed_by}</p>}
      {med.start_date && <p className="text-[11px]" style={{ color: '#94A3B8' }}>Started: {format(new Date(med.start_date), 'dd MMM yyyy')}</p>}
      <p className="text-[11px]" style={{ color: '#94A3B8' }}>Duration: {med.duration_type || '—'}</p>

      {!inactive && (
        <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
          {onEdit && (
            <button onClick={onEdit} className="flex items-center gap-1 text-[12px] font-medium" style={{ color: '#0891B2' }}>
              <Edit2 size={12} /> Edit
            </button>
          )}
          {onDeactivate && (
            <button onClick={onDeactivate} className="flex items-center gap-1 text-[12px] font-medium" style={{ color: '#64748B' }}>
              <BellOff size={12} /> Mark Inactive
            </button>
          )}
        </div>
      )}
    </div>
  </div>
);

/* Medication Modal */
const MedicationModal = ({ initial, patientId, onClose, onSaved }: {
  initial: any; patientId: string; onClose: () => void; onSaved: () => void;
}) => {
  const [form, setForm] = useState({
    medicine_name: initial?.medicine_name || '',
    generic_name: initial?.generic_name || '',
    dosage: initial?.dosage || '',
    frequency: initial?.frequency || '',
    time_of_day: initial?.time_of_day || [],
    prescribed_by: initial?.prescribed_by || '',
    doctor_reg_no: initial?.doctor_reg_no || '',
    start_date: initial?.start_date || '',
    duration_type: initial?.duration_type || 'Temporary',
    end_date: initial?.end_date || '',
    notes: initial?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const toggleTime = (t: string) => {
    setForm(f => ({
      ...f,
      time_of_day: f.time_of_day.includes(t) ? f.time_of_day.filter((x: string) => x !== t) : [...f.time_of_day, t]
    }));
  };

  const handleSave = async () => {
    if (!form.medicine_name) { toast.error('Medicine name is required'); return; }
    setSaving(true);
    try {
      if (initial?.id) {
        await supabase.from('patient_medications').update(form).eq('id', initial.id);
      } else {
        await supabase.from('patient_medications').insert([{ ...form, patient_id: patientId }]);
      }
      toast.success(initial ? 'Medication updated' : 'Medication added');
      onSaved();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl max-w-[480px] w-full max-h-[90vh] overflow-y-auto" style={{ border: '1px solid #E2EEF1' }}>
        <JharokhaArch color="#0891B2" opacity={0.18} />
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>
            {initial ? 'Edit Medication' : 'Add Medication'}
          </h3>

          <div className="space-y-3">
            <Field label="Medicine Name *" value={form.medicine_name} onChange={v => setForm(f => ({ ...f, medicine_name: v }))} />
            <Field label="Generic Name" value={form.generic_name} onChange={v => setForm(f => ({ ...f, generic_name: v }))} />
            <Field label="Dosage" value={form.dosage} onChange={v => setForm(f => ({ ...f, dosage: v }))} placeholder="e.g. 500mg" />

            <div>
              <label className="field-label">Frequency</label>
              <select className="field-input" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                <option value="">Select...</option>
                {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div>
              <label className="field-label">Time of Day</label>
              <div className="flex flex-wrap gap-2">
                {TIMES.map(t => (
                  <button key={t} type="button" onClick={() => toggleTime(t)}
                    className="px-3 py-1 rounded-full text-[12px] font-medium transition-all"
                    style={{
                      background: form.time_of_day.includes(t) ? '#0891B2' : '#F1F5F9',
                      color: form.time_of_day.includes(t) ? '#fff' : '#64748B',
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Field label="Prescribed By" value={form.prescribed_by} onChange={v => setForm(f => ({ ...f, prescribed_by: v }))} />
            <Field label="Doctor Reg. No." value={form.doctor_reg_no} onChange={v => setForm(f => ({ ...f, doctor_reg_no: v }))} />
            <Field label="Start Date" type="date" value={form.start_date} onChange={v => setForm(f => ({ ...f, start_date: v }))} />

            <div>
              <label className="field-label">Duration Type</label>
              <div className="flex gap-2">
                {['Temporary', 'Permanent'].map(d => (
                  <button key={d} type="button" onClick={() => setForm(f => ({ ...f, duration_type: d }))}
                    className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-all"
                    style={{
                      background: form.duration_type === d ? '#0891B2' : '#F1F5F9',
                      color: form.duration_type === d ? '#fff' : '#64748B',
                    }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {form.duration_type === 'Temporary' && (
              <Field label="End Date" type="date" value={form.end_date} onChange={v => setForm(f => ({ ...f, end_date: v }))} />
            )}

            <div>
              <label className="field-label">Notes</label>
              <textarea className="field-input" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white disabled:opacity-50" style={{ background: '#0891B2' }}>
              {saving ? 'Saving...' : 'Save Medication'}
            </button>
            <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-[13px] font-medium" style={{ border: '1px solid #E2EEF1', color: '#64748B' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) => (
  <div>
    <label className="field-label">{label}</label>
    <input className="field-input" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

export default PatientRecords;
