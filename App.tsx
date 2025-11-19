
import React, { useState } from 'react';
import { LayoutDashboard, TrendingUp, UserSearch, Eye, Activity, MessageCircle } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { TrendExplorer } from './components/TrendExplorer';
import { AccountAnalyzer } from './components/AccountAnalyzer';
import { VisionLab } from './components/VisionLab';
import { ChatBot } from './components/ChatBot';
import { useLanguage } from './contexts/LanguageContext';

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TRENDS = 'TRENDS',
  ANALYZER = 'ANALYZER',
  VISION = 'VISION',
  CHAT = 'CHAT'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const { language, setLanguage, t } = useLanguage();

  const renderView = () => {
    switch (currentView) {
      case ViewState.TRENDS:
        return <TrendExplorer />;
      case ViewState.ANALYZER:
        return <AccountAnalyzer />;
      case ViewState.VISION:
        return <VisionLab />;
      case ViewState.CHAT:
        return <ChatBot />;
      case ViewState.DASHBOARD:
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-100 bg-slate-900">
      {/* Mobile Header */}
      <div className="md:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-50">
        <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold tracking-tighter">
              TrendPulse <span className="text-pink-500">AI</span>
            </h1>
        </div>
        <button 
            onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
            className="text-xs font-bold px-3 py-1 rounded border border-slate-700 bg-slate-800 text-slate-300"
        >
            {language.toUpperCase()}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900 h-screen sticky top-0">
        <div className="p-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold tracking-tighter">
                TrendPulse <span className="text-pink-500">AI</span>
            </h1>
          </div>
        </div>
        
        {/* Gamification / Level System */}
        <div className="px-6 mb-6">
           <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
               <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                   <span>{t.nav.level} 4</span>
                   <span className="text-cyan-400">2,450 {t.nav.xp}</span>
               </div>
               <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full w-[65%] bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
               </div>
           </div>
        </div>

        <div className="px-6 mb-6">
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                <button 
                    onClick={() => setLanguage('de')}
                    className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${language === 'de' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    DE
                </button>
                <button 
                    onClick={() => setLanguage('en')}
                    className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${language === 'en' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    EN
                </button>
            </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label={t.nav.dashboard}
            active={currentView === ViewState.DASHBOARD} 
            onClick={() => setCurrentView(ViewState.DASHBOARD)} 
          />
          <NavItem 
            icon={<TrendingUp size={20} />} 
            label={t.nav.trends}
            active={currentView === ViewState.TRENDS} 
            onClick={() => setCurrentView(ViewState.TRENDS)} 
          />
          <NavItem 
            icon={<UserSearch size={20} />} 
            label={t.nav.audit}
            active={currentView === ViewState.ANALYZER} 
            onClick={() => setCurrentView(ViewState.ANALYZER)} 
          />
          <NavItem 
            icon={<Eye size={20} />} 
            label={t.nav.vision}
            active={currentView === ViewState.VISION} 
            onClick={() => setCurrentView(ViewState.VISION)} 
          />
          <NavItem 
            icon={<MessageCircle size={20} />} 
            label={t.nav.chat}
            active={currentView === ViewState.CHAT} 
            onClick={() => setCurrentView(ViewState.CHAT)} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800 text-slate-500 text-xs text-center">
           {t.nav.footer}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-950/50 relative">
        {/* Mobile Nav Bar (Bottom) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 flex justify-around z-50">
            <button onClick={() => setCurrentView(ViewState.DASHBOARD)} className={`p-2 rounded-full ${currentView === ViewState.DASHBOARD ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'}`}>
                <LayoutDashboard size={24} />
            </button>
            <button onClick={() => setCurrentView(ViewState.TRENDS)} className={`p-2 rounded-full ${currentView === ViewState.TRENDS ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'}`}>
                <TrendingUp size={24} />
            </button>
            <button onClick={() => setCurrentView(ViewState.ANALYZER)} className={`p-2 rounded-full ${currentView === ViewState.ANALYZER ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'}`}>
                <UserSearch size={24} />
            </button>
             <button onClick={() => setCurrentView(ViewState.VISION)} className={`p-2 rounded-full ${currentView === ViewState.VISION ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'}`}>
                <Eye size={24} />
            </button>
             <button onClick={() => setCurrentView(ViewState.CHAT)} className={`p-2 rounded-full ${currentView === ViewState.CHAT ? 'text-cyan-400 bg-slate-800' : 'text-slate-400'}`}>
                <MessageCircle size={24} />
            </button>
        </nav>

        <div className="p-6 pb-24 md:pb-6 max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
      active
        ? 'bg-slate-800 text-cyan-400 shadow-lg shadow-cyan-900/20 border border-slate-700'
        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default App;
