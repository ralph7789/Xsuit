import React from 'react';
import { X, Sliders, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { FeatureSwitch } from '../types';

interface SwitchboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  features: FeatureSwitch[];
  onToggleFeature: (id: string, currentEnabled: boolean) => void;
  onResetFeatures: () => void;
}

export const SwitchboardModal: React.FC<SwitchboardModalProps> = ({
  isOpen,
  onClose,
  features,
  onToggleFeature,
  onResetFeatures,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel border border-slate-700 shadow-2xl p-6 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Platform Feature Switchboard
              </h3>
              <p className="text-xs text-slate-400">
                Database-persisted ecosystem controls (AppDeploy KV Table:{' '}
                <code className="text-cyan-300 font-mono">
                  feature_switches
                </code>
                )
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {features.map(feat => (
            <div
              key={feat.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
            >
              <div className="flex-1 pr-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-200">
                    {feat.name}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    {feat.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {feat.description}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onToggleFeature(feat.id, feat.enabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                    feat.enabled ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      feat.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={onResetFeatures}
            className="inline-flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to System Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
