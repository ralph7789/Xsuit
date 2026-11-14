import React from 'react';
import {
  Activity,
  Server,
  HardDrive,
  Globe,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { ClusterStatusResponse } from '../types';

interface TelemetrySectionProps {
  clusterStatus: ClusterStatusResponse | null;
}

export const TelemetrySection: React.FC<TelemetrySectionProps> = ({
  clusterStatus,
}) => {
  const services = clusterStatus?.services || [];

  return (
    <section id="telemetry" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 pb-6 border-b border-slate-800">
          <div className="inline-flex items-center space-x-1.5 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Infrastructure Health & Observability</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cluster Telemetry & Node Architecture
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Real-time health, response latency, and protocol routing for all
            active microservices hosted on Azure infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Host Compute</div>
              <div className="text-sm font-bold text-slate-200">
                Azure Standard_D4ds_v6
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                4 vCPU / 16 GB RAM
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">
                Observability NVMe Disk
              </div>
              <div className="text-sm font-bold text-slate-200">
                220GB Local Scratch
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                Mounted at /data/logs
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-slate-800 flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">
                Ingress Reverse Proxy
              </div>
              <div className="text-sm font-bold text-slate-200">
                Caddy v2.8 Automatic TLS
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                4 Multi-Domain SANs
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl glass-panel border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Port</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Uptime</th>
                  <th className="py-3 px-4">Protocol</th>
                  <th className="py-3 px-4">Routing Path</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {services.map(svc => (
                  <tr
                    key={svc.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-200 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{svc.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyan-400">
                      :{svc.port}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{svc.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {svc.latency}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {svc.uptime}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {svc.protocol}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {svc.route}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
