export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
}

export interface HealthStatus {
  status: 'ok' | 'degraded';
  uptime: number;
  database: 'connected' | 'disconnected';
  redis: 'connected' | 'disconnected';
  timestamp: string;
}
