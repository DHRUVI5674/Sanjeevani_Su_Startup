import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import JharokhaArch from '@/components/admin/JharokhaArch';
import { Loader2, ShieldCheck, Clock, CheckCircle2, XCircle, Crown, Users, Search, RefreshCw } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';

interface SubscriptionRow {
  id: string;
  patient_id: string;
  plan_type: string;
  status: string;
  started_at: string;
  expires_at: string;
  payment_method: string | null;
  payment_reference: string | null;
  amount_paid: number;
  free_appointments_total: number;
  free_appointments_used: number;
  created_at: string;
  patients: { full_name: string; email: string } | null;
}

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  pending_payment: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  active: { bg: '#ECFDF5', color: '#10B981', border: '#A7F3D0' },
  expired: { bg: '#F1F5F9', color: '#64748B', border: '#E2E8F0' },
  cancelled: { bg: '#FEF2F2', color: '#EF4444', border: '#FECACA' },
};

const AdminSubscriptions = () => {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending_payment' | 'active' | 'expired'>('pending_payment');
  const [searchQuery, setSearchQuery] = useState('');
  const [activating, setActivating] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from('patient_subscriptions')
        .select('*, patients:patient_id(full_name, email)')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setSubscriptions((data || []) as unknown as SubscriptionRow[]);
    } catch (err: any) {
      toast.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscriptions(); }, [filter]);

  const handleVerifyAndActivate = async (sub: SubscriptionRow) => {
    setActivating(sub.id);
    const today = new Date();
    const expiresAt = addDays(today, 365);

    try {
      // 1. Update subscription status to active
      const { error: subError } = await (supabase as any)
        .from('patient_subscriptions')
        .update({
          status: 'active',
          started_at: format(today, 'yyyy-MM-dd'),
          expires_at: format(expiresAt, 'yyyy-MM-dd'),
          updated_at: new Date().toISOString(),
        })
        .eq('id', sub.id);
      if (subError) throw subError;

      // 2. Update patient record
      const { error: patError } = await supabase
        .from('patients')
        .update({
          is_premium: true,
          subscription_type: sub.plan_type,
          subscription_expires_at: format(expiresAt, 'yyyy-MM-dd'),
        })
        .eq('id', sub.patient_id);
      if (patError) throw patError;

      // 3. Auto-add owner to family_members if family plan
      if (sub.plan_type === 'family') {
        await (supabase as any).from('family_members').insert({
          subscription_id: sub.id,
          owner_patient_id: sub.patient_id,
          member_patient_id: sub.patient_id,
          relation: 'Self',
        });
      }

      toast.success(`✅ ${sub.patients?.full_name}'s plan has been activated!`);
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to activate');
    } finally {
      setActivating(null);
    }
  };

  const handleReject = async (sub: SubscriptionRow) => {
    const confirmation = prompt('Reason for rejection (optional):');
    if (confirmation === null) return; // User cancelled

    try {
      const { error } = await (supabase as any)
        .from('patient_subscriptions')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', sub.id);
      if (error) throw error;
      toast.success('Subscription rejected');
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filtered = subscriptions.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.patients?.full_name?.toLowerCase().includes(q) ||
      s.patients?.email?.toLowerCase().includes(q) ||
      s.payment_reference?.toLowerCase().includes(q)
    );
  });

  const pendingCount = subscriptions.filter(s => s.status === 'pending_payment').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>
            <Crown size={22} className="inline mr-2" style={{ color: '#F59E0B' }} />
            Subscription Management
          </h1>
          <p className="text-[13px] mt-1" style={{ color: '#64748B' }}>
            Verify payments and manage Sanjeevani+ subscriptions
          </p>
        </div>
        <button onClick={fetchSubscriptions}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold"
          style={{ border: '1px solid #E2EEF1', color: '#64748B' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && filter !== 'pending_payment' && (
        <div className="rounded-lg p-3 flex items-center justify-between"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <span className="text-[13px] font-medium" style={{ color: '#D97706' }}>
            ⏳ {pendingCount} subscription{pendingCount > 1 ? 's' : ''} pending payment verification
          </span>
          <button onClick={() => setFilter('pending_payment')}
            className="text-[12px] font-semibold px-3 py-1 rounded-md"
            style={{ background: '#F59E0B', color: '#1E293B' }}>
            View Pending
          </button>
        </div>
      )}

      {/* Filters + Search */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E2EEF1' }}>
        <JharokhaArch color="#0891B2" opacity={0.15} />
        <div className="p-4 flex flex-col md:flex-row gap-3">
          <div className="flex gap-2">
            {([['all', 'All'], ['pending_payment', '⏳ Pending'], ['active', '✅ Active'], ['expired', '⏰ Expired']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key as typeof filter)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
                style={{
                  background: filter === key ? '#0891B2' : '#F1F5F9',
                  color: filter === key ? '#fff' : '#64748B',
                }}>
                {label}
                {key === 'pending_payment' && pendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: filter === key ? 'rgba(255,255,255,0.3)' : '#F59E0B', color: filter === key ? '#fff' : '#1E293B' }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5" style={{ color: '#94A3B8' }} />
            <input className="field-input pl-9 text-[13px]" placeholder="Search by name, email, or transaction ID..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E2EEF1' }}>
        <JharokhaArch color="#F59E0B" opacity={0.15} />
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin" style={{ color: '#0891B2' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Crown size={36} className="mx-auto mb-3" style={{ color: '#D1EBF1' }} />
            <p className="text-[14px]" style={{ color: '#94A3B8' }}>No subscriptions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]" style={{ fontFamily: 'Inter, sans-serif' }}>
              <thead>
                <tr style={{ background: '#F7FBFC' }}>
                  <th className="text-left p-4 font-semibold" style={{ color: '#64748B' }}>Patient</th>
                  <th className="text-left p-4 font-semibold" style={{ color: '#64748B' }}>Plan</th>
                  <th className="text-left p-4 font-semibold" style={{ color: '#64748B' }}>Status</th>
                  <th className="text-left p-4 font-semibold" style={{ color: '#64748B' }}>Payment</th>
                  <th className="text-left p-4 font-semibold" style={{ color: '#64748B' }}>Amount</th>
                  <th className="text-left p-4 font-semibold" style={{ color: '#64748B' }}>Date</th>
                  <th className="text-right p-4 font-semibold" style={{ color: '#64748B' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(sub => {
                  const sc = statusColors[sub.status] || statusColors.expired;
                  return (
                    <tr key={sub.id} className="transition-colors hover:bg-gray-50"
                      style={{
                        borderTop: '1px solid #F1F5F9',
                        borderLeft: sub.status === 'pending_payment' ? '3px solid #F59E0B' : '3px solid transparent',
                      }}>
                      <td className="p-4">
                        <p className="font-semibold" style={{ color: '#1E293B' }}>{sub.patients?.full_name || '—'}</p>
                        <p className="text-[11px]" style={{ color: '#64748B' }}>{sub.patients?.email || '—'}</p>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-[12px] font-medium">
                          {sub.plan_type === 'single' ? <Crown size={12} style={{ color: '#0891B2' }} /> : <Users size={12} style={{ color: '#F59E0B' }} />}
                          {sub.plan_type === 'single' ? 'Single' : 'Family'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold"
                          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {sub.status === 'pending_payment' ? '⏳ Pending' :
                            sub.status === 'active' ? '✅ Active' :
                              sub.status === 'expired' ? '⏰ Expired' : '❌ Cancelled'}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-[12px] font-medium" style={{ color: '#1E293B' }}>{sub.payment_method || '—'}</p>
                        {sub.payment_reference && (
                          <p className="text-[11px] font-mono" style={{ color: '#64748B' }}>{sub.payment_reference}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold" style={{ color: '#1E293B' }}>₹{sub.amount_paid.toLocaleString('en-IN')}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-[12px]" style={{ color: '#64748B' }}>
                          {format(new Date(sub.created_at), 'dd MMM yyyy, hh:mm a')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {sub.status === 'pending_payment' && (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleVerifyAndActivate(sub)}
                              disabled={activating === sub.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-50"
                              style={{ background: '#10B981' }}>
                              {activating === sub.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                              Verify & Activate
                            </button>
                            <button onClick={() => handleReject(sub)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                              style={{ border: '1px solid #FECACA', color: '#EF4444' }}>
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        )}
                        {sub.status === 'active' && (
                          <span className="text-[12px] font-medium" style={{ color: '#10B981' }}>
                            Active until {format(new Date(sub.expires_at), 'dd MMM yyyy')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscriptions;
