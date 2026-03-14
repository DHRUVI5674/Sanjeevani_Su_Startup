import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import JharokhaArch from '@/components/admin/JharokhaArch';
import { Crown, Zap, Users, Ticket, ArrowRight, Loader2, Clock, Star } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface SubscriptionCardProps {
  patientId: string;
}

interface Subscription {
  id: string;
  plan_type: string;
  status: string;
  started_at: string;
  expires_at: string;
  free_appointments_total: number;
  free_appointments_used: number;
  free_appointments_remaining: number;
  payment_reference: string | null;
}

interface FamilyMember {
  id: string;
  member_patient_id: string;
  relation: string;
  patients: { full_name: string; email: string } | null;
}

const SubscriptionCard = ({ patientId }: SubscriptionCardProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        // Get active or pending subscription
        // Note: patient_subscriptions is a new table, use any cast until types are regenerated
        const { data: sub } = await (supabase as any)
          .from('patient_subscriptions')
          .select('*')
          .eq('patient_id', patientId)
          .in('status', ['active', 'pending_payment'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (sub) {
          setSubscription(sub as Subscription);

          // If family plan, fetch members
          if (sub.plan_type === 'family' && sub.status === 'active') {
            const { data: members } = await (supabase as any)
              .from('family_members')
              .select('id, member_patient_id, relation, patients:member_patient_id(full_name, email)')
              .eq('subscription_id', sub.id);
            setFamilyMembers((members || []) as unknown as FamilyMember[]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscription();
  }, [patientId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl overflow-hidden p-6" style={{ border: '1px solid #E2EEF1' }}>
        <div className="flex items-center justify-center py-4">
          <Loader2 size={20} className="animate-spin" style={{ color: '#0891B2' }} />
        </div>
      </div>
    );
  }

  // ─── Pending Payment State ───
  if (subscription?.status === 'pending_payment') {
    return (
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #F59E0B' }}>
        <JharokhaArch color="#F59E0B" opacity={0.18} />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} style={{ color: '#F59E0B' }} />
            <h3 className="text-base font-bold" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>
              ⏳ Payment Verification in Progress
            </h3>
          </div>
          <p className="text-[13px] mb-3" style={{ color: '#64748B' }}>
            Your {subscription.plan_type === 'single' ? 'Sanjeevani+ Single' : 'Sanjeevani+ Family'} plan purchase is being verified. This usually takes up to 2 hours.
          </p>
          {subscription.payment_reference && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px]"
              style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <span style={{ color: '#64748B' }}>Transaction:</span>
              <span className="font-bold" style={{ color: '#D97706' }}>{subscription.payment_reference}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Free / No Subscription State ───
  if (!subscription || subscription.plan_type === 'free') {
    return (
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E2EEF1' }}>
        <JharokhaArch color="#64748B" opacity={0.18} />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={18} style={{ color: '#F59E0B' }} />
            <h3 className="text-base font-bold" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>
              Upgrade to Sanjeevani+
            </h3>
          </div>
          <p className="text-[13px] mb-4" style={{ color: '#64748B' }}>
            Get 3 free appointments, priority booking, and fast queue access.
          </p>
          <button onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: '#0891B2' }}>
            View Plans <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  // ─── Active Paid Plan ───
  const isSingle = subscription.plan_type === 'single';
  const isFamily = subscription.plan_type === 'family';
  const planColor = isSingle ? '#0891B2' : '#F59E0B';
  const planName = isSingle ? 'Sanjeevani+ Single' : 'Sanjeevani+ Family';
  const expiresAt = new Date(subscription.expires_at);
  const daysLeft = differenceInDays(expiresAt, new Date());
  const showExpiryWarning = daysLeft <= 30;

  const freeTotal = subscription.free_appointments_total;
  const freeUsed = subscription.free_appointments_used;
  const freeRemaining = subscription.free_appointments_remaining;
  const freePercent = freeTotal > 0 ? (freeRemaining / freeTotal) * 100 : 0;

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${planColor}` }}>
      <JharokhaArch color={planColor} opacity={0.18} />
      <div className="p-5">
        {/* Plan Name + Expiry */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {isSingle ? <Star size={18} style={{ color: planColor }} /> : <Users size={18} style={{ color: planColor }} />}
            <h3 className="text-base font-bold" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>
              {isFamily ? '👨‍👩‍👧‍👦 ' : '⭐ '}{planName}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-[12px]" style={{ color: '#64748B' }}>
              Expires: {format(expiresAt, 'dd MMM yyyy')}
            </p>
            {showExpiryWarning && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{
                  background: daysLeft <= 7 ? '#FEF2F2' : '#FFFBEB',
                  color: daysLeft <= 7 ? '#EF4444' : '#D97706',
                  border: `1px solid ${daysLeft <= 7 ? '#FECACA' : '#FDE68A'}`,
                }}>
                {daysLeft <= 0 ? '🔴 Expired' : daysLeft <= 7 ? `🔴 ${daysLeft} days left` : `⚠️ ${daysLeft} days left`}
              </span>
            )}
          </div>
        </div>

        {/* Free Appointments */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] font-medium flex items-center gap-1.5" style={{ color: '#64748B' }}>
              <Ticket size={14} style={{ color: planColor }} /> Free Appointments
            </span>
            <span className="text-[12px] font-bold" style={{ color: planColor }}>
              {freeRemaining}/{freeTotal} remaining
            </span>
          </div>
          <div className="h-2 rounded-full" style={{ background: '#F1F5F9' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${freePercent}%`, background: planColor }} />
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: `${planColor}12`, color: planColor }}>
            🔝 Priority Booking: Active
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: `${planColor}12`, color: planColor }}>
            ⚡ Fast Queue: Active
          </span>
        </div>

        {/* Family Members (for family plan) */}
        {isFamily && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-medium" style={{ color: '#64748B' }}>
                👥 Family Members: {familyMembers.length}/4 added
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {familyMembers.map(m => (
                <span key={m.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                  style={{ background: '#EBF7FA', color: '#0891B2', border: '1px solid #D1EBF1' }}>
                  👤 {m.patients?.full_name || 'Unknown'} ({m.relation})
                </span>
              ))}
              {familyMembers.length < 4 && (
                <button onClick={() => navigate('/patient/dashboard/settings')}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                  style={{ background: '#FFFBEB', color: '#D97706', border: '1px dashed #FDE68A' }}>
                  + Add
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {isSingle && (
            <button onClick={() => navigate('/pricing')}
              className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-all hover:opacity-90"
              style={{ border: `1.5px solid ${planColor}`, color: planColor }}>
              Upgrade to Family
            </button>
          )}
          {isFamily && (
            <button onClick={() => navigate('/patient/dashboard/settings')}
              className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-all hover:opacity-90"
              style={{ border: `1.5px solid ${planColor}`, color: planColor }}>
              Manage Family
            </button>
          )}
          <button onClick={() => navigate('/pricing')}
            className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white transition-all hover:opacity-90"
            style={{ background: planColor }}>
            Renew Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
