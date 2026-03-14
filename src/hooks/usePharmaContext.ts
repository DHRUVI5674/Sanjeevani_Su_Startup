import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export interface PharmaProfile {
  id: string;
  pharmacy_name: string;
  owner_name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  license_number: string | null;
  supabase_user_id: string;
}

export function usePharmaContext() {
  const navigate = useNavigate();
  const [pharma, setPharma] = useState<PharmaProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/pharma/login', { replace: true });
        return;
      }
      
      const role = user.user_metadata?.role;
      if (role !== 'pharma') {
        navigate('/', { replace: true });
        return;
      }

      // In a real app, we would fetch from a 'pharmacies' table. 
      // For now, we'll use user metadata as a mock profile since we haven't created the table yet.
      const mockPharma: PharmaProfile = {
        id: user.id,
        pharmacy_name: user.user_metadata?.pharmacy_name || 'Generic Pharmacy',
        owner_name: user.user_metadata?.full_name || 'Owner',
        email: user.email || '',
        phone: null,
        address: null,
        license_number: null,
        supabase_user_id: user.id
      };

      setPharma(mockPharma);
      setAuthorized(true);
      setLoading(false);
    };
    check();
  }, [navigate]);

  return { pharma, loading, authorized };
}
