import { useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3, TrendingUp, Users, Activity, AlertCircle, 
  MapPin, UserCheck, Calculator, PieChart, LogOut, X, Pill
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { PharmaProfile } from '@/hooks/usePharmaContext';

const navItems = [
  { label: 'Overview', icon: BarChart3, path: '/pharma/dashboard' },
  { label: 'Effectiveness', icon: Activity, path: '/pharma/dashboard/effectiveness' },
  { label: 'Demographics', icon: Users, path: '/pharma/dashboard/demographics' },
  { label: 'Disease vs Med', icon: Pill, path: '/pharma/dashboard/disease-performance' },
  { label: 'Adherence', icon: UserCheck, path: '/pharma/dashboard/adherence' },
  { label: 'Side Effects', icon: AlertCircle, path: '/pharma/dashboard/side-effects' },
  { label: 'Geographic', icon: MapPin, path: '/pharma/dashboard/geographic' },
  { label: 'Prescription Trends', icon: TrendingUp, path: '/pharma/dashboard/prescription-trends' },
  { label: 'Demand Forecast', icon: Calculator, path: '/pharma/dashboard/forecast' },
  { label: 'Comparison', icon: PieChart, path: '/pharma/dashboard/comparison' },
];

const LotusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <ellipse cx="12" cy="16" rx="3" ry="5" fill="#8B5CF6" fillOpacity="0.8" />
    <ellipse cx="7" cy="14" rx="2.5" ry="5" fill="#8B5CF6" fillOpacity="0.5" transform="rotate(-20 7 14)" />
    <ellipse cx="17" cy="14" rx="2.5" ry="5" fill="#8B5CF6" fillOpacity="0.5" transform="rotate(20 17 14)" />
    <circle cx="12" cy="14" r="1.5" fill="#8B5CF6" />
  </svg>
);

const MehraabArch = () => (
  <svg width="100%" height="28" viewBox="0 0 260 28" preserveAspectRatio="none" className="block mt-auto">
    <path d="M0 28 Q30 28 60 14 Q100 0 130 0 Q160 0 200 14 Q230 28 260 28" fill="none" stroke="#8B5CF6" strokeOpacity="0.12" strokeWidth="1.5" />
  </svg>
);

interface PharmaSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  pharma: PharmaProfile | null;
}

const PharmaSidebar = ({ mobileOpen, onMobileClose, pharma }: PharmaSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/pharma/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full jaali-pattern" style={{ background: '#F5F3FF', borderRight: '1px solid #DDD6FE' }}>
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <LotusIcon />
          <span className="text-lg font-bold" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>Sanjeevani</span>
        </div>
        <div className="flex items-center gap-1 mb-4 ml-6">
          <span style={{ color: '#8B5CF6', fontSize: '8px' }}>◇</span>
          <div className="h-px flex-1" style={{ background: '#8B5CF6', maxWidth: '80px' }} />
          <span style={{ color: '#8B5CF6', fontSize: '8px' }}>◇</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white" style={{ background: '#8B5CF6' }}>
            {(pharma?.pharmacy_name || 'P').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-[14px] font-bold truncate" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B', maxWidth: '170px' }}>
              {pharma?.pharmacy_name || 'Pharmacy'}
            </p>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Pharma Analytics</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md" style={{ background: '#8B5CF6', color: '#fff' }}>
          ✅ Pharma Network
        </span>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); onMobileClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all relative"
              style={{
                fontFamily: 'Inter, sans-serif',
                background: active ? '#F5F3FF' : 'transparent',
                color: active ? '#8B5CF6' : '#64748B',
                borderLeft: active ? '3px solid #8B5CF6' : '3px solid transparent',
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-5 pb-4">
        <MehraabArch />
        <p className="text-[11px] mt-2 truncate" style={{ color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}>
          Logged in as {pharma?.email || ''}
        </p>
        <button onClick={handleLogout} className="text-[13px] font-medium mt-2 transition-colors hover:opacity-80" style={{ color: '#EF4444', fontFamily: 'Inter, sans-serif' }}>
          <LogOut size={14} className="inline mr-1.5" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-[260px] min-h-screen fixed left-0 top-0 z-40">
        {sidebarContent}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={onMobileClose} />
          <aside className="relative w-[280px] h-full">
            <button onClick={onMobileClose} className="absolute top-3 right-3 z-10 p-1 rounded-full" style={{ color: '#64748B' }}>
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

export default PharmaSidebar;
