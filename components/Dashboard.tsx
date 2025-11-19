
import React, { useState } from 'react';
import { ArrowRight, TrendingUp, Zap, Users, Radio, CloudLightning, Server } from 'lucide-react';
import { ViewState } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import { isBackendConnected } from '../services/geminiService';

interface DashboardProps {
  onViewChange: (view: ViewState) => void;
}

const viewsData = [
  { name: 'Mo', views: 4000 },
  { name: 'Di', views: 3000 },
  { name: 'Mi', views: 2000 },
  { name: 'Do', views: 2780 },
  { name: 'Fr', views: 1890 },
  { name: 'Sa', views: 6390 },
  { name: 'So', views: 8490 },
];

const nicheData = [
  { subject: 'Tech', A: 120, fullMark: 150 },
  { subject: 'Viral', A: 98, fullMark: 150 },
  { subject: 'Business', A: 86, fullMark: 150 },
  { subject: 'Lifestyle', A: 99, fullMark: 150 },
  { subject: 'Comedy', A: 85, fullMark: 150 },
  { subject: 'Edu', A: 65, fullMark: 150 },
];

export const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const { t } = useLanguage();
  const [newsTicker] = useState<string[]>([
      "BREAKING: 'Silent Review' Trend spiking +400%",
      "ALGORITHM UPDATE: Long-form content prioritized",
      "AUDIO ALERT: 'Espresso' Remix trending globally",
      "MICRO-TREND: Desk setup tours returning"
  ]);
  const backendActive = isBackendConnected();

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Live Ticker */}
      <div className="w-full bg-slate-900 border-b border-slate-800 overflow-hidden py-2 flex items-center gap-4 mb-4 -mt-6 -mx-6 px-6 sticky top-0 z-40 backdrop-blur-md bg-slate-900/80">
          <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase shrink-0 animate-pulse">
              <Radio size={14} /> {t.dashboard.liveSignals}
          </div>
          <div className="flex-1 overflow-hidden relative h-6">
              <div className="absolute whitespace-nowrap animate-marquee flex gap-8 items-center h-full">
                  {newsTicker.concat(newsTicker).map((item, i) => (
                      <span key={i} className="text-sm text-slate-300 font-mono flex items-center gap-2">
                          <span className="text-slate-600">•</span> {item}
                      </span>
                  ))}
              </div>
          </div>
      </div>

      <header className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <h2 className="text-4xl font-black text-white tracking-tight">{t.dashboard.title}</h2>
            <p className="text-slate-400 mt-2 text-lg">{t.dashboard.subtitle}</p>
        </div>
        <div className="hidden md:block text-right space-y-2">
             <div className={`inline-flex items-center gap-2 border px-3 py-1 rounded-full ${backendActive ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${backendActive ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${backendActive ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                </span>
                <span className={`text-xs font-bold uppercase ${backendActive ? 'text-green-400' : 'text-yellow-400'}`}>
                    {backendActive ? 'Cloud Connected' : 'Standalone Mode'}
                </span>
             </div>
             {backendActive && (
                <div className="flex items-center gap-1 text-[10px] text-slate-500 justify-end">
                    <Server size={10} /> Node.js/Express
                </div>
             )}
        </div>
      </header>

      {/* Quick Stats - High End Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            title={t.dashboard.stats.activeSignals}
            value="124" 
            change="+12%" 
            icon={TrendingUp} 
            color="text-pink-500" 
            bg="bg-pink-500/10" 
            border="hover:border-pink-500/50" 
        />
        <StatCard 
            title={t.dashboard.stats.sentiment}
            value={t.dashboard.stats.bullish}
            sub={t.dashboard.stats.potential}
            icon={Zap} 
            color="text-cyan-400" 
            bg="bg-cyan-500/10" 
            border="hover:border-cyan-500/50" 
        />
        <StatCard 
            title={t.dashboard.stats.analyzed}
            value="1.2k" 
            sub={t.dashboard.stats.growing}
            icon={Users} 
            color="text-purple-500" 
            bg="bg-purple-500/10" 
            border="hover:border-purple-500/50"
            onClick={() => onViewChange(ViewState.ANALYZER)}
            action={t.dashboard.stats.newScan}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
          {/* Main Bar Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-3xl relative overflow-hidden">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-200">{t.dashboard.charts.traffic}</h3>
                <select className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-400 px-3 py-1 outline-none">
                    <option>Last 7 Days</option>
                </select>
             </div>
             <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={viewsData}>
                    <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip 
                        cursor={{fill: '#1e293b', opacity: 0.4}}
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f1f5f9' }}
                    />
                    <Bar dataKey="views" fill="url(#colorViews)" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative">
             <h3 className="text-xl font-bold text-slate-200 mb-4">{t.dashboard.charts.niche}</h3>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={nicheData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar
                        name="Mike"
                        dataKey="A"
                        stroke="#ec4899"
                        strokeWidth={3}
                        fill="#ec4899"
                        fillOpacity={0.3}
                    />
                    </RadarChart>
                </ResponsiveContainer>
             </div>
          </div>
      </div>

      {/* Call to Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => onViewChange(ViewState.TRENDS)}
          className="group cursor-pointer relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 hover:border-pink-500/50 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/20 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
                <h3 className="text-2xl font-bold text-white mb-2">{t.nav.trends}</h3>
                <p className="text-slate-400 mb-6 text-sm">{t.dashboard.cards.trends}</p>
                <span className="inline-flex items-center gap-2 font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 rounded-xl shadow-lg shadow-pink-900/20 group-hover:scale-105 transition-transform">
                 Radar <ArrowRight size={18} />
                </span>
            </div>
          </div>
        </div>

        <div 
           onClick={() => onViewChange(ViewState.ANALYZER)}
           className="group cursor-pointer relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 hover:border-cyan-500/50 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div className="relative z-10 flex justify-between items-center">
            <div>
                <h3 className="text-2xl font-bold text-white mb-2">{t.nav.audit}</h3>
                <p className="text-slate-400 mb-6 text-sm">{t.dashboard.cards.audit}</p>
                <span className="inline-flex items-center gap-2 font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 rounded-xl shadow-lg shadow-cyan-900/20 group-hover:scale-105 transition-transform">
                Audit <ArrowRight size={18} />
                </span>
            </div>
          </div>
        </div>

        <div 
           onClick={() => onViewChange(ViewState.VISION)}
           className="group cursor-pointer relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 hover:border-purple-500/50 transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
           <div className="relative z-10 flex justify-between items-center">
            <div>
                <h3 className="text-2xl font-bold text-white mb-2">{t.nav.vision}</h3>
                <p className="text-slate-400 mb-6 text-sm">{t.dashboard.cards.vision}</p>
                <span className="inline-flex items-center gap-2 font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 rounded-xl shadow-lg shadow-purple-900/20 group-hover:scale-105 transition-transform">
                Vision <Zap size={18} />
                </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ 
    title: string, 
    value: string, 
    change?: string, 
    sub?: string, 
    icon: any, 
    color: string, 
    bg: string, 
    border: string,
    onClick?: () => void,
    action?: string
}> = ({ title, value, change, sub, icon: Icon, color, bg, border, onClick, action }) => (
    <div className={`bg-slate-900 border border-slate-800 p-8 rounded-3xl transition-all duration-300 group ${border}`}>
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                <h3 className="text-4xl font-black text-white mt-2">{value}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={28} />
            </div>
        </div>
        {change && <p className="text-green-400 text-sm font-bold flex items-center gap-1">{change} <span className="text-slate-500 font-medium">vs yesterday</span></p>}
        {sub && <p className="text-slate-500 text-sm font-medium">{sub}</p>}
        {action && onClick && (
            <button onClick={onClick} className={`mt-4 text-xs font-bold ${color} hover:underline flex items-center gap-1`}>
                {action} <ArrowRight size={12} />
            </button>
        )}
    </div>
);
