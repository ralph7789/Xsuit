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
  status: 'Production' | 'Live Beta' | 'Internal Service';
  accentColor: string;
  features: string[];
  docPath: string;
  tier?: 'public' | 'admin';
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
