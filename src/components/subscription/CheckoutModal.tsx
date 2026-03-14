import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import JharokhaArch from '@/components/admin/JharokhaArch';
import { X, Loader2, Smartphone, CreditCard, Landmark, Banknote, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

interface CheckoutModalProps {
  planType: 'single' | 'family';
  onClose: () => void;
}

const PLAN_DETAILS = {
  single: { name: 'Sanjeevani+ Single', price: 5000, members: 1, color: '#0891B2' },
  family: { name: 'Sanjeevani+ Family', price: 6000, members: 4, color: '#F59E0B' },
};

const PAYMENT_METHODS = [
  { key: 'upi', label: 'UPI', icon: Smartphone },
  { key: 'card', label: 'Card', icon: CreditCard },
  { key: 'netbanking', label: 'Net Banking', icon: Landmark },
  { key: 'cash', label: 'Cash/Other', icon: Banknote },
] as const;

type PaymentMethod = typeof PAYMENT_METHODS[number]['key'];

const CheckoutModal = ({ planType, onClose }: CheckoutModalProps) => {
  const navigate = useNavigate();
  const plan = PLAN_DETAILS[planType];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [transactionId, setTransactionId] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const startDate = new Date();
  const endDate = addDays(startDate, 365);

  const canSubmit = confirmed && (paymentMethod !== 'upi' || transactionId.trim().length >= 6);

  const handleActivatePlan = async () => {
    setIsSubmitting(true);
    try {
      // Get current user's patient ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('supabase_user_id', user.id)
        .single();

      if (!patient) throw new Error('No patient profile found');

      // Get the plan from the database
      const { data: planData } = await (supabase as any)
        .from('subscription_plans')
        .select('id, free_appointments_per_year')
        .eq('plan_type', planType)
        .eq('is_active', true)
        .single();

      if (!planData) throw new Error('Plan not found');

      // Insert subscription with pending_payment status
      const { error } = await (supabase as any)
        .from('patient_subscriptions')
        .insert({
          patient_id: patient.id,
          plan_id: planData.id,
          plan_type: planType,
          started_at: format(startDate, 'yyyy-MM-dd'),
          expires_at: format(endDate, 'yyyy-MM-dd'),
          status: 'pending_payment',
          free_appointments_total: planData.free_appointments_per_year,
          free_appointments_used: 0,
          payment_method: paymentMethod,
          payment_reference: transactionId || null,
          amount_paid: plan.price,
        });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Purchase submitted! Payment verification in progress.');

    } catch (err: any) {
      toast.error(err.message || 'Failed to submit purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl max-w-[520px] w-full max-h-[90vh] overflow-y-auto"
        style={{ border: '1px solid #E2EEF1', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <JharokhaArch color={plan.color} opacity={0.18} />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[22px] font-bold" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>
              {submitted ? 'Payment Submitted' : 'Complete Your Purchase'}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
              <X size={18} style={{ color: '#64748B' }} />
            </button>
          </div>

          {submitted ? (
            /* ─── Success / Waiting Screen ─── */
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ background: '#EBF7FA' }}>
                <Clock size={32} style={{ color: '#0891B2' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>
                ⏳ Payment Verification in Progress
              </h3>
              {transactionId && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4"
                  style={{ background: '#EBF7FA', border: '1px solid #D1EBF1' }}>
                  <span className="text-[13px]" style={{ color: '#64748B' }}>Transaction ID:</span>
                  <span className="text-[13px] font-bold" style={{ color: '#0891B2' }}>{transactionId}</span>
                  <CheckCircle2 size={14} style={{ color: '#10B981' }} />
                </div>
              )}
              <p className="text-[14px] mb-6 max-w-sm mx-auto" style={{ color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                Our team verifies payments within 2 hours. You'll receive a confirmation on your dashboard.
              </p>
              <button onClick={() => navigate('/patient/dashboard')}
                className="px-6 py-2.5 rounded-lg text-[14px] font-semibold text-white transition-all hover:opacity-90"
                style={{ background: '#0891B2' }}>
                Go to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* ─── Order Summary ─── */}
              <div className="rounded-lg p-4 mb-6" style={{ background: '#EBF7FA', border: '1px solid #D1EBF1' }}>
                <div className="space-y-2 text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="flex justify-between">
                    <span style={{ color: '#64748B' }}>Plan</span>
                    <span className="font-semibold" style={{ color: '#1E293B' }}>{plan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#64748B' }}>Period</span>
                    <span style={{ color: '#1E293B' }}>1 Year ({format(startDate, 'dd MMM yyyy')} → {format(endDate, 'dd MMM yyyy')})</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#64748B' }}>Members</span>
                    <span style={{ color: '#1E293B' }}>{plan.members === 1 ? '1' : `Up to ${plan.members}`}</span>
                  </div>
                  <div className="h-px my-2" style={{ background: '#D1EBF1' }} />
                  <div className="flex justify-between">
                    <span className="font-bold" style={{ color: '#1E293B' }}>Total</span>
                    <span className="text-[16px] font-bold" style={{ color: plan.color }}>
                      ₹{plan.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* ─── Payment Method ─── */}
              <h3 className="text-[14px] font-bold mb-3" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>
                Payment Method
              </h3>
              <div className="grid grid-cols-4 gap-2 mb-5">
                {PAYMENT_METHODS.map(m => (
                  <button key={m.key} onClick={() => setPaymentMethod(m.key)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg text-[11px] font-medium transition-all"
                    style={{
                      background: paymentMethod === m.key ? `${plan.color}12` : '#F7FBFC',
                      border: paymentMethod === m.key ? `2px solid ${plan.color}` : '1px solid #E2EEF1',
                      color: paymentMethod === m.key ? plan.color : '#64748B',
                    }}>
                    <m.icon size={20} />
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Payment Details */}
              {paymentMethod === 'upi' && (
                <div className="rounded-lg p-4 mb-5" style={{ background: '#F7FBFC', border: '1px solid #E2EEF1' }}>
                  <div className="text-center mb-4">
                    {/* Static QR placeholder */}
                    <div className="w-32 h-32 mx-auto rounded-lg flex items-center justify-center mb-3"
                      style={{ background: '#EBF7FA', border: '2px dashed #D1EBF1' }}>
                      <div className="text-center">
                        <Smartphone size={28} style={{ color: '#0891B2' }} className="mx-auto mb-1" />
                        <p className="text-[10px]" style={{ color: '#64748B' }}>UPI QR</p>
                      </div>
                    </div>
                    <p className="text-[13px] font-medium" style={{ color: '#1E293B' }}>
                      Scan and pay ₹{plan.price.toLocaleString('en-IN')} to <strong>sanjeevani@upi</strong>
                    </p>
                  </div>
                  <p className="text-[12px] mb-2" style={{ color: '#64748B' }}>
                    After payment, enter your UPI Transaction ID below:
                  </p>
                  <input
                    className="field-input"
                    placeholder="e.g. UPI123456789"
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value)}
                  />
                </div>
              )}

              {(paymentMethod === 'card' || paymentMethod === 'netbanking') && (
                <div className="rounded-lg p-4 mb-5 text-center" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <p className="text-[13px] font-medium" style={{ color: '#D97706' }}>
                    💳 Razorpay/Cashfree integration coming soon
                  </p>
                  <p className="text-[12px] mt-1" style={{ color: '#92400E' }}>
                    For now, please use UPI or contact support.
                  </p>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="rounded-lg p-4 mb-5" style={{ background: '#F7FBFC', border: '1px solid #E2EEF1' }}>
                  <p className="text-[13px]" style={{ color: '#64748B' }}>
                    Please visit our registered office or contact support to complete cash payment.
                  </p>
                </div>
              )}

              {/* Confirmation checkbox */}
              <label className="flex items-start gap-3 mb-6 cursor-pointer select-none">
                <input type="checkbox" checked={confirmed} onChange={() => setConfirmed(!confirmed)}
                  className="mt-0.5 w-4 h-4 accent-[#0891B2]" />
                <span className="text-[13px]" style={{ color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>
                  I confirm I have completed the payment of ₹{plan.price.toLocaleString('en-IN')}
                </span>
              </label>

              {/* Submit button */}
              <button onClick={handleActivatePlan} disabled={!canSubmit || isSubmitting}
                className="w-full py-3 rounded-lg text-[14px] font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: plan.color }}>
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing...</>
                ) : (
                  <>Activate Plan →</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
