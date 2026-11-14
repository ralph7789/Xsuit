import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  Sparkles,
  Shield,
  Activity,
  Database,
  Zap,
  Terminal,
  Lock,
  ChevronRight,
  Layers,
  ArrowUpRight,
  MessageSquare,
  Code,
  ShieldAlert,
} from 'lucide-react';
import { AppItem, XidUser } from '../types';

interface AppMatrixProps {
  apps: AppItem[];
  getAppUrl: (subdomainPrefix: string) => string;
  onLaunchApp: (app: AppItem) => void;
  user?: XidUser | null;
}

export const AppMatrix: React.FC<AppMatrixProps> = ({
  apps,
  getAppUrl,
  onLaunchApp,
  user,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const isXAdmin = !!(user?.authenticated && user?.isXAdmin);

  const categories = [
    'All',
    'AI & Models',
    'Engineering & Code',
    'Realtime & P2P',
    ...(isXAdmin ? ['Security & Auth', 'Infrastructure'] : []),
  ];

  const filteredApps = apps.filter(app => {
    // Hide admin/infrastructure apps if not an authenticated XAdmin
    if (!isXAdmin && app.tier === 'admin') {
      return false;
    }

    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.features.some(f =>
        f.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      selectedCategory === 'All' || app.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getIcon = (name: string) => {
    switch (name) {
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-cyan-400" />;
      case 'Shield':
        return <Shield className="w-6 h-6 text-emerald-400" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-amber-400" />;
      case 'Database':
        return <Database className="w-6 h-6 text-purple-400" />;
      case 'MessageSquare':
        return <MessageSquare className="w-6 h-6 text-emerald-400" />;
      case 'Code':
        return <Code className="w-6 h-6 text-sky-400" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-pink-400" />;
      case 'Terminal':
        return <Terminal className="w-6 h-6 text-cyan-400" />;
      case 'Lock':
        return <Lock className="w-6 h-6 text-blue-400" />;
      default:
        return <Layers className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <section id="apps" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Subdomain Routing Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ecosystem Applications
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Root domain{' '}
              <code className="text-cyan-300 font-mono text-xs bg-slate-900 px-1 py-0.5 rounded">
                xcorp.***
              </code>{' '}
              hosts this Central Portal. Subdomains launch dedicated
              microservices.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search apps or features..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map(app => {
            const appUrl = getAppUrl(app.subdomainPrefix);
            return (
              <div
                key={app.id}
                className="group relative rounded-2xl glass-panel p-6 border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-cyan-500/5"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 group-hover:scale-105 transition-transform">
                      {getIcon(app.iconName)}
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      {app.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {app.badge}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">
                        Port {app.port}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center">
                      {app.name}
                    </h3>
                    <p className="text-xs font-medium text-cyan-400/80 mt-0.5">
                      {app.tagline}
                    </p>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
                      {app.description}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {app.features.map(f => (
                      <span
                        key={f}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-300 border border-slate-800"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Routing Target
                    </span>
                    <span
                      className="text-xs font-mono text-slate-300 truncate max-w-[170px]"
                      title={appUrl}
                    >
                      {app.subdomainPrefix}.xcorp.*
                    </span>
                  </div>

                  <a
                    href={appUrl}
                    onClick={e => {
                      e.preventDefault();
                      onLaunchApp(app);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-slate-950 border border-cyan-500/20 transition-all"
                  >
                    <span>Launch</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center py-12 rounded-2xl glass-panel border border-slate-800">
            <p className="text-sm text-slate-400">
              No applications matched "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-3 text-xs text-cyan-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
