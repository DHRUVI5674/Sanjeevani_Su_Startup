import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import JharokhaFrame from '@/components/registration/JharokhaFrame';

const PharmaRegistration = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    pharmacyName: '',
    licenseNumber: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = async () => {
    if (Object.values(formData).some(val => !val)) {
      toast.error('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.ownerName,
            role: 'pharma',
            pharmacy_name: formData.pharmacyName,
          }
        }
      });

      if (signUpError) throw signUpError;

      // Here you would typically insert into a 'pharmacies' table
      // For now, we'll just show success
      
      toast.success('Registration successful! Please verify your email.');
      navigate('/pharma/login');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FBFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#1E293B]">Register Your Pharmacy</h1>
          <p className="text-sm text-[#64748B] mt-2">Join the Sanjeevani healthcare network</p>
        </div>

        <JharokhaFrame>
          <div className="p-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pharmacy Name</label>
                <input
                  type="text"
                  className="field-input mt-1"
                  value={formData.pharmacyName}
                  onChange={e => setFormData({ ...formData, pharmacyName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Drug License Number</label>
                <input
                  type="text"
                  className="field-input mt-1"
                  value={formData.licenseNumber}
                  onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Owner Name</label>
                <input
                  type="text"
                  className="field-input mt-1"
                  value={formData.ownerName}
                  onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="tel"
                  className="field-input mt-1"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                className="field-input mt-1"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Address</label>
              <textarea
                className="field-input mt-1 h-20"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  className="field-input mt-1"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  className="field-input mt-1"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => navigate('/pharma/login')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" /> Already registered?
              </button>
              <button
                onClick={handleRegister}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: '#8B5CF6' }}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Register Pharmacy</>}
              </button>
            </div>
          </div>
        </JharokhaFrame>
      </div>
    </div>
  );
};

export default PharmaRegistration;
