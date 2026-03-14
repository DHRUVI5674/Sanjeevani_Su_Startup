import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const JharokhaArch = () => (
  <svg width="100%" height="18" viewBox="0 0 400 18" preserveAspectRatio="none" className="block">
    <rect x="8" y="3" width="3" height="15" rx="1" fill="#8B5CF6" fillOpacity="0.22" />
    <rect x="389" y="3" width="3" height="15" rx="1" fill="#8B5CF6" fillOpacity="0.22" />
    <path d="M50 18 Q120 18 160 6 Q190 0 200 0 Q210 0 240 6 Q280 18 350 18" fill="none" stroke="#8B5CF6" strokeOpacity="0.22" strokeWidth="1.5" />
    <circle cx="170" cy="4" r="1.5" fill="#8B5CF6" fillOpacity="0.18" />
    <circle cx="200" cy="1.5" r="1.5" fill="#8B5CF6" fillOpacity="0.18" />
    <circle cx="230" cy="4" r="1.5" fill="#8B5CF6" fillOpacity="0.18" />
  </svg>
);

const LotusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <ellipse cx="8" cy="5" rx="2.5" ry="4" fill="#8B5CF6" opacity="0.9" />
    <ellipse cx="4.5" cy="8" rx="2.5" ry="3.5" fill="#8B5CF6" opacity="0.6" transform="rotate(-25 4.5 8)" />
    <ellipse cx="11.5" cy="8" rx="2.5" ry="3.5" fill="#8B5CF6" opacity="0.6" transform="rotate(25 11.5 8)" />
    <circle cx="8" cy="7.5" r="1.5" fill="#8B5CF6" />
  </svg>
);

const PharmaLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('not confirmed')) {
          toast.error('Please verify your email first.');
        } else {
          toast.error('Incorrect email or password.');
        }
        return;
      }

      const role = data.user?.user_metadata?.role;
      if (role !== 'pharma') {
        // You might want to check a pharmacies table here if you have one
        toast.error('This account is not registered as a pharmacy.');
        await supabase.auth.signOut();
        return;
      }

      toast.success('Welcome back!');
      navigate('/pharma/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) { toast.error('Please enter your email'); return; }
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/pharma/reset-password`,
      });
      if (error) throw error;
      setForgotSent(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset link');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F7FBFC' }}>
      <div className="hidden lg:flex w-1/2 items-center justify-center relative" style={{ background: '#F5F3FF' }}>
        <div className="absolute inset-0 jaali-pattern" style={{ opacity: 0.5 }} />
        <div className="relative z-10 text-center">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto mb-6">
            <rect x="25" y="30" width="70" height="70" rx="8" fill="#8B5CF6" fillOpacity="0.08" stroke="#8B5CF6" strokeWidth="2" />
            <path d="M45 50h30M60 35v30" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" />
            <circle cx="60" cy="85" r="5" fill="#8B5CF6" fillOpacity="0.3" />
          </svg>
          <p className="text-base italic" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#5B21B6' }}>
            "Your community pharmacy, digitally connected."
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-[440px]">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: '#E2EEF1', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <JharokhaArch />

            <div className="p-10">
              <div className="flex items-center justify-center gap-2 mb-1">
                <LotusIcon />
                <span className="text-sm" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#64748B' }}>Sanjeevani</span>
              </div>
              <div className="flex justify-center mb-6">
                <svg width="90" height="6" viewBox="0 0 90 6" preserveAspectRatio="none">
                  <line x1="6" y1="3" x2="84" y2="3" stroke="#8B5CF6" strokeOpacity="0.6" strokeWidth="1" />
                  <path d="M0 3l3-3 3 3-3 3z" fill="#8B5CF6" fillOpacity="0.6" />
                  <path d="M84 3l3-3 3 3-3 3z" fill="#8B5CF6" fillOpacity="0.6" />
                </svg>
              </div>

              <h1 className="text-[26px] font-bold text-center mb-1" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>
                Pharma Login
              </h1>
              <p className="text-sm text-center mb-8" style={{ color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                Sign in to your pharmacy dashboard
              </p>

              <div className="mb-4">
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>
                  Pharmacy Email
                </label>
                <input className="field-input" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="contact@pharmacy.com"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              </div>

              <div className="mb-2">
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>
                  Password
                </label>
                <div className="relative">
                  <input className="field-input pr-10" type={showPassword ? 'text' : 'password'}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-right mb-6">
                <button onClick={() => { setShowForgot(!showForgot); setForgotEmail(email); }}
                  className="text-[13px] font-medium hover:underline" style={{ color: '#8B5CF6' }}>
                  Forgot your password?
                </button>
              </div>

              {showForgot && (
                <div className="mb-6 p-4 rounded-lg animate-fade-up" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                  {forgotSent ? (
                    <p className="text-sm font-medium text-center" style={{ color: '#10B981' }}>
                      ✅ Reset link sent! Check your inbox.
                    </p>
                  ) : (
                    <>
                      <p className="text-base font-bold mb-1" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>
                        Reset your password
                      </p>
                      <input className="field-input mb-3" type="email" value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)} placeholder="contact@pharmacy.com" />
                      <button onClick={handleForgotPassword} disabled={forgotLoading}
                        className="w-full py-2.5 rounded-lg text-sm font-semibold border transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ borderColor: '#8B5CF6', color: '#8B5CF6', background: 'white' }}>
                        {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send Reset Link'}
                      </button>
                    </>
                  )}
                </div>
              )}

              <button onClick={handleLogin} disabled={isLoading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 mb-6"
                style={{ background: '#8B5CF6' }}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Log In'}
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: '#E2EEF1' }} />
                <span className="text-xs" style={{ color: '#94A3B8' }}>or</span>
                <div className="flex-1 h-px" style={{ background: '#E2EEF1' }} />
              </div>

              <p className="text-sm text-center" style={{ color: '#8B5CF6', fontFamily: 'Inter, sans-serif' }}>
                <button onClick={() => navigate('/pharma/registration')} className="font-medium hover:underline">
                  Register your pharmacy →
                </button>
              </p>
            </div>
          </div>

          <p className="text-center mt-4">
            <button onClick={() => navigate('/')} className="inline-flex items-center gap-1 text-xs hover:underline" style={{ color: '#64748B' }}>
              <ArrowLeft className="w-3 h-3" /> Back to home
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PharmaLogin;
