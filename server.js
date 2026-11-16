import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10007;
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FEATURES_FILE = path.join(DATA_DIR, 'features.json');
const DEFAULT_FEATURES = [
  {
    id: 'git_intel',
    name: 'GitHub Deep Intelligence & CI/CD',
    category: 'Engineering & DevOps',
    description: 'Autonomous repository indexing, automated PR verification, and GitHub Actions telemetry pipeline.',
    icon: 'GitBranch',
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'jules_bridge',
    name: 'Google Jules Autonomous Agent Bridge',
    category: 'Agent Orchestration',
    description: 'Bi-directional communication bridge to Jules VM sandbox for isolated E2E runtime testing and bootstrapping.',
    icon: 'Cpu',
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cloud_storage',
    name: 'Decentralized Object Storage Vault',
    category: 'Storage & Data',
    description: 'High-speed object and asset persistence backed by 220GB NVMe local scratch and multi-cloud sync.',
    icon: 'HardDrive',
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'webrtc_blitz',
    name: 'Blitz Ephemeral P2P Realtime Mesh',
    category: 'Realtime Mesh',
    description: 'Sub-millisecond WebRTC data channels and ephemeral session isolation with zero-knowledge transfers.',
    icon: 'Zap',
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sentinel_soc',
    name: 'Sentinel AI WAF & Threat Mitigation',
    category: 'Security & Governance',
    description: 'Casbin RBAC enforcer, cryptographic RS256 token verification, and automated SOAR playbooks.',
    icon: 'ShieldCheck',
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'nvme_telemetry',
    name: '220GB NVMe Distributed Logging & Loki',
    category: 'Observability',
    description: 'Single-threaded Vector shipper streaming W3C correlation traces directly into Grafana and Loki.',
    icon: 'Activity',
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'xllm_studio',
    name: 'XLLM Model Gateway & Benchmark Studio',
    category: 'AI & Inference',
    description: 'Unified OpenAI-compatible gateway with canonical model deduplication, 429 failover, and TTFT metrics.',
    icon: 'Terminal',
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
];

function getFeatures() {
  try {
    if (fs.existsSync(FEATURES_FILE)) {
      return JSON.parse(fs.readFileSync(FEATURES_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading features file:', err);
  }
  return DEFAULT_FEATURES;
}

function saveFeatures(features) {
  try {
    fs.writeFileSync(FEATURES_FILE, JSON.stringify(features, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving features file:', err);
  }
}

if (!fs.existsSync(FEATURES_FILE)) {
  saveFeatures(DEFAULT_FEATURES);
}

// XID Public JWK from https://xid.xcorp.mywire.org/oauth2/jwks
const XID_JWK = {
  kty: 'RSA',
  n: 'o86fBDdhLA-9N7REdSAPQ6bX5JecLPkVMCdMrycvGXUa_B2sXgPRQmL_LvdVexchGzZNHg_NpKVaNlsOTWEYjpm9UJcZH2pwIlcPf7bjflbPESaBSj35kB2H7UXsIAZf2ol_0BmaMtMChst5_lrshAg80aIVmjWxBYNEQ_0PD_huuYvvvjxkl0rL0JcyFEznlsOTYESqNEgVJp1kPgzmR8yqyK2VsW3i6a0idXqAq6BByJn4RCIeX6V42HiMq4a2NIiGioR2MrLxqgSRhwk5-z4IVdflbCYzh4F7WNvpgcF3XYiYrqX6AOYgubNtAJIYuAAbH8NzNK2Qd_hoaqxECQ',
  e: 'AQAB',
};

const GATEWAY_SECRETS = [
  '16f8c0ef4a5d391b26034086c628469d3f9f497f08163ab9b40137092f2909ef',
  'super_secret_test_key',
];

let rsaPublicKey = null;
try {
  rsaPublicKey = crypto.createPublicKey({ key: XID_JWK, format: 'jwk' });
} catch (e) {
  console.error('Failed to create RSA public key:', e);
}

function verifyToken(token) {
  try {
    if (!token) return null;
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));

    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }

    if (header.alg === 'RS256' && rsaPublicKey) {
      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(`${headerB64}.${payloadB64}`);
      const sig = Buffer.from(sigB64, 'base64url');
      if (verifier.verify(rsaPublicKey, sig)) {
        return payload;
      }
    }

    if (header.alg === 'HS256' || !header.alg) {
      for (const secret of GATEWAY_SECRETS) {
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(`${headerB64}.${payloadB64}`);
        const expectedSig = hmac.digest('base64url');
        if (expectedSig === sigB64) {
          return payload;
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', GATEWAY_SECRETS[0]);
  hmac.update(`${headerB64}.${payloadB64}`);
  const sigB64 = hmac.digest('base64url');
  return `${headerB64}.${payloadB64}.${sigB64}`;
}


function extractToken(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.substring(7).trim();
  }

  const cookieHeader = req.headers['cookie'];
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    for (const c of cookies) {
      if (c.startsWith('xid_token=')) return c.substring(10);
      if (c.startsWith('xcorp_code_session=')) return c.substring(19);
      if (c.startsWith('__Host-xcorp_code_session=')) return c.substring(26);
      if (c.startsWith('token=')) return c.substring(6);
    }
  }

  if (req.query && req.query.token) {
    return String(req.query.token);
  }

  if (req.body && req.body.token) {
    return String(req.body.token);
  }

  return null;
}

function getAccessTier(req) {
  const fwdUser = req.headers['x-auth-user'];
  const fwdRoles = req.headers['x-auth-roles'];

  if (fwdUser) {
    const isXAdmin = String(fwdRoles || '').toLowerCase().includes('admin');
    return {
      authenticated: true,
      email: fwdUser,
      name: fwdUser.split('@')[0],
      role: isXAdmin ? 'XADMIN' : 'USER',
      isXAdmin,
      canAccessSystem: isXAdmin,
    };
  }

  const token = extractToken(req);
  if (!token) {
    return {
      authenticated: false,
      role: 'ANONYMOUS',
      isXAdmin: false,
      canAccessSystem: false,
    };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return {
      authenticated: false,
      role: 'ANONYMOUS',
      isXAdmin: false,
      canAccessSystem: false,
    };
  }

  const roleStr = String(payload.role || payload.roles || '').toUpperCase();
  const isAdmin =
    payload.is_admin === true ||
    roleStr.includes('ADMIN') ||
    roleStr.includes('XADMIN') ||
    payload.email === 'jeko@aladin.ai';

  return {
    authenticated: true,
    userId: payload.sub || payload.id,
    email: payload.email || payload.sub,
    name: payload.name || (payload.email ? payload.email.split('@')[0] : 'User'),
    role: isAdmin ? 'XADMIN' : 'USER',
    isXAdmin: isAdmin,
    canAccessSystem: isAdmin,
  };
}

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY || '';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';

async function generateChatCompletion(systemPrompt, messages) {
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-8)
  ];

  // 1. Try Cloudflare Workers AI (Llama 3.3 70B Fast)
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
        messages: formattedMessages,
        max_tokens: 1024,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return { text: content.trim(), model: 'cloudflare:llama-3.3-70b' };
    }
  } catch (err) {
    console.warn('Cloudflare inference failed or timed out:', err.message);
  }

  // 2. Fallback to Mistral AI (Codestral)
  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'codestral-latest',
        messages: formattedMessages,
        max_tokens: 1024,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return { text: content.trim(), model: 'mistral:codestral' };
    }
  } catch (err) {
    console.warn('Mistral inference failed or timed out:', err.message);
  }

  // 3. Fallback to local Ollama on Azure VM
  try {
    const res = await fetch('http://127.0.0.1:11434/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5-coder:7b',
        messages: formattedMessages,
        max_tokens: 512,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) return { text: content.trim(), model: 'ollama:qwen2.5-coder' };
    }
  } catch (err) {
    console.warn('Ollama inference failed or timed out:', err.message);
  }

  return {
    text: 'Welcome to Xcorp Core. I am Aladin AI. How can I assist you with the platform applications today?',
    model: 'aladin:concierge-fallback'
  };
}

// Routes
app.get('/api/environment/apps', async (req, res) => {
  const user = getAccessTier(req);
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'xcorp.mywire.org').split(':')[0].toLowerCase();
  const requestedEnv = req.query.env ? String(req.query.env).trim().toLowerCase() : null;

  // Query XID for dynamic domain and environment definitions
  const xidUrls = [
    process.env.XID_INTERNAL_URL || 'http://xcorp-xid:10000',
    'http://127.0.0.1:10002',
    'https://xid.xcorp.mywire.org',
  ];
  let domainRegistry = null;
  for (const url of xidUrls) {
    try {
      const resp = await fetch(`${url}/api/domains`, { signal: AbortSignal.timeout(3000) });
      if (resp.ok) {
        domainRegistry = await resp.json();
        break;
      }
    } catch {
      // try next
    }
  }

  const domains = domainRegistry?.domains || [];
  const matchedDomain = domains.find(d => host.includes(d.hostname) || d.hostname.includes(host)) || domains[0] || {
    id: 'dom_xcorp_mywire_org',
    hostname: 'xcorp.mywire.org',
    name: 'Primary Enterprise Domain (MyWire)',
    isPrimary: true,
    environments: []
  };

  const environments = matchedDomain.environments || [];
  const activeEnv = (requestedEnv ? environments.find(e => e.id === requestedEnv || e.id === `env_${requestedEnv}`) : null)
    || environments[0]
    || {
      id: 'env_prod',
      name: 'Default Production',
      tier: 'PRODUCTION',
      isReadOnly: false,
      allowedApps: ['aladin', 'kuchoo', 'blitz', 'mobile'],
      appVersions: { aladin: 'v1.1.0-stable', kuchoo: 'sha-1446fe2', blitz: 'latest', mobile: 'latest' },
      allowedRoles: ['XADMIN', 'ENTERPRISE_USER', 'WORKFORCE']
    };

  const catalog = [
    {
      id: 'aladin',
      name: 'Aladin AI Assistant',
      tagline: 'Conversational Swarm Orchestration & Code Reasoning',
      description: 'Autonomous multi-agent intelligence platform integrating GitHub sync, deep repository reasoning, and autonomous code execution.',
      category: 'AI & Models',
      subdomainPrefix: 'aladin',
      port: 3080,
      iconName: 'Sparkles',
      badge: 'Flagship AI',
      accentColor: '#00F0FF',
      tier: 'public',
      features: ['Multi-agent swarms', 'Fast reasoning', 'GitHub PAT integration', 'OAuth2 & OIDC auth'],
    },
    {
      id: 'code',
      name: 'Aladin Code Studio',
      tagline: 'Autonomous AI Cloud IDE & Workspace',
      description: 'Next-generation cloud development environment powered by autonomous agent tool-loops, real-time code reasoning, and terminal PTY streaming.',
      category: 'Engineering & Code',
      subdomainPrefix: 'code',
      port: 8090,
      iconName: 'Code',
      badge: 'Cloud IDE',
      accentColor: '#38BDF8',
      tier: 'public',
      features: ['In-browser full IDE', 'Autonomous pair programming', 'Direct container execution', 'XID identity integration'],
    },
    {
      id: 'kuchoo',
      name: 'Kuchoo Chat & Meet',
      tagline: 'End-to-End Team Chat & WebRTC Video Conferencing',
      description: 'Enterprise messaging and real-time collaboration platform featuring instant group channels, WebRTC audio/video calls, and Aladin AI copilot.',
      category: 'Realtime & P2P',
      subdomainPrefix: 'kuchoo',
      port: 5000,
      iconName: 'MessageSquare',
      badge: 'Team Chat',
      accentColor: '#10B981',
      tier: 'public',
      features: ['XID Single Sign-On', 'WebRTC audio & video calling', 'Aladin AI chat copilot (@aladin)', 'Direct & group channels'],
    },
    {
      id: 'blitz',
      name: 'Blitz P2P Realtime Engine',
      tagline: 'Sub-Millisecond WebRTC Mesh & Ephemeral Rooms',
      description: 'Decentralized peer-to-peer data channel mesh for low-latency collaboration, zero-knowledge data transfers, and screen sharing.',
      category: 'Realtime & P2P',
      subdomainPrefix: 'blitz',
      port: 3004,
      iconName: 'Zap',
      badge: 'Ultra Fast',
      accentColor: '#EC4899',
      tier: 'public',
      features: ['WebRTC data channels', 'End-to-end encryption', 'STUN/TURN automatic relay', 'Zero server persistence'],
    },
    {
      id: 'studio',
      name: 'Aladin Studio & Visual Mesh',
      tagline: 'Agent Workflow Visual Designer',
      description: 'Visual workflow canvas for multi-agent chains, visual pipeline debugging, and runtime state inspection.',
      category: 'AI & Models',
      subdomainPrefix: 'studio',
      port: 10005,
      iconName: 'Terminal',
      badge: 'Visual Canvas',
      accentColor: '#06B6D4',
      tier: 'public',
      features: ['Visual prompt canvas', 'Multi-modal graph builder', 'Realtime token analyzer'],
    },
    {
      id: 'sentinel',
      name: 'Sentinel SOC & WAF Gateway',
      tagline: 'Casbin RBAC & Zero-Trust Threat Mitigation',
      description: 'High-performance security gateway intercepting all inbound traffic with RFC 7231 CORS compliance and real-time WAF telemetry.',
      category: 'Security & Auth',
      subdomainPrefix: 'sentinel',
      port: 8000,
      iconName: 'Shield',
      badge: 'Security Core',
      accentColor: '#10B981',
      tier: 'admin',
      features: ['Casbin dynamic policies', 'WAF request auditing', 'JWT RS256 verification', 'SOAR playbooks'],
    },
    {
      id: 'xdb',
      name: 'XDB Central Data Plane',
      tagline: 'Unified REST & Database Federation Engine',
      description: 'Centralized database access layer bridging cloud MongoDB Atlas and Supabase PostgreSQL with automated schema migrations.',
      category: 'Infrastructure',
      subdomainPrefix: 'xdb',
      port: 10001,
      iconName: 'Database',
      badge: 'Data Plane',
      accentColor: '#8B5CF6',
      tier: 'admin',
      features: ['Unified REST endpoints', 'Postgres + Mongo pooling', 'Automated failover', 'Query audit logs'],
    },
    {
      id: 'xllm',
      name: 'XLLM Inference Engine',
      tagline: 'Canonical Model Deduplication & Gateway',
      description: 'High-throughput OpenAI v1 compatible inference gateway with dynamic load balancing, fallback routing, and token telemetry.',
      category: 'AI & Models',
      subdomainPrefix: 'xllm',
      port: 10003,
      iconName: 'Terminal',
      badge: 'Inference',
      accentColor: '#06B6D4',
      tier: 'admin',
      features: ['OpenAI v1 compatibility', 'Streaming SSE responses', 'Dynamic quota pooling', 'Model latency benchmarks'],
    },
    {
      id: 'grafana',
      name: 'Grafana Enterprise Telemetry',
      tagline: 'Loki Real-Time Log Streams & NVMe Observability',
      description: 'Distributed metrics and trace dashboard reading from the 220GB NVMe local SSD with microsecond log retrieval.',
      category: 'Infrastructure',
      subdomainPrefix: 'grafana',
      port: 3000,
      iconName: 'Activity',
      badge: 'Monitoring',
      accentColor: '#F59E0B',
      tier: 'admin',
      features: ['Vector log ingestion', 'SOC 2 audit trails', 'Latency p95/p99 heatmaps', 'System resource alerts'],
    },
    {
      id: 'xid',
      name: 'XID SSO Identity Hub',
      tagline: 'Decentralized Auth & Single Sign-On Provider',
      description: 'Unified federated authentication service supporting GitHub, Google, passwordless magic links, and cross-domain SSO tokens.',
      category: 'Security & Auth',
      subdomainPrefix: 'xid',
      port: 10002,
      iconName: 'Lock',
      badge: 'Auth Hub',
      accentColor: '#3B82F6',
      tier: 'admin',
      features: ['OAuth2 / OIDC server', 'Cross-subdomain cookies', 'Multi-factor auth (MFA)', 'RBAC claim provisioning'],
    },
    {
      id: 'annyx',
      name: 'Annyx Control Panel',
      tagline: 'Aladin Docker & Dynamic GitOps Fleet Manager',
      description: 'Autonomous cluster orchestrator managing dynamic Caddy ingress, environment routing, container lifecycles, and NVMe health.',
      category: 'Infrastructure',
      subdomainPrefix: 'annyx',
      port: 10008,
      iconName: 'Layers',
      badge: 'Fleet Ops',
      accentColor: '#F43F5E',
      tier: 'admin',
      features: ['Dynamic route generator', 'Container health telemetry', 'GitOps sync daemon', 'Audit logs'],
    }
  ];

  const allowedSet = new Set(activeEnv.allowedApps || []);
  const isXAdmin = !!(user && user.isXAdmin);

  const visibleApps = catalog.filter(app => {
    if (app.tier === 'admin') {
      return isXAdmin;
    }
    return allowedSet.has(app.id) || allowedSet.has(app.subdomainPrefix);
  }).map(app => {
    const version = activeEnv.appVersions?.[app.id] || activeEnv.appVersions?.[app.subdomainPrefix] || 'latest';
    const isCleanProd = activeEnv.id === 'env_prod' || activeEnv.id === 'prod';
    const cleanEnvSuffix = activeEnv.id.replace(/^env_/, '');
    return {
      ...app,
      versionPinned: version,
      status: activeEnv.isReadOnly ? 'Read-Only' : 'Active',
      isReadOnly: !!activeEnv.isReadOnly,
      subdomainPrefix: isCleanProd ? app.subdomainPrefix : `${app.subdomainPrefix}.${cleanEnvSuffix}`
    };
  });

  const isInternalHost = host.includes('mywire.org');
  const dataScope = (isInternalHost && isXAdmin) ? 'internal' : 'cx';
  const portalMode = dataScope === 'internal' ? 'INTERNAL' : 'CX';

  return res.json({
    portal: {
      mode: portalMode,
      title: portalMode === 'INTERNAL' ? 'XCORP INDUSTRIAL HQ' : 'XCORP CLOUD WORKSPACE',
      badge: portalMode === 'INTERNAL' ? 'INTERNAL - HQ' : 'CUSTOMER - CX',
      description: portalMode === 'INTERNAL' ? 'Internal Control Plane & Infrastructure Management' : 'Customer Workspace & Dedicated AI Applications',
      dataScope
    },
    domain: {
      id: matchedDomain.id,
      hostname: matchedDomain.hostname,
      name: matchedDomain.name,
      isPrimary: matchedDomain.isPrimary
    },
    environment: {
      id: activeEnv.id,
      name: activeEnv.name,
      tier: activeEnv.tier,
      isReadOnly: !!activeEnv.isReadOnly,
      resourceLimits: activeEnv.resourceLimits,
      dataNamespace: activeEnv.dataNamespace
    },
    availableEnvironments: environments.map(e => ({
      id: e.id,
      name: e.name,
      tier: e.tier,
      isReadOnly: !!e.isReadOnly
    })),
    user: {
      authenticated: user.authenticated,
      role: user.role,
      isXAdmin: user.isXAdmin
    },
    apps: visibleApps
  });
});

app.get('/api/features', (req, res) => {
  const user = getAccessTier(req);
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'xcorp.mywire.org').split(':')[0].toLowerCase();
  const isInternal = host.includes('mywire.org') && user.isXAdmin;
  const allFeatures = getFeatures();

  if (!isInternal) {
    // CX scope receives only customer-safe features, strictly omitting internal SOC & infra flags
    const internalFeatureIds = new Set(['sentinel_soc', 'nvme_telemetry', 'jules_bridge', 'xllm_studio']);
    const cxFeatures = allFeatures.filter(f => !internalFeatureIds.has(f.id));
    return res.json({ features: cxFeatures, scope: 'cx' });
  }

  return res.json({ features: allFeatures, scope: 'internal' });
});

app.post('/api/features/toggle', (req, res) => {
  const { id, enabled } = req.body || {};
  if (!id || typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'id and enabled are required' });
  }
  const features = getFeatures();
  const idx = features.findIndex(f => f.id === id);
  if (idx >= 0) {
    features[idx].enabled = enabled;
    features[idx].updatedAt = new Date().toISOString();
  } else {
    features.push({ id, enabled, updatedAt: new Date().toISOString() });
  }
  saveFeatures(features);
  return res.json({ success: true, id, enabled });
});

app.post('/api/features/reset', (req, res) => {
  saveFeatures(DEFAULT_FEATURES);
  return res.json({ success: true, message: 'Reset to default' });
});

app.post(['/api/auth/login', '/api/identity/login'], async (req, res) => {
  try {
    const { email, password, code } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const xidUrls = [
      process.env.XID_INTERNAL_URL || 'http://xcorp-xid:10000',
      'http://127.0.0.1:10002',
      'https://xid.xcorp.mywire.org',
    ];

    let xidResp = null;
    let lastErr = null;
    for (const url of xidUrls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const r = await fetch(`${url}/api/identity/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: String(email).trim().toLowerCase(),
            password: String(password),
            code: code ? String(code) : undefined,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        xidResp = r;
        break;
      } catch (e) {
        lastErr = e;
      }
    }

    if (!xidResp) {
      return res.status(502).json({
        error: 'XID authentication service is currently unreachable',
        detail: String(lastErr?.message || lastErr),
      });
    }

    if (!xidResp.ok) {
      const errData = await xidResp.json().catch(() => ({}));
      return res.status(xidResp.status).json({
        error: errData.error || errData.message || 'Invalid email or password',
      });
    }

    const xidData = await xidResp.json();
    const identity = xidData.identity || {};
    const roles = Array.isArray(identity.roles) ? identity.roles : [];
    const isXAdmin =
      roles.some(r => ['XAdmin', 'admin', 'ADMIN'].includes(r)) ||
      identity.email === 'jeko@aladin.ai';

    const tokenPayload = {
      sub: identity.id || identity.email,
      email: identity.email,
      name: identity.name || (identity.email ? identity.email.split('@')[0] : 'User'),
      roles,
      role: isXAdmin ? 'XADMIN' : 'USER',
      is_admin: isXAdmin,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
    };

    const token = signToken(tokenPayload);

    // Set suite cookies
    const cookieOptions = {
      path: '/',
      sameSite: 'lax',
      maxAge: 86400 * 7 * 1000,
    };
    res.cookie('xid_token', token, cookieOptions);
    res.cookie('sentinel_session', token, cookieOptions);
    res.cookie('xcorp_code_session', token, cookieOptions);

    return res.json({
      token,
      user: {
        id: identity.id || identity.email,
        email: identity.email,
        name: identity.name || (identity.email ? identity.email.split('@')[0] : 'User'),
        roles,
        role: isXAdmin ? 'XADMIN' : 'USER',
        isXAdmin,
        canAccessSystem: isXAdmin,
        authenticated: true,
      },
    });
  } catch (err) {
    console.error('Portal auth login error:', err);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

app.post(['/api/auth/logout', '/api/identity/logout'], (req, res) => {
  res.clearCookie('xid_token', { path: '/' });
  res.clearCookie('sentinel_session', { path: '/' });
  res.clearCookie('xcorp_code_session', { path: '/' });
  return res.json({ ok: true, message: 'Logged out successfully' });
});

app.get(['/api/auth/me', '/api/me', '/api/portal/me'], (req, res) => {
  const user = getAccessTier(req);
  return res.json({ user });
});

app.get('/api/cluster/status', (req, res) => {
  const user = getAccessTier(req);
  const services = [
    {
      id: 'aladin-ai',
      name: 'Aladin AI Assistant & Swarms',
      port: 3080,
      status: 'healthy',
      latency: '9ms',
      uptime: '99.98%',
      protocol: 'HTTP/2 + TLS 1.3',
      route: '/api/auth, /api/chat',
      subdomainPrefix: 'aladin',
    },
    {
      id: 'sentinel-gateway',
      name: 'Sentinel Security Gateway & WAF',
      port: 8000,
      status: 'healthy',
      latency: '4ms',
      uptime: '99.99%',
      protocol: 'FastAPI + Casbin RBAC',
      route: '/api/cases, /oidc',
      subdomainPrefix: 'sentinel',
    },
    {
      id: 'xdb',
      name: 'XDB Central Data Plane',
      port: 10001,
      status: 'healthy',
      latency: '11ms',
      uptime: '99.99%',
      protocol: 'Unified REST/HTTP',
      route: '/xdb/api/query',
      subdomainPrefix: 'xdb',
    },
    {
      id: 'xllm',
      name: 'XLLM Model Inference Engine',
      port: 10003,
      status: 'healthy',
      latency: '17ms',
      uptime: '99.95%',
      protocol: 'OpenAI v1 Compatible',
      route: '/xllm/v1/chat/completions',
      subdomainPrefix: 'xllm',
    },
    {
      id: 'blitz',
      name: 'Blitz P2P Realtime Engine',
      port: 3004,
      status: 'healthy',
      latency: '2ms',
      uptime: '100.0%',
      protocol: 'WebRTC Mesh + QUIC',
      route: '/blitz/realtime',
      subdomainPrefix: 'blitz',
    },
    {
      id: 'grafana',
      name: 'Grafana Enterprise Observability',
      port: 3000,
      status: 'healthy',
      latency: '14ms',
      uptime: '99.99%',
      protocol: 'Loki + Vector NVMe Sink',
      route: '/grafana',
      subdomainPrefix: 'grafana',
    },
    {
      id: 'xid',
      name: 'XID SSO Identity Provider',
      port: 10002,
      status: 'healthy',
      latency: '5ms',
      uptime: '99.99%',
      protocol: 'OAuth2 / OIDC JWT',
      route: '/xid/identity',
      subdomainPrefix: 'xid',
    },
  ];

  return res.json({
    cluster: user.canAccessSystem
      ? 'Azure Standard_D4ds_v6 (4 vCPU / 16GB RAM)'
      : 'Xcorp Decentralized Enterprise Mesh',
    storage: user.canAccessSystem
      ? '220GB Local NVMe mounted at /data/logs (193GB Free)'
      : 'SOC 2 Type II Encrypted High-Performance Storage',
    active_domains: 4,
    ingress: 'Caddy v2.8 (Automated ACME TLS) + Cloudflare Tunnel',
    services,
  });
});

app.post('/api/chat', async (req, res) => {
  const startTime = Date.now();
  const user = getAccessTier(req);
  const { message, messages } = req.body || {};

  const history = Array.isArray(messages) && messages.length > 0
    ? messages
    : [{ role: 'user', content: message || 'Hello Aladin' }];

  let systemPrompt;
  if (!user.authenticated) {
    systemPrompt = `You are Aladin AI, the intelligent assistant and public concierge for the Xcorp Ecosystem.
You are assisting an anonymous visitor.
DIRECTIVES:
- Be friendly, welcoming, concise, and helpful.
- Freely answer questions about Xcorp, its applications (Aladin AI, XID SSO, XDB Unified Data Plane, XLLM Inference, Blitz WebRTC, XICM Incident Command, Aladin Studio), and general technology or programming questions.
- Provide clear explanations of what each tool does and how users can get started.
- SECURITY POLICY: You must NOT disclose private server credentials, host SSH keys, internal IP addresses (e.g. 172.198.139.11), private port numbers, or database passwords. If an unverified visitor explicitly asks to perform server-level administration, view private server keys, or reconfigure cluster nodes, politely inform them that administrative operations require signing in with an authorized XID account.`;
  } else if (user.isXAdmin) {
    systemPrompt = `You are Aladin AI, Lead Autonomous Intelligence for Xcorp, assisting verified administrator ${user.name} (${user.email}) [Role: XAdmin].
You have authorized access to internal cluster telemetry, Caddy reverse proxy routing across Dynu domains, multi-database XDB topology, and SOC 2 NVMe logging infrastructure.
Provide concise, sharp, high-intellect administrative guidance and operational assistance.`;
  } else {
    systemPrompt = `You are Aladin AI, assisting verified user ${user.name} (${user.email}) [Role: Standard User].
Assist the user with authorized platform features, applications, and workflows.`;
  }

  const result = await generateChatCompletion(systemPrompt, history);
  const latency_ms = Date.now() - startTime;

  return res.json({
    reply: result.text,
    model: result.model,
    authenticated: user.authenticated,
    role: user.role,
    latency_ms,
  });
});

app.use(
  express.static(path.join(__dirname, 'dist'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    },
  })
);

app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Xcorp Core Portal listening on port ${PORT}`);
});
