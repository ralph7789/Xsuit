import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Activity,
  HardDrive,
  Globe,
  Terminal,
  Zap,
} from 'lucide-react';
import { ClusterStatusResponse, XidUser } from '../types';

interface HeroProps {
  clusterStatus: ClusterStatusResponse | null;
  getAppUrl: (prefix: string) => string;
  onOpenChat: () => void;
  onLoginWithXid?: () => void;
  user?: XidUser | null;
}

export const Hero: React.FC<HeroProps> = ({
  clusterStatus,
  getAppUrl,
  onOpenChat,
  onLoginWithXid,
  user,
}) => {
  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/15 to-violet-600/20 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-cyan-500/30 text-slate-300 text-xs mb-8 backdrop-blur-md shadow-inner shadow-cyan-500/10 hover:border-cyan-400/50 transition-colors cursor-pointer">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-slate-200">
            Xcorp v2.8 Production Architecture
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-400 font-mono text-[11px]">
            Zero-Trust WAF + Casbin Active
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          The Unified Operating System for{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            Autonomous Intelligence
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          One central gateway. Infinite autonomous swarms. Secure multi-cluster
          ingress, Casbin RBAC protection, and sub-millisecond P2P data mesh
          running seamlessly across modern cloud infrastructure.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href={getAppUrl('aladin')}
            className="px-7 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all flex items-center space-x-2 transform active:scale-95 group"
          >
            <span>Try Now — Launch Aladin AI</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {!user?.authenticated ? (
            <button
              onClick={onLoginWithXid}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sign In to Xcorp ID</span>
            </button>
          ) : (
            <a
              href="#apps"
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-700/60 shadow-md transition-all flex items-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Explore Workspace Apps</span>
            </a>
          )}

          <button
            onClick={onOpenChat}
            className="px-5 py-3.5 rounded-xl font-medium text-sm bg-slate-950/60 hover:bg-slate-900 text-cyan-300 border border-cyan-800/40 hover:border-cyan-600/60 transition-all flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Chat with Aladin Live</span>
          </button>
        </div>

        <div className="mt-14 max-w-4xl mx-auto p-4 rounded-2xl glass-panel border border-slate-800/80 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
          <div className="flex items-center space-x-3 p-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Microservices</div>
              <div className="text-sm font-bold font-mono text-slate-100">
                7 Connected
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">WAF Status</div>
              <div className="text-sm font-bold font-mono text-emerald-400">
                Casbin RBAC Active
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">NVMe Local SSD</div>
              <div className="text-sm font-bold font-mono text-slate-100">
                220GB Logging
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Active Dynu Ingress</div>
              <div className="text-sm font-bold font-mono text-slate-100">
                {clusterStatus?.active_domains || 4} Domains TLS
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
