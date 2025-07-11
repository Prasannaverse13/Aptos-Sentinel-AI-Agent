import { 
  users, 
  anomalies,
  agentRules,
  historicalLogs,
  networkMetrics,
  type User, 
  type InsertUser,
  type Anomaly,
  type InsertAnomaly,
  type AgentRule,
  type InsertAgentRule,
  type HistoricalLog,
  type InsertHistoricalLog,
  type NetworkMetrics,
  type InsertNetworkMetrics
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Network metrics methods
  insertNetworkMetrics(metrics: InsertNetworkMetrics): Promise<NetworkMetrics>;
  getLatestNetworkMetrics(): Promise<NetworkMetrics | null>;
  getNetworkMetricsHistory(limit?: number): Promise<NetworkMetrics[]>;

  // Anomaly methods
  insertAnomaly(anomaly: InsertAnomaly): Promise<Anomaly>;
  getAnomalies(walletAddress?: string, limit?: number): Promise<Anomaly[]>;
  getAnomalyById(id: number): Promise<Anomaly | undefined>;
  updateAnomalyStatus(id: number, status: string): Promise<Anomaly>;

  // Agent rule methods
  insertAgentRule(rule: InsertAgentRule): Promise<AgentRule>;
  getAgentRules(walletAddress?: string): Promise<AgentRule[]>;
  getAgentRuleById(id: number): Promise<AgentRule | undefined>;
  updateAgentRule(id: number, updates: Partial<AgentRule>): Promise<AgentRule>;
  deleteAgentRule(id: number): Promise<void>;

  // Historical log methods
  insertHistoricalLog(log: InsertHistoricalLog): Promise<HistoricalLog>;
  getHistoricalLogs(walletAddress?: string, limit?: number): Promise<HistoricalLog[]>;
  clearHistoricalLogs(walletAddress?: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private anomaliesMap: Map<number, Anomaly>;
  private agentRulesMap: Map<number, AgentRule>;
  private historicalLogsMap: Map<number, HistoricalLog>;
  private networkMetricsMap: Map<number, NetworkMetrics>;
  
  private currentUserId: number;
  private currentAnomalyId: number;
  private currentRuleId: number;
  private currentLogId: number;
  private currentMetricsId: number;

  constructor() {
    this.users = new Map();
    this.anomaliesMap = new Map();
    this.agentRulesMap = new Map();
    this.historicalLogsMap = new Map();
    this.networkMetricsMap = new Map();
    
    this.currentUserId = 1;
    this.currentAnomalyId = 1;
    this.currentRuleId = 1;
    this.currentLogId = 1;
    this.currentMetricsId = 1;

    // Initialize with default rules
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    const defaultRules: InsertAgentRule[] = [
      {
        name: "Gas Price Alert",
        description: "Alert when gas price exceeds 1000 Octas for more than 5 minutes",
        condition: "avgGasPrice > 1000 AND duration > 300",
        action: "alert",
        walletAddress: null
      },
      {
        name: "TPS Monitoring",
        description: "Monitor when transaction throughput drops below 500 TPS",
        condition: "tps < 500",
        action: "alert",
        walletAddress: null
      },
      {
        name: "Contract Security",
        description: "Auto-pause contracts with suspicious activity patterns",
        condition: "suspicious_pattern_detected = true",
        action: "pause_contract",
        walletAddress: null
      }
    ];

    defaultRules.forEach(rule => {
      this.insertAgentRule(rule);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Network metrics methods
  async insertNetworkMetrics(metricsData: InsertNetworkMetrics): Promise<NetworkMetrics> {
    const id = this.currentMetricsId++;
    const metrics: NetworkMetrics = {
      ...metricsData,
      id,
      timestamp: new Date()
    };
    this.networkMetricsMap.set(id, metrics);
    return metrics;
  }

  async getLatestNetworkMetrics(): Promise<NetworkMetrics | null> {
    const metricsArray = Array.from(this.networkMetricsMap.values());
    if (metricsArray.length === 0) return null;
    
    return metricsArray.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    );
  }

  async getNetworkMetricsHistory(limit: number = 100): Promise<NetworkMetrics[]> {
    const metricsArray = Array.from(this.networkMetricsMap.values());
    return metricsArray
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Anomaly methods
  async insertAnomaly(anomalyData: InsertAnomaly): Promise<Anomaly> {
    const id = this.currentAnomalyId++;
    const anomaly: Anomaly = {
      ...anomalyData,
      id,
      timestamp: new Date(),
      status: 'new',
      metadata: anomalyData.metadata || null,
      walletAddress: anomalyData.walletAddress || null
    };
    this.anomaliesMap.set(id, anomaly);
    return anomaly;
  }

  async getAnomalies(walletAddress?: string, limit: number = 50): Promise<Anomaly[]> {
    const anomaliesArray = Array.from(this.anomaliesMap.values());
    let filtered = anomaliesArray;
    
    if (walletAddress) {
      filtered = anomaliesArray.filter(anomaly => 
        anomaly.walletAddress === walletAddress || anomaly.walletAddress === null
      );
    }
    
    return filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getAnomalyById(id: number): Promise<Anomaly | undefined> {
    return this.anomaliesMap.get(id);
  }

  async updateAnomalyStatus(id: number, status: string): Promise<Anomaly> {
    const anomaly = this.anomaliesMap.get(id);
    if (!anomaly) {
      throw new Error(`Anomaly with id ${id} not found`);
    }
    
    const updatedAnomaly = { ...anomaly, status };
    this.anomaliesMap.set(id, updatedAnomaly);
    return updatedAnomaly;
  }

  // Agent rule methods
  async insertAgentRule(ruleData: InsertAgentRule): Promise<AgentRule> {
    const id = this.currentRuleId++;
    const rule: AgentRule = {
      ...ruleData,
      id,
      isActive: true,
      createdAt: new Date(),
      walletAddress: ruleData.walletAddress || null
    };
    this.agentRulesMap.set(id, rule);
    return rule;
  }

  async getAgentRules(walletAddress?: string): Promise<AgentRule[]> {
    const rulesArray = Array.from(this.agentRulesMap.values());
    
    if (walletAddress) {
      return rulesArray.filter(rule => 
        rule.walletAddress === walletAddress || rule.walletAddress === null
      );
    }
    
    return rulesArray.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAgentRuleById(id: number): Promise<AgentRule | undefined> {
    return this.agentRulesMap.get(id);
  }

  async updateAgentRule(id: number, updates: Partial<AgentRule>): Promise<AgentRule> {
    const rule = this.agentRulesMap.get(id);
    if (!rule) {
      throw new Error(`Agent rule with id ${id} not found`);
    }
    
    const updatedRule = { ...rule, ...updates };
    this.agentRulesMap.set(id, updatedRule);
    return updatedRule;
  }

  async deleteAgentRule(id: number): Promise<void> {
    if (!this.agentRulesMap.has(id)) {
      throw new Error(`Agent rule with id ${id} not found`);
    }
    this.agentRulesMap.delete(id);
  }

  // Historical log methods
  async insertHistoricalLog(logData: InsertHistoricalLog): Promise<HistoricalLog> {
    const id = this.currentLogId++;
    const log: HistoricalLog = {
      ...logData,
      id,
      timestamp: new Date(),
      metadata: logData.metadata || null,
      walletAddress: logData.walletAddress || null
    };
    this.historicalLogsMap.set(id, log);
    return log;
  }

  async getHistoricalLogs(walletAddress?: string, limit: number = 100): Promise<HistoricalLog[]> {
    const logsArray = Array.from(this.historicalLogsMap.values());
    let filtered = logsArray;
    
    if (walletAddress) {
      filtered = logsArray.filter(log => 
        log.walletAddress === walletAddress || log.walletAddress === null
      );
    }
    
    return filtered
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async clearHistoricalLogs(walletAddress?: string): Promise<void> {
    if (walletAddress) {
      const logsToDelete = Array.from(this.historicalLogsMap.entries())
        .filter(([_, log]) => log.walletAddress === walletAddress)
        .map(([id]) => id);
      
      logsToDelete.forEach(id => this.historicalLogsMap.delete(id));
    } else {
      this.historicalLogsMap.clear();
    }
  }
}

export const storage = new MemStorage();
