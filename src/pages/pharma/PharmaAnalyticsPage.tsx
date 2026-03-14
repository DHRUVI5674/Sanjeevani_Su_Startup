import { useOutletContext, useLocation } from 'react-router-dom';
import { 
  Activity, Users, Pill, UserCheck, AlertCircle, 
  MapPin, TrendingUp, Calculator, PieChart 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import type { PharmaProfile } from '@/hooks/usePharmaContext';

const JharokhaArch = ({ color = '#8B5CF6', opacity = 0.18 }) => (
  <svg width="100%" height="18" viewBox="0 0 400 18" preserveAspectRatio="none" className="block">
    <rect x="8" y="3" width="3" height="15" rx="1" fill={color} fillOpacity={opacity} />
    <rect x="389" y="3" width="3" height="15" rx="1" fill={color} fillOpacity={opacity} />
    <path d="M50 18 Q120 18 160 6 Q190 0 200 0 Q210 0 240 6 Q280 18 350 18" fill="none" stroke={color} strokeOpacity={opacity} strokeWidth="1.5" />
    <circle cx="170" cy="4" r="1.5" fill={color} fillOpacity={opacity * 0.8} />
    <circle cx="200" cy="1.5" r="1.5" fill={color} fillOpacity={opacity * 0.8} />
    <circle cx="230" cy="4" r="1.5" fill={color} fillOpacity={opacity * 0.8} />
  </svg>
);

const PharmaAnalyticsPage = () => {
  const { pharma } = useOutletContext<{ pharma: PharmaProfile | null }>();
  const location = useLocation();
  const path = location.pathname.split('/').pop();

  const renderContent = () => {
    switch (path) {
      case 'effectiveness':
        return (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[#1E293B]">Medicine Effectiveness Report</h2>
            <div className="bg-white p-6 rounded-xl border border-[#E2EEF1]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2EEF1] text-[#64748B]">
                    <th className="pb-3">Medicine</th>
                    <th className="pb-3">Patients Used</th>
                    <th className="pb-3">Improved</th>
                    <th className="pb-3">No Effect</th>
                    <th className="pb-3">Side Effects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EEF1]">
                  <tr><td className="py-4 font-medium">BP Tablet A</td><td>200</td><td className="text-emerald-600">160</td><td>25</td><td className="text-rose-500">15</td></tr>
                  <tr><td className="py-4 font-medium">Diabetes Med X</td><td>150</td><td className="text-emerald-600">110</td><td>30</td><td className="text-rose-500">10</td></tr>
                  <tr><td className="py-4 font-medium">Cholesterol Low Z</td><td>180</td><td className="text-emerald-600">145</td><td>20</td><td className="text-rose-500">15</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'disease-performance':
        return (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[#1E293B]">Disease vs Medicine Performance</h2>
              <div className="bg-white p-6 rounded-xl border border-[#E2EEF1]">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E2EEF1] text-[#64748B]">
                      <th className="pb-3">Disease</th>
                      <th className="pb-3">Medicine</th>
                      <th className="pb-3">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2EEF1]">
                    <tr><td className="py-4">Diabetes</td><td className="font-medium">Drug A</td><td className="text-emerald-600 font-bold">82%</td></tr>
                    <tr><td className="py-4">Diabetes</td><td className="font-medium">Drug B</td><td className="text-emerald-600 font-bold">74%</td></tr>
                    <tr><td className="py-4">Hypertension</td><td className="font-medium">Med X</td><td className="text-emerald-600 font-bold">88%</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
      case 'prescription-trends':
        return (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[#1E293B]">Doctor Prescription Trends</h2>
              <div className="bg-white p-6 rounded-xl border border-[#E2EEF1]">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E2EEF1] text-[#64748B]">
                      <th className="pb-3">Doctor Specialty</th>
                      <th className="pb-3">Most Prescribed Drug</th>
                      <th className="pb-3">Prescription Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2EEF1]">
                    <tr><td className="py-4">Cardiologist</td><td className="font-medium">BP Drug A</td><td>450 units</td></tr>
                    <tr><td className="py-4">General Physician</td><td className="font-medium">BP Drug B</td><td>320 units</td></tr>
                    <tr><td className="py-4">Endocrinologist</td><td className="font-medium">Insulin Type Z</td><td>280 units</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
      case 'comparison':
        return (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[#1E293B]">Drug Comparison Analytics</h2>
              <div className="h-[300px] bg-white p-6 rounded-xl border border-[#E2EEF1]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Drug A', effectiveness: 88 },
                    { name: 'Drug B', effectiveness: 80 },
                    { name: 'Drug C', effectiveness: 72 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" />
                    <Tooltip />
                    <Bar dataKey="effectiveness" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-[#E2EEF1]">
            <TrendingUp size={48} className="text-[#8B5CF6] mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-[#1E293B]">Detailed Analytics Coming Soon</h2>
            <p className="text-[#64748B]">We are processing the latest market data for {path?.replace('-', ' ')}.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B] capitalize" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
            {path?.replace('-', ' ')}
          </h1>
          <p className="text-sm text-[#64748B]">Pharmacy: {pharma?.pharmacy_name}</p>
        </div>
        <div className="px-4 py-2 bg-white rounded-lg border border-[#E2EEF1] text-xs font-medium text-[#64748B]">
          Updated: {new Date().toLocaleDateString()}
        </div>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default PharmaAnalyticsPage;
