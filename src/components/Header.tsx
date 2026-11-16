import React, { useState } from 'react';
import {
  Grid,
  Search,
  ExternalLink,
  MessageSquare,
  Sliders,
  Layers,
  Sparkles,
  Shield,
  Activity,
  Database,
  Zap,
  Terminal,
  Lock,
  ChevronRight,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { AppItem, XidUser, PortalScopeInfo } from '../types';

interface HeaderProps {
  apps: AppItem[];
  getAppUrl: (subdomainPrefix: string) => string;
  onOpenChat: () => void;
  onOpenSwitchboard: () => void;
  onLaunchApp: (app: AppItem) => void;
  unreadCount?: number;
  user: XidUser | null;
  portalScope?: PortalScopeInfo | null;
  onLoginWithXid: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  apps,
  getAppUrl,
  onOpenChat,
  onOpenSwitchboard,
  onLaunchApp,
  unreadCount = 0,
  user,
  portalScope,
  onLoginWithXid,
  onLogout,
}) => {
  const [waffleOpen, setWaffleOpen] = useState(false);
  const [waffleSearch, setWaffleSearch] = useState('');

  const isAuthenticated = user?.authenticated === true;
  const isXAdmin = user?.isXAdmin === true;

  const filteredApps = apps.filter(
    a =>
      (!isXAdmin ? a.tier !== 'admin' : true) &&
      (a.name.toLowerCase().includes(waffleSearch.toLowerCase()) ||
        a.tagline.toLowerCase().includes(waffleSearch.toLowerCase()))
  );

  const getIcon = (name: string) => {
    switch (name) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-cyan-400" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-amber-400" />;
      case 'Database':
        return <Database className="w-5 h-5 text-purple-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-pink-400" />;
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-cyan-400" />;
      case 'Lock':
        return <Lock className="w-5 h-5 text-blue-400" />;
      default:
        return <Layers className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#060910]/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setWaffleOpen(!waffleOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
              title="Xcorp App Launcher (9-Dot Grid)"
              aria-label="App Launcher"
            >
              <Grid className="w-5 h-5" />
            </button>

            {waffleOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setWaffleOpen(false)}
                />
                <div className="absolute left-0 mt-3 w-80 sm:w-96 p-4 rounded-2xl glass-panel shadow-2xl border border-slate-700/80 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-slate-200">
                        Xcorp Ecosystem Apps
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {filteredApps.length} Online
                      </span>
                    </div>
                    <button
                      onClick={() => setWaffleOpen(false)}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mt-3 relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search apps..."
                      value={waffleSearch}
                      onChange={e => setWaffleSearch(e.target.value)}
                      className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                    {filteredApps.map(app => (
                      <a
                        key={app.id}
                        href={getAppUrl(app.subdomainPrefix)}
                        onClick={e => {
                          e.preventDefault();
                          setWaffleOpen(false);
                          onLaunchApp(app);
                        }}
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all text-center group"
                      >
                        <div className="p-2 rounded-lg bg-slate-800/60 group-hover:scale-110 transition-transform">
                          {getIcon(app.iconName)}
                        </div>
                        <span className="mt-1.5 text-xs font-medium text-slate-300 group-hover:text-cyan-300 truncate w-full">
                          {app.name}
                        </span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">
                          :{app.port}
                        </span>
                      </a>
                    ))}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <a
                      href="#app-matrix"
                      onClick={() => setWaffleOpen(false)}
                      className="text-cyan-400 hover:underline flex items-center"
                    >
                      View all apps & specs{' '}
                      <ChevronRight className="w-3 h-3 ml-0.5" />
                    </a>
                    <button
                      onClick={() => {
                        setWaffleOpen(false);
                        onOpenSwitchboard();
                      }}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <a href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                XCORP
                <span className="text-cyan-400 font-mono text-xs ml-1 font-semibold">
                  {portalScope?.mode === 'CX' ? 'WORKSPACE' : 'CORE'}
                </span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-mono -mt-0.5">
                {portalScope?.mode === 'CX' ? 'Customer Portal' : 'Enterprise HQ'}
              </span>
            </div>
            {portalScope && (
              <span
                className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider border ${
                  portalScope.mode === 'INTERNAL'
                    ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {portalScope.badge}
              </span>
            )}
          </a>

          <nav className="hidden md:flex items-center space-x-1 pl-4">
            <a
              href="#apps"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-400 hover:bg-slate-800/40 rounded-lg transition-colors"
            >
              Applications
            </a>
            <a
              href="#features"
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-400 hover:bg-slate-800/40 rounded-lg transition-colors"
            >
              Platform Modules
            </a>
            {portalScope?.mode !== 'CX' && (
              <a
                href="#telemetry"
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-400 hover:bg-slate-800/40 rounded-lg transition-colors"
              >
                Cluster Status
              </a>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onOpenSwitchboard}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 transition-all"
            title="Feature Switchboard"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Switchboard</span>
          </button>

          {/* XID Authentication Button / User Badge */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
              <Shield
                className={`w-3.5 h-3.5 ${
                  isXAdmin ? 'text-emerald-400' : 'text-cyan-400'
                }`}
              />
              <span className="text-slate-200 font-medium max-w-[120px] truncate">
                {user?.name || user?.email}
              </span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  isXAdmin
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-cyan-500/20 text-cyan-300'
                }`}
              >
                {isXAdmin ? 'Admin' : 'User'}
              </span>
              <button
                onClick={onLogout}
                className="ml-1 p-1 hover:text-red-400 text-slate-500 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginWithXid}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/25 transition-all transform active:scale-95 flex items-center space-x-1.5"
            >
              <Lock className="w-3 h-3" />
              <span>Sign In XID</span>
            </button>
          )}

          <button
            onClick={onOpenChat}
            className="relative p-2 rounded-xl text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/50 transition-all focus:outline-none"
            title="Open Aladin AI Assistant"
            aria-label="Aladin AI Chat"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
