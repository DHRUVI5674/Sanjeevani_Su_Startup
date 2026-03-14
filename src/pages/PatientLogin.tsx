import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const JharokhaArch = () => (
  <svg width="100%" height="18" viewBox="0 0 400 18" preserveAspectRatio="none" className="block">
    <rect x="8" y="3" width="3" height="15" rx="1" fill="#0891B2" fillOpacity="0.18" />
    <rect x="389" y="3" width="3" height="15" rx="1" fill="#0891B2" fillOpacity="0.18" />
    <path d="M50 18 Q120 18 160 6 Q190 0 200 0 Q210 0 240 6 Q280 18 350 18" fill="none" stroke="#0891B2" strokeOpacity="0.18" strokeWidth="1.5" />
    <circle cx="170" cy="4" r="1.5" fill="#0891B2" fillOpacity="0.14" />
    <circle cx="200" cy="1.5" r="1.5" fill="#0891B2" fillOpacity="0.14" />
    <circle cx="230" cy="4" r="1.5" fill="#0891B2" fillOpacity="0.14" />
  </svg>
);

const LotusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <ellipse cx="8" cy="5" rx="2.5" ry="4" fill="#0891B2" opacity="0.9" />
    <ellipse cx="4.5" cy="8" rx="2.5" ry="3.5" fill="#0891B2" opacity="0.6" transform="rotate(-25 4.5 8)" />
    <ellipse cx="11.5" cy="8" rx="2.5" ry="3.5" fill="#0891B2" opacity="0.6" transform="rotate(25 11.5 8)" />
    <circle cx="8" cy="7.5" r="1.5" fill="#E8A820" />
  </svg>
);

const PatientLogin = () => {
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
          toast.error('Please verify your email first. Check your inbox for the confirmation link.');
        } else {
          toast.error('Incorrect email or password.');
        }
        return;
      }
      // Fetch patient record
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('supabase_user_id', data.user.id)
        .single();

      if (patient) {
        toast.success('Welcome back!');
        navigate('/patient/dashboard');
      } else {
        toast.error('No patient account found for this email.');
      }
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
        redirectTo: `${window.location.origin}/patient/reset-password`,
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
      {/* Left illustration panel — desktop only */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative" style={{ background: '#EBF7FA' }}>
        <div className="absolute inset-0 jaali-pattern" style={{ opacity: 0.67 }} />
        <div className="relative z-10 text-center">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="mx-auto mb-6">
            {/* Heart with ECG line */}
            <path d="M60 100 C20 70 10 40 30 25 C45 15 55 25 60 35 C65 25 75 15 90 25 C110 40 100 70 60 100Z"
              fill="#0891B2" fillOpacity="0.08" stroke="#0891B2" strokeWidth="2" />
            <polyline points="25,60 40,60 45,45 50,75 55,55 60,60 95,60"
              fill="none" stroke="#0891B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-base italic" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#0E6685' }}>
            "Your health, always within reach."
          </p>
        </div>
      </div>

      {/* Right — Login Card */}
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="w-full max-w-[440px]">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: '#E2EEF1', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <JharokhaArch />

            <div className="p-10">
              {/* Logo */}
              <div className="flex items-center justify-center gap-2 mb-1">
                <LotusIcon />
                <span className="text-sm" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#64748B' }}>Sanjeevani</span>
              </div>
              <div className="flex justify-center mb-6">
                <svg width="90" height="6" viewBox="0 0 90 6" preserveAspectRatio="none">
                  <line x1="6" y1="3" x2="84" y2="3" stroke="#E8A820" strokeOpacity="0.6" strokeWidth="1" />
                  <path d="M0 3l3-3 3 3-3 3z" fill="#E8A820" fillOpacity="0.6" />
                  <path d="M84 3l3-3 3 3-3 3z" fill="#E8A820" fillOpacity="0.6" />
                </svg>
              </div>

              <h1 className="text-[26px] font-bold text-center mb-1" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>
                Welcome Back
              </h1>
              <p className="text-sm text-center mb-8" style={{ color: '#64748B', fontFamily: 'Inter, sans-serif' }}>
                Log in to your health profile
              </p>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: '#1E293B', fontFamily: 'Inter, sans-serif' }}>
                  Email Address
                </label>
                <input className="field-input" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
              </div>

              {/* Password */}
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

              {/* Forgot link */}
              <div className="text-right mb-6">
                <button onClick={() => { setShowForgot(!showForgot); setForgotEmail(email); }}
                  className="text-[13px] font-medium hover:underline" style={{ color: '#0891B2' }}>
                  Forgot your password?
                </button>
              </div>

              {/* Forgot password panel */}
              {showForgot && (
                <div className="mb-6 p-4 rounded-lg animate-fade-up" style={{ background: '#F7FBFC', border: '1px solid #E2EEF1' }}>
                  {forgotSent ? (
                    <p className="text-sm font-medium text-center" style={{ color: '#10B981' }}>
                      ✅ Reset link sent! Check your inbox.
                    </p>
                  ) : (
                    <>
                      <p className="text-base font-bold mb-1" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>
                        Reset your password
                      </p>
                      <p className="text-[13px] mb-3" style={{ color: '#64748B' }}>
                        Enter your email and we'll send you a reset link.
                      </p>
                      <input className="field-input mb-3" type="email" value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)} placeholder="your.email@example.com" />
                      <button onClick={handleForgotPassword} disabled={forgotLoading}
                        className="w-full py-2.5 rounded-lg text-sm font-semibold border transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ borderColor: '#0891B2', color: '#0891B2', background: 'white' }}>
                        {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send Reset Link'}
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Login button */}
              <button onClick={handleLogin} disabled={isLoading}
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 mb-6"
                style={{ background: '#0891B2' }}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Log In'}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: '#E2EEF1' }} />
                <span className="text-xs" style={{ color: '#94A3B8' }}>or</span>
                <div className="flex-1 h-px" style={{ background: '#E2EEF1' }} />
              </div>

              {/* Create account */}
              <p className="text-sm text-center" style={{ color: '#0891B2', fontFamily: 'Inter, sans-serif' }}>
                <button onClick={() => navigate('/patient/signup')} className="font-medium hover:underline">
                  Create a new account →
                </button>
              </p>
            </div>
          </div>

          {/* Back home */}
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

export default PatientLogin;
