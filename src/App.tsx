import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AppMatrix } from './components/AppMatrix';
import { FeatureModules } from './components/FeatureModules';
import { TelemetrySection } from './components/TelemetrySection';
import { ChatDrawer } from './components/ChatDrawer';
import { SwitchboardModal } from './components/SwitchboardModal';
import { APPS_CATALOG } from './data/apps';
import {
  FeatureSwitch,
  ClusterStatusResponse,
  AppItem,
  ChatMessage,
  XidUser,
  DomainInfo,
  EnvironmentInfo,
  PortalScopeInfo,
} from './types';
import { Sparkles, Lock, X, AlertTriangle, ShieldCheck } from 'lucide-react';

function App() {
  const [features, setFeatures] = useState<FeatureSwitch[]>([]);
  const [clusterStatus, setClusterStatus] =
    useState<ClusterStatusResponse | null>(null);
  const [dynamicApps, setDynamicApps] = useState<AppItem[]>(APPS_CATALOG);
  const [activeEnvironment, setActiveEnvironment] = useState<EnvironmentInfo | null>(null);
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null);
  const [portalScope, setPortalScope] = useState<PortalScopeInfo | null>(null);
  const [availableEnvs, setAvailableEnvs] = useState<EnvironmentInfo[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [switchboardOpen, setSwitchboardOpen] = useState(false);
  const [xidUser, setXidUser] = useState<XidUser | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content:
        'Welcome to Xcorp Core! I am Aladin AI, your autonomous assistant. Feel free to ask about our ecosystem apps, platform features, or technology stack. For elevated cluster administration, sign in with XID.',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const getAppUrl = (subdomainPrefix: string) => {
    if (typeof window === 'undefined') return '#';
    const host = window.location.hostname;
    const isDynuDomain =
      host.includes('mywire.org') ||
      host.includes('ddnsfree.com') ||
      host.includes('freeddns.org') ||
      host.includes('kozow.com');

    if (isDynuDomain) {
      if (host.startsWith('xcorp.')) {
        return `https://${subdomainPrefix}.${host}`;
      }
      return `https://${subdomainPrefix}.${host}`;
    }
    if (subdomainPrefix === 'aladin') {
      return 'https://aladin.xcorp.mywire.org';
    }
    return `https://${subdomainPrefix}.xcorp.mywire.org`;
  };

  const getStoredToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token') || params.get('access_token');
    if (urlToken) {
      localStorage.setItem('xid_token', urlToken);
      window.history.replaceState(null, '', window.location.pathname);
      return urlToken;
    }
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashToken = hashParams.get('access_token') || hashParams.get('token');
      if (hashToken) {
        localStorage.setItem('xid_token', hashToken);
        window.history.replaceState(null, '', window.location.pathname);
        return hashToken;
      }
    }
    return localStorage.getItem('xid_token');
  };

  const fetchAuthUser = async (token?: string | null) => {
    const activeToken = token !== undefined ? token : getStoredToken();
    try {
      const res = await api.get(
        activeToken ? `/api/me?token=${encodeURIComponent(activeToken)}` : '/api/me'
      );
      if (res?.data?.user) {
        setXidUser(res.data.user);
      }
    } catch (err) {
      setXidUser({
        authenticated: false,
        role: 'ANONYMOUS',
        isXAdmin: false,
        canAccessSystem: false,
      });
    }
  };

  const fetchDynamicApps = async (selectedEnvId?: string) => {
    try {
      const token = getStoredToken();
      let url = '/api/environment/apps';
      const params = new URLSearchParams();
      if (selectedEnvId) params.set('env', selectedEnvId);
      if (token) params.set('token', token);
      const q = params.toString();
      if (q) url += `?${q}`;

      const res = await api.get(url);
      if (res?.data?.apps) {
        setDynamicApps(res.data.apps);
      }
      if (res?.data?.environment) {
        setActiveEnvironment(res.data.environment);
      }
      if (res?.data?.domain) {
        setDomainInfo(res.data.domain);
      }
      if (res?.data?.portal) {
        setPortalScope(res.data.portal);
      }
      if (res?.data?.availableEnvironments) {
        setAvailableEnvs(res.data.availableEnvironments);
      }
    } catch (err) {
      console.warn('Using default apps catalog fallback', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = getStoredToken();
      await fetchAuthUser(token);
      await fetchDynamicApps();

      try {
        const featRes = await api.get('/api/features');
        if (featRes?.data?.features) {
          setFeatures(featRes.data.features);
        }
      } catch (err) {
        console.warn('Using local default features');
      }

      try {
        const clusterRes = await api.get(
          token ? `/api/cluster/status?token=${encodeURIComponent(token)}` : '/api/cluster/status'
        );
        if (clusterRes?.data) {
          setClusterStatus(clusterRes.data);
        }
      } catch (err) {
        console.warn('Using fallback cluster telemetry');
      }
    };
    fetchData();
  }, []);

  const openLoginModal = () => {
    setLoginError('');
    setIsLoginModalOpen(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginBusy(true);
    try {
      const res = await api.post('/api/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });
      if (res?.data?.token) {
        localStorage.setItem('xid_token', res.data.token);
        if (res.data.user) {
          setXidUser(res.data.user);
        } else {
          await fetchAuthUser(res.data.token);
        }
        await fetchDynamicApps();
        setIsLoginModalOpen(false);
        setLoginPassword('');
        setChatMessages(prev => [
          ...prev,
          {
            id: `m-${Date.now()}`,
            role: 'assistant',
            content: `Welcome back, ${res.data.user?.name || res.data.user?.email || 'User'}! Your ${res.data.user?.isXAdmin ? 'XAdmin' : 'User'} session is active.`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
      } else {
        setLoginError('Authentication succeeded but no token returned');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Please check your credentials.';
      setLoginError(msg);
    } finally {
      setLoginBusy(false);
    }
  };

  const handleLogout = async () => {
    if (typeof window === 'undefined') return;
    try {
      await api.post('/api/auth/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('xid_token');
    fetchDynamicApps();
    setXidUser({
      authenticated: false,
      role: 'ANONYMOUS',
      isXAdmin: false,
      canAccessSystem: false,
    });
    setChatMessages([
      {
        id: `m-${Date.now()}`,
        role: 'assistant',
        content:
          'You have signed out of XID. Public Concierge mode is now active.',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  const handleToggleFeature = async (id: string, currentEnabled: boolean) => {
    const nextState = !currentEnabled;
    setFeatures(prev =>
      prev.map(f => (f.id === id ? { ...f, enabled: nextState } : f))
    );

    try {
      const token = getStoredToken();
      await api.post('/api/features/toggle', { id, enabled: nextState, token });
    } catch (err) {
      console.error('Failed to persist feature switch:', err);
    }
  };

  const handleResetFeatures = async () => {
    try {
      const token = getStoredToken();
      await api.post('/api/features/reset', { token });
      const res = await api.get('/api/features');
      if (res?.data?.features) {
        setFeatures(res.data.features);
      }
    } catch (err) {
      console.error('Failed to reset features:', err);
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const text = (customPrompt || inputMessage).trim();
    if (!text || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const token = getStoredToken();
      const historyPayload = chatMessages
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }));
      historyPayload.push({ role: 'user', content: text });

      const res = await api.post('/api/chat', {
        message: text,
        messages: historyPayload,
        token,
      });

      const replyText =
        res?.data?.reply ||
        'I processed your request in accordance with XID governance.';
      const latency = res?.data?.latency_ms || 180;

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        latency_ms: latency,
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          '⚠️ I encountered a temporary connection issue reaching the AI backend. Please try your message again.',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        latency_ms: 12,
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleLaunchApp = (app: AppItem) => {
    const url = getAppUrl(app.subdomainPrefix);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[#060910] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      <Header
        apps={dynamicApps}
        getAppUrl={getAppUrl}
        onOpenChat={() => setChatOpen(true)}
        onOpenSwitchboard={() => setSwitchboardOpen(true)}
        onLaunchApp={handleLaunchApp}
        unreadCount={0}
        user={xidUser}
        portalScope={portalScope}
        onLoginWithXid={openLoginModal}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full mx-auto">
        <Hero
          clusterStatus={clusterStatus}
          getAppUrl={getAppUrl}
          onOpenChat={() => setChatOpen(true)}
          onLoginWithXid={openLoginModal}
          user={xidUser}
          portalScope={portalScope}
        />

        {activeEnvironment?.isReadOnly && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-8">
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between text-amber-200 text-xs shadow-lg shadow-amber-950/20">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold uppercase tracking-wider text-amber-300">
                    Audit & Compliance Read-Only Mirror Active
                  </div>
                  <div className="text-amber-400/80 text-[11px] mt-0.5">
                    Environment <span className="font-mono">{activeEnvironment.name}</span> is operating under strict read-only gating. Mutating HTTP actions (POST/PUT/DELETE) are blocked with RFC 7807 problem details.
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                RFC 7807 GATED
              </span>
            </div>
          </div>
        )}

        <AppMatrix
          apps={dynamicApps}
          getAppUrl={getAppUrl}
          onLaunchApp={handleLaunchApp}
          user={xidUser}
          domain={domainInfo}
          environment={activeEnvironment}
          availableEnvironments={availableEnvs}
          onSelectEnvironment={envId => fetchDynamicApps(envId)}
        />

        <FeatureModules
          features={features}
          onToggleFeature={handleToggleFeature}
          onOpenSwitchboard={() => setSwitchboardOpen(true)}
        />

        {(portalScope?.dataScope === 'internal' || xidUser?.isXAdmin) && (
          <TelemetrySection clusterStatus={clusterStatus} />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-[#04060b] py-8 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Xcorp Distributed Cloud OS · All Systems Operational</span>
          </div>
          <div>Caddy Ingress · Casbin RBAC · XID Identity Federation</div>
        </div>
      </footer>

      <ChatDrawer
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={chatMessages}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        onSendMessage={handleSendMessage}
        chatLoading={chatLoading}
        user={xidUser}
        onLoginWithXid={openLoginModal}
        onLogout={handleLogout}
      />

      <SwitchboardModal
        isOpen={switchboardOpen}
        onClose={() => setSwitchboardOpen(false)}
        features={features}
        onToggleFeature={handleToggleFeature}
        onResetFeatures={handleResetFeatures}
      />

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-7 shadow-2xl shadow-cyan-500/10">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
                <Lock className="w-6 h-6 text-slate-950" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">XCorp ID Authentication</h3>
              <p className="text-xs text-slate-400 mt-1">Single Sign-On for Unified Cloud Suite</p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="name@aladin.ai"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/40 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loginBusy}
                className="w-full mt-2 py-3 rounded-xl font-semibold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/25 transition disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
              >
                {loginBusy ? (
                  <span>Authenticating with XID...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Sign In to Suite</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-[11px] text-slate-500">
              Zero External Redirects · Stay on Central Portal
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
