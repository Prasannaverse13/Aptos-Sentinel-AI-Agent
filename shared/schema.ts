import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const anomalies = pgTable("anomalies", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  severity: text("severity").notNull(),
  description: text("description").notNull(),
  metadata: json("metadata"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: text("status").notNull().default("new"),
  walletAddress: text("wallet_address"),
});

export const agentRules = pgTable("agent_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  condition: text("condition").notNull(),
  action: text("action").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  walletAddress: text("wallet_address"),
});

export const historicalLogs = pgTable("historical_logs", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: json("metadata"),
  walletAddress: text("wallet_address"),
});

export const networkMetrics = pgTable("network_metrics", {
  id: serial("id").primaryKey(),
  tps: integer("tps").notNull(),
  avgGasPrice: integer("avg_gas_price").notNull(),
  pendingTransactions: integer("pending_transactions").notNull(),
  activeContracts: integer("active_contracts").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAnomalySchema = createInsertSchema(anomalies).pick({
  type: true,
  severity: true,
  description: true,
  metadata: true,
  walletAddress: true,
});

export const insertAgentRuleSchema = createInsertSchema(agentRules).pick({
  name: true,
  description: true,
  condition: true,
  action: true,
  walletAddress: true,
});

export const insertHistoricalLogSchema = createInsertSchema(historicalLogs).pick({
  message: true,
  type: true,
  metadata: true,
  walletAddress: true,
});

export const insertNetworkMetricsSchema = createInsertSchema(networkMetrics).pick({
  tps: true,
  avgGasPrice: true,
  pendingTransactions: true,
  activeContracts: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAnomaly = z.infer<typeof insertAnomalySchema>;
export type Anomaly = typeof anomalies.$inferSelect;
export type InsertAgentRule = z.infer<typeof insertAgentRuleSchema>;
export type AgentRule = typeof agentRules.$inferSelect;
export type InsertHistoricalLog = z.infer<typeof insertHistoricalLogSchema>;
export type HistoricalLog = typeof historicalLogs.$inferSelect;
export type InsertNetworkMetrics = z.infer<typeof insertNetworkMetricsSchema>;
export type NetworkMetrics = typeof networkMetrics.$inferSelect;

// API response types
export type AptosNodeResponse = {
  chain_id: number;
  epoch: string;
  ledger_version: string;
  oldest_ledger_version: string;
  ledger_timestamp: string;
  node_role: string;
  oldest_block_height: string;
  block_height: string;
  git_hash: string;
};

export type GeminiResponse = {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
};

export type BigQueryMetrics = {
  tps: number;
  avgGasPrice: number;
  pendingTransactions: number;
  activeContracts: number;
  timestamp: string;
};

export type PetraWalletResponse = {
  address: string;
  publicKey: string;
};

export type WebSocketMessage = {
  type: 'metrics' | 'anomaly' | 'log' | 'status';
  data: any;
  timestamp: string;
};
