import React from 'react';
import {
  GitBranch,
  Cpu,
  HardDrive,
  Zap,
  ShieldCheck,
  Activity,
  Terminal,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { FeatureSwitch } from '../types';

interface FeatureModulesProps {
  features: FeatureSwitch[];
  onToggleFeature: (id: string, currentEnabled: boolean) => void;
  onOpenSwitchboard: () => void;
}

export const FeatureModules: React.FC<FeatureModulesProps> = ({
  features,
  onToggleFeature,
  onOpenSwitchboard,
}) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'GitBranch':
        return <GitBranch className="w-5 h-5 text-cyan-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-blue-400" />;
      case 'HardDrive':
        return <HardDrive className="w-5 h-5 text-purple-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-pink-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-amber-400" />;
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-cyan-400" />;
      default:
        return <Sliders className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <section
      id="features"
      className="py-16 md:py-24 bg-slate-950/40 border-t border-b border-slate-900 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
              <Sliders className="w-3.5 h-3.5" />
              <span>Database-Backed Visibility & Governance</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ecosystem Feature Switchboard
            </h2>
            <p className="mt-1 text-sm text-slate-400 max-w-xl">
              Control the live runtime visibility and status of core platform
              capabilities. Toggles persist directly to the AppDeploy KV
              database.
            </p>
          </div>

          <button
            onClick={onOpenSwitchboard}
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all self-start md:self-auto"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Manage All Switches</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {features.map(feat => (
            <div
              key={feat.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                feat.enabled
                  ? 'glass-panel border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/80 border-slate-900 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    {getIcon(feat.icon)}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                    {feat.category}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1">
                  {feat.name}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                  {feat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  {feat.enabled ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] font-medium text-emerald-400">
                        Enabled
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[11px] font-medium text-slate-500">
                        Disabled
                      </span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => onToggleFeature(feat.id, feat.enabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative focus:outline-none ${
                    feat.enabled ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                  title={feat.enabled ? 'Click to disable' : 'Click to enable'}
                >
                  <span
                    className={`block w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      feat.enabled ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
