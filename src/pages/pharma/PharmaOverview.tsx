import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Activity, Users, Pill, UserCheck, AlertCircle, 
  MapPin, TrendingUp, Calculator, PieChart, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie 
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

const PharmaOverview = () => {
  const { pharma } = useOutletContext<{ pharma: PharmaProfile | null }>();

  // Mock Data for Dashboard
  const effectivenessData = [
    { name: 'BP Tablet A', patients: 200, improved: 160, noEffect: 25, sideEffects: 15 },
    { name: 'Diabetes Drug B', patients: 150, improved: 110, noEffect: 30, sideEffects: 10 },
    { name: 'Pain Relief C', patients: 300, improved: 270, noEffect: 20, sideEffects: 10 },
  ];

  const demographicData = [
    { age: '18–30', effectiveness: 90 },
    { age: '31–50', effectiveness: 85 },
    { age: '50+', effectiveness: 70 },
  ];

  const sideEffectsData = [
    { name: 'Headache', value: 12 },
    { name: 'Nausea', value: 8 },
    { name: 'Dizziness', value: 5 },
    { name: 'Fatigue', value: 15 },
  ];

  const geographicData = [
    { region: 'Gujarat', drug: 'Drug A', usage: 1200 },
    { region: 'Rajasthan', drug: 'Drug B', usage: 950 },
    { region: 'Maharashtra', drug: 'Drug A', usage: 800 },
    { region: 'Delhi', drug: 'Drug C', usage: 600 },
  ];

  const COLORS = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE'];

  const statCards = [
    { label: 'Avg Effectiveness', value: '84%', icon: Activity, trend: '+2.4%', up: true },
    { label: 'Total Patients tracked', value: '1,240', icon: Users, trend: '+12%', up: true },
    { label: 'Adherence Rate', value: '78%', icon: UserCheck, trend: '-1.2%', up: false },
    { label: 'Reported Side Effects', value: '42', icon: AlertCircle, trend: '+5', up: false },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
        <div className="absolute right-0 top-0 w-[40%] h-full jaali-pattern opacity-60" />
        <div className="relative z-10">
          <h1 className="text-xl md:text-2xl font-bold mb-1" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', color: '#1E293B' }}>
            Welcome to Pharma Analytics, {pharma?.pharmacy_name} 🧪
          </h1>
          <p className="text-[13px]" style={{ color: '#64748B' }}>Real-time insights for pharmaceutical performance and patient safety.</p>
          <div className="flex gap-2 mt-4">
            <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-white text-[#8B5CF6] border border-[#DDD6FE]">
              Active Surveillance: Enabled
            </span>
            <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-white text-[#8B5CF6] border border-[#DDD6FE]">
              Market Coverage: 4 Regions
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all p-4" style={{ borderColor: '#E2EEF1' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-[#F5F3FF]">
                <s.icon size={18} className="text-[#8B5CF6]" />
              </div>
              <div className={`flex items-center text-[11px] font-bold ${s.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {s.trend}
              </div>
            </div>
            <p className="text-[12px] text-[#64748B] mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-[#1E293B]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 1. Medicine Effectiveness Report */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2EEF1' }}>
          <JharokhaArch />
          <div className="p-5">
            <h3 className="text-[15px] font-bold mb-4 flex items-center gap-2">
              <Activity size={18} className="text-[#8B5CF6]" /> Medicine Effectiveness Report
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#E2EEF1] text-[#64748B]">
                    <th className="pb-2 font-semibold">Medicine</th>
                    <th className="pb-2 font-semibold text-center">Patients</th>
                    <th className="pb-2 font-semibold text-center">Improved</th>
                    <th className="pb-2 font-semibold text-center">Side Effects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2EEF1]">
                  {effectivenessData.map((m) => (
                    <tr key={m.name}>
                      <td className="py-3 font-medium text-[#1E293B]">{m.name}</td>
                      <td className="py-3 text-center">{m.patients}</td>
                      <td className="py-3 text-center text-emerald-600 font-bold">{Math.round((m.improved/m.patients)*100)}%</td>
                      <td className="py-3 text-center text-rose-500">{m.sideEffects}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 2. Patient Demographic Insights */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2EEF1' }}>
          <JharokhaArch />
          <div className="p-5">
            <h3 className="text-[15px] font-bold mb-4 flex items-center gap-2">
              <Users size={18} className="text-[#8B5CF6]" /> Demographic Effectiveness (Age)
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographicData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} unit="%" />
                  <Tooltip cursor={{ fill: '#F5F3FF' }} />
                  <Bar dataKey="effectiveness" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 5. Side Effects Monitoring */}
        <div className="bg-white rounded-xl border overflow-hidden lg:col-span-1" style={{ borderColor: '#E2EEF1' }}>
          <JharokhaArch />
          <div className="p-5">
            <h3 className="text-[15px] font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-[#8B5CF6]" /> Side Effects Monitoring
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={sideEffectsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sideEffectsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {sideEffectsData.map((s, i) => (
                <div key={s.name} className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-[#64748B]">{s.name}</span>
                  </div>
                  <span className="font-bold text-[#1E293B]">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. Geographic Usage Analytics */}
        <div className="bg-white rounded-xl border overflow-hidden lg:col-span-2" style={{ borderColor: '#E2EEF1' }}>
          <JharokhaArch />
          <div className="p-5">
            <h3 className="text-[15px] font-bold mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-[#8B5CF6]" /> Geographic Usage Analytics
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geographicData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="region" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#1E293B', fontWeight: 500 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#A78BFA" radius={[0, 4, 4, 0]} barSize={24}>
                    {geographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.region === 'Gujarat' ? '#8B5CF6' : '#C4B5FD'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-[#64748B] text-center mt-2">Demand peak identified in West India regions.</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 4. Medication Adherence */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2EEF1' }}>
          <JharokhaArch />
          <div className="p-5">
            <h3 className="text-[15px] font-bold mb-4 flex items-center gap-2">
              <UserCheck size={18} className="text-[#8B5CF6]" /> Medication Adherence
            </h3>
            <div className="space-y-4">
              {[
                { name: 'BP Drug A', prescribed: 500, taken: 420 },
                { name: 'Diabetes Drug B', prescribed: 300, taken: 210 },
                { name: 'Antibiotic C', prescribed: 200, taken: 190 },
              ].map(item => (
                <div key={item.name}>
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="font-medium text-[#1E293B]">{item.name}</span>
                    <span className="text-[#64748B]">{Math.round((item.taken/item.prescribed)*100)}% adherence</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#8B5CF6]" 
                      style={{ width: `${(item.taken/item.prescribed)*100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] mt-1 text-[#94A3B8]">
                    <span>Prescribed: {item.prescribed}</span>
                    <span>Missed: {item.prescribed - item.taken}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 8. Medicine Demand Forecast */}
        <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#E2EEF1' }}>
          <JharokhaArch />
          <div className="p-5">
            <h3 className="text-[15px] font-bold mb-4 flex items-center gap-2">
              <Calculator size={18} className="text-[#8B5CF6]" /> Demand Forecast (Next Month)
            </h3>
            <div className="space-y-3">
              {[
                { name: 'BP Drug A', predicted: 1200, confidence: '92%' },
                { name: 'Diabetes Drug B', predicted: 900, confidence: '88%' },
                { name: 'Cold/Flu Med', predicted: 2500, confidence: '95%' },
                { name: 'Pain Relief C', predicted: 850, confidence: '84%' },
              ].map(item => (
                <div key={item.name} className="flex items-center gap-4 p-3 rounded-lg border border-[#F1F5F9] bg-[#F8FAFC]">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#E2EEF1]">
                    <TrendingUp size={16} className="text-[#8B5CF6]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-[#1E293B]">{item.name}</p>
                    <p className="text-[11px] text-[#64748B]">Predicted: {item.predicted} units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-bold text-[#8B5CF6]">{item.confidence}</p>
                    <p className="text-[10px] text-[#94A3B8]">Confidence</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmaOverview;
