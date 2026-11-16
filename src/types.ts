export interface FeatureSwitch {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  enabled: boolean;
  updatedAt: string;
}

export interface ClusterService {
  id: string;
  name: string;
  port: number;
  status: string;
  latency: string;
  uptime: string;
  protocol: string;
  route: string;
  subdomainPrefix: string;
}

export interface ClusterStatusResponse {
  cluster: string;
  storage: string;
  active_domains: number;
  ingress: string;
  services: ClusterService[];
}

export interface AppItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category:
    | 'AI & Models'
    | 'Security & Auth'
    | 'Infrastructure'
    | 'Realtime & P2P'
    | 'Engineering & Code';
  subdomainPrefix: string;
  port: number;
  iconName: string;
  badge?: string;
  status: 'Production' | 'Live Beta' | 'Internal Service' | 'Active' | 'Read-Only';
  accentColor: string;
  features: string[];
  docPath: string;
  tier?: 'public' | 'admin';
  versionPinned?: string;
  isReadOnly?: boolean;
}

export interface EnvironmentInfo {
  id: string;
  name: string;
  tier: string;
  isReadOnly: boolean;
  resourceLimits?: {
    maxCpu: number;
    maxMemoryMb: number;
  };
  dataNamespace?: string;
}

export interface DomainInfo {
  id: string;
  hostname: string;
  name: string;
  isPrimary: boolean;
}

export interface PortalScopeInfo {
  mode: 'INTERNAL' | 'CX';
  title: string;
  badge: string;
  description: string;
  dataScope: 'internal' | 'cx';
}

export interface DynamicEnvironmentAppsResponse {
  portal?: PortalScopeInfo;
  domain: DomainInfo;
  environment: EnvironmentInfo;
  availableEnvironments: EnvironmentInfo[];
  user: {
    authenticated: boolean;
    role: string;
    isXAdmin: boolean;
  };
  apps: AppItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  latency_ms?: number;
}

export interface XidUser {
  authenticated: boolean;
  userId?: string;
  email?: string;
  name?: string;
  role: 'ANONYMOUS' | 'USER' | 'DEV' | 'ADMIN' | 'XADMIN';
  isXAdmin: boolean;
  canAccessSystem: boolean;
}
