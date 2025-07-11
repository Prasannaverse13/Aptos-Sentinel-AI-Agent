export interface NetworkMetrics {
  tps: number;
  avgGasPrice: number;
  pendingTransactions: number;
  activeContracts: number;
  timestamp?: string;
}

export interface Anomaly {
  id: number;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  status: 'new' | 'reviewed' | 'resolved';
  metadata?: any;
}

export interface AgentRule {
  id: number;
  name: string;
  description: string;
  condition: string;
  action: string;
  isActive: boolean;
  createdAt: string;
}

export interface HistoricalLogEntry {
  id: number;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  metadata?: any;
}

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  publicKey: string | null;
}

export interface AppState {
  wallet: WalletState;
  monitoring: {
    active: boolean;
    lastUpdate: string | null;
  };
  metrics: NetworkMetrics | null;
  anomalies: Anomaly[];
  rules: AgentRule[];
  logs: HistoricalLogEntry[];
  chat: ChatMessage[];
}

export interface WebSocketMessage {
  type: 'metrics' | 'anomaly' | 'log' | 'status' | 'rules';
  data: any;
  timestamp: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  type: 'monitor' | 'pause' | 'alert' | 'transaction';
  critical: boolean;
  requiresWallet: boolean;
}
