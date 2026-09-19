// initialSecurityLogs.ts — Kiberxavfsizlik / Access Log initial data

export type LogLevel = 'info' | 'warning' | 'error' | 'critical';
export type LogSource = 'access' | 'action' | 'security' | 'ddos';

export interface AccessLog {
  id: string;
  timestamp: string;
  ip: string;
  country: string;
  countryCode: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';
  path: string;
  statusCode: number;
  responseTimeMs: number;
  userAgent: string;
  userId?: string;
  userName?: string;
  bytesSent: number;
  referer?: string;
  level: LogLevel;
}

export interface ActionLog {
  id: string;
  timestamp: string;
  ip: string;
  userId: string;
  userName: string;
  role: 'admin' | 'student' | 'teacher';
  action: string;
  resource: string;
  detail: string;
  success: boolean;
  level: LogLevel;
}

export interface TrafficDataPoint {
  time: string;
  requests: number;
  bandwidth: number; // KB/s
  errors: number;
  blocked: number;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  type: 'ddos' | 'brute_force' | 'sql_injection' | 'xss' | 'suspicious_scan' | 'rate_limit' | 'geo_block' | 'bot';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  country: string;
  countryCode: string;
  description: string;
  requestCount: number;
  timeWindowSec: number;
  status: 'active' | 'blocked' | 'investigating' | 'resolved';
  aiAnalysis?: string;
}

export interface BlockedIP {
  ip: string;
  country: string;
  countryCode: string;
  reason: string;
  blockedAt: string;
  expiresAt?: string;
  requestCount: number;
  permanent: boolean;
}

// ─── Access Logs ──────────────────────────────────────────────────────────────
export const initialAccessLogs: AccessLog[] = [];

// ─── Action Logs ──────────────────────────────────────────────────────────────
export const initialActionLogs: ActionLog[] = [];

// ─── Traffic Data (Day-0 initial real-time tracking) ─────────────────────────
export const initialTrafficData: TrafficDataPoint[] = [];

// ─── Security Alerts ──────────────────────────────────────────────────────────
export const initialSecurityAlerts: SecurityAlert[] = [];

// ─── Blocked IPs ──────────────────────────────────────────────────────────────
export const initialBlockedIPs: BlockedIP[] = [];

