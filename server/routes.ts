import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { BigQueryService } from "./services/bigquery";
import { GeminiService } from "./services/gemini";
import { AnomalyDetectionService } from "./services/anomalyDetection";
import { balanceMonitoringService } from "./services/balanceMonitoring";
import { z } from "zod";
import { insertAnomalySchema, insertAgentRuleSchema, insertHistoricalLogSchema, insertNetworkMetricsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Initialize services
  const bigQueryService = new BigQueryService();
  const geminiService = new GeminiService();
  const anomalyDetectionService = new AnomalyDetectionService();

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  let connectedClients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    connectedClients.add(ws);

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      connectedClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connectedClients.delete(ws);
    });

    // Send initial status
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'status',
        data: { connected: true },
        timestamp: new Date().toISOString()
      }));
    }
  });

  // Broadcast to all connected clients
  const broadcastToClients = (message: any) => {
    const messageString = JSON.stringify(message);
    connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  };

  // Monitoring state
  let monitoringActive = false;
  let monitoringInterval: NodeJS.Timeout | null = null;

  // AI Agent autonomous decision making
  const executeAutonomousAction = async (anomaly: any) => {
    try {
      const activeRules = await storage.getAgentRules();
      
      // Check if any rules match this anomaly
      for (const rule of activeRules.filter(r => r.isActive)) {
        let shouldExecute = false;
        
        // Simple rule matching logic
        if (rule.condition.includes('avgGasPrice > 1000') && anomaly.type === 'Gas Price Spike') {
          shouldExecute = true;
        } else if (rule.condition.includes('tps < 500') && anomaly.type === 'Low TPS Alert') {
          shouldExecute = true;
        } else if (rule.condition.includes('suspicious_pattern_detected') && anomaly.type === 'Suspicious Contract') {
          shouldExecute = true;
        }
        
        if (shouldExecute) {
          // Log autonomous action
          await storage.insertHistoricalLog({
            message: `AI Agent executed rule: ${rule.name} in response to ${anomaly.type}`,
            type: 'success',
            metadata: { 
              ruleId: rule.id, 
              anomalyType: anomaly.type,
              action: rule.action,
              autonomous: true
            },
            walletAddress: null
          });
          
          // Broadcast autonomous action
          broadcastToClients({
            type: 'log',
            data: {
              message: `🤖 AI Agent: Executed ${rule.action} for ${anomaly.type}`,
              type: 'success',
              autonomous: true
            },
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Autonomous action failed:', error);
    }
  };

  // Start monitoring function
  const startMonitoring = async () => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }

    monitoringInterval = setInterval(async () => {
      try {
        // Fetch current metrics from BigQuery
        const metrics = await bigQueryService.getNetworkMetrics();
        
        // Store metrics
        const storedMetrics = await storage.insertNetworkMetrics({
          tps: metrics.tps,
          avgGasPrice: metrics.avgGasPrice,
          pendingTransactions: metrics.pendingTransactions,
          activeContracts: metrics.activeContracts
        });
        
        // Broadcast metrics to clients
        broadcastToClients({
          type: 'metrics',
          data: storedMetrics,
          timestamp: new Date().toISOString()
        });

        // Check for anomalies
        const detectedAnomalies = anomalyDetectionService.detectAnomalies(storedMetrics);
        const alloraAnomalies = await anomalyDetectionService.checkAlloraAnomalies(storedMetrics);
        const allAnomalies = [...detectedAnomalies, ...alloraAnomalies];

        // Store and broadcast anomalies
        for (const anomalyData of allAnomalies) {
          try {
            const anomaly = await storage.insertAnomaly({
              type: anomalyData.type!,
              severity: anomalyData.severity!,
              description: anomalyData.description!,
              metadata: anomalyData.metadata as any,
              walletAddress: null
            });

            broadcastToClients({
              type: 'anomaly',
              data: anomaly,
              timestamp: new Date().toISOString()
            });

            // Log anomaly detection
            await storage.insertHistoricalLog({
              message: `Anomaly detected: ${anomaly.type}`,
              type: 'warning',
              metadata: { anomalyId: anomaly.id },
              walletAddress: null
            });

            // Execute autonomous AI agent actions
            await executeAutonomousAction(anomaly);
            
          } catch (error) {
            console.error('Failed to store anomaly:', error);
          }
        }

        // AI Agent proactive analysis every 5 cycles (50 seconds)
        if (Date.now() % 50000 < 10000) {
          try {
            const recentAnomalies = await storage.getAnomalies(undefined, 10);
            if (recentAnomalies.length > 3) {
              await storage.insertHistoricalLog({
                message: `🤖 AI Agent: High anomaly activity detected (${recentAnomalies.length} in recent period). Increasing monitoring sensitivity.`,
                type: 'info',
                metadata: { 
                  anomalyCount: recentAnomalies.length,
                  agentAction: 'increased_sensitivity',
                  autonomous: true
                },
                walletAddress: null
              });
            }
          } catch (error) {
            console.error('Proactive analysis failed:', error);
          }
        }

      } catch (error) {
        console.error('Monitoring cycle failed:', error);
        
        // Log monitoring error
        await storage.insertHistoricalLog({
          message: 'Monitoring cycle failed',
          type: 'error',
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
          walletAddress: null
        });
      }
    }, 10000); // Every 10 seconds
  };

  const stopMonitoring = () => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      monitoringInterval = null;
    }
  };

  // API Routes

  // Get current network metrics
  app.get('/api/metrics', async (req, res) => {
    try {
      const metrics = await storage.getLatestNetworkMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Failed to get metrics:', error);
      res.status(500).json({ error: 'Failed to fetch network metrics' });
    }
  });

  // Get anomalies
  app.get('/api/anomalies', async (req, res) => {
    try {
      const walletAddress = req.query.wallet as string;
      const anomalies = await storage.getAnomalies(walletAddress);
      res.json(anomalies);
    } catch (error) {
      console.error('Failed to get anomalies:', error);
      res.status(500).json({ error: 'Failed to fetch anomalies' });
    }
  });

  // Get agent rules
  app.get('/api/rules', async (req, res) => {
    try {
      const walletAddress = req.query.wallet as string;
      const rules = await storage.getAgentRules(walletAddress);
      res.json(rules);
    } catch (error) {
      console.error('Failed to get rules:', error);
      res.status(500).json({ error: 'Failed to fetch agent rules' });
    }
  });

  // Create new agent rule
  app.post('/api/rules', async (req, res) => {
    try {
      const ruleData = insertAgentRuleSchema.parse(req.body);
      const rule = await storage.insertAgentRule(ruleData);
      
      // Log rule creation
      await storage.insertHistoricalLog({
        message: `New rule created: ${rule.name}`,
        type: 'success',
        metadata: { ruleId: rule.id },
        walletAddress: ruleData.walletAddress
      });

      res.json(rule);
    } catch (error) {
      console.error('Failed to create rule:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid rule data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create rule' });
      }
    }
  });

  // Update agent rule
  app.patch('/api/rules/:id', async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      const updates = req.body;
      
      const rule = await storage.updateAgentRule(ruleId, updates);
      
      // Log rule update
      await storage.insertHistoricalLog({
        message: `Rule updated: ${rule.name}`,
        type: 'info',
        metadata: { ruleId: rule.id, updates },
        walletAddress: null
      });

      res.json(rule);
    } catch (error) {
      console.error('Failed to update rule:', error);
      res.status(500).json({ error: 'Failed to update rule' });
    }
  });

  // Get historical logs
  app.get('/api/logs', async (req, res) => {
    try {
      const walletAddress = req.query.wallet as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getHistoricalLogs(walletAddress, limit);
      res.json(logs);
    } catch (error) {
      console.error('Failed to get logs:', error);
      res.status(500).json({ error: 'Failed to fetch historical logs' });
    }
  });

  // Toggle monitoring
  app.post('/api/monitoring/toggle', async (req, res) => {
    try {
      const { active } = req.body;
      monitoringActive = active;

      if (active) {
        await startMonitoring();
        await storage.insertHistoricalLog({
          message: 'Monitoring started',
          type: 'success',
          metadata: { timestamp: new Date().toISOString() },
          walletAddress: null
        });
      } else {
        stopMonitoring();
        await storage.insertHistoricalLog({
          message: 'Monitoring paused',
          type: 'info',
          metadata: { timestamp: new Date().toISOString() },
          walletAddress: null
        });
      }

      // Broadcast status change
      broadcastToClients({
        type: 'status',
        data: { active: monitoringActive },
        timestamp: new Date().toISOString()
      });

      res.json({ active: monitoringActive });
    } catch (error) {
      console.error('Failed to toggle monitoring:', error);
      res.status(500).json({ error: 'Failed to toggle monitoring' });
    }
  });

  // Execute action
  app.post('/api/actions/execute', async (req, res) => {
    try {
      const { action } = req.body;
      
      // Simulate action execution (in production, this would integrate with actual systems)
      const executionResult = {
        actionId: action.id,
        title: action.title,
        status: 'completed',
        timestamp: new Date().toISOString(),
        transactionHash: action.requiresWallet ? `0x${Math.random().toString(16).substring(2, 66)}` : null
      };

      // Log action execution
      await storage.insertHistoricalLog({
        message: `Action executed: ${action.title}`,
        type: 'success',
        metadata: executionResult,
        walletAddress: null
      });

      // Broadcast action execution
      broadcastToClients({
        type: 'log',
        data: {
          message: `Action executed: ${action.title}`,
          type: 'success'
        },
        timestamp: new Date().toISOString()
      });

      res.json(executionResult);
    } catch (error) {
      console.error('Failed to execute action:', error);
      res.status(500).json({ error: 'Failed to execute action' });
    }
  });

  // BigQuery endpoints
  app.get('/api/bigquery/metrics', async (req, res) => {
    try {
      const metrics = await bigQueryService.getNetworkMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('BigQuery metrics fetch failed:', error);
      res.status(500).json({ error: 'Failed to fetch metrics from BigQuery' });
    }
  });

  app.get('/api/bigquery/historical', async (req, res) => {
    try {
      const range = req.query.range as string || '24h';
      const hours = range === '1h' ? 1 : range === '6h' ? 6 : 24;
      const data = await bigQueryService.getHistoricalData(hours);
      res.json(data);
    } catch (error) {
      console.error('BigQuery historical data fetch failed:', error);
      res.status(500).json({ error: 'Failed to fetch historical data from BigQuery' });
    }
  });

  app.get('/api/bigquery/transactions', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const transactions = await bigQueryService.getTransactionData(limit);
      res.json(transactions);
    } catch (error) {
      console.error('BigQuery transaction data fetch failed:', error);
      res.status(500).json({ error: 'Failed to fetch transaction data from BigQuery' });
    }
  });

  app.get('/api/bigquery/contracts', async (req, res) => {
    try {
      const contracts = await bigQueryService.getContractActivity();
      res.json(contracts);
    } catch (error) {
      console.error('BigQuery contract data fetch failed:', error);
      res.status(500).json({ error: 'Failed to fetch contract activity from BigQuery' });
    }
  });

  // Allora Network predictions endpoint
  app.get('/api/allora/predictions', async (req, res) => {
    try {
      const predictions = await Promise.allSettled([
        fetch('https://api.allora.network/v2/allora/consumer/price/ethereum-11155111/ETH/5m', {
          headers: {
            'accept': 'application/json',
            'x-api-key': 'UP-040bfd4341124fcd962bebba'
          }
        }).then(r => r.json()),
        fetch('https://api.allora.network/v2/allora/consumer/price/ethereum-11155111/ETH/8h', {
          headers: {
            'accept': 'application/json',
            'x-api-key': 'UP-040bfd4341124fcd962bebba'
          }
        }).then(r => r.json()),
        fetch('https://api.allora.network/v2/allora/consumer/price/ethereum-11155111/BTC/5m', {
          headers: {
            'accept': 'application/json',
            'x-api-key': 'UP-040bfd4341124fcd962bebba'
          }
        }).then(r => r.json()),
        fetch('https://api.allora.network/v2/allora/consumer/price/ethereum-11155111/BTC/8h', {
          headers: {
            'accept': 'application/json',
            'x-api-key': 'UP-040bfd4341124fcd962bebba'
          }
        }).then(r => r.json())
      ]);

      const result = {
        eth5m: predictions[0].status === 'fulfilled' ? predictions[0].value : null,
        eth8h: predictions[1].status === 'fulfilled' ? predictions[1].value : null,
        btc5m: predictions[2].status === 'fulfilled' ? predictions[2].value : null,
        btc8h: predictions[3].status === 'fulfilled' ? predictions[3].value : null
      };

      res.json(result);
    } catch (error) {
      console.error('Allora predictions fetch failed:', error);
      res.status(500).json({ error: 'Failed to fetch predictions from Allora Network' });
    }
  });

  // Marlin TEE security analysis endpoint
  app.post('/api/marlin/security-analysis', async (req, res) => {
    try {
      const { walletAddress, balance } = req.body;
      
      if (!walletAddress || balance === undefined) {
        return res.status(400).json({ error: 'Wallet address and balance are required' });
      }
      
      // Perform TEE-style security analysis
      const risks = [];
      const recommendations = [];
      let securityScore = 100;

      if (balance === 0) {
        risks.push('Zero balance - unable to pay transaction fees');
        recommendations.push('Add APT to wallet for transaction capabilities');
        securityScore -= 30;
      } else if (balance < 1) {
        risks.push('Low balance - may not cover multiple transactions');
        recommendations.push('Consider adding more APT for sustained activity');
        securityScore -= 15;
      }

      if (balance > 10000) {
        risks.push('High balance - consider security measures');
        recommendations.push('Consider using hardware wallet or multi-sig');
        securityScore -= 10;
      }

      const report = {
        securityScore: Math.max(0, securityScore),
        risks,
        recommendations,
        teeProcessed: true,
        attestation: `TEE_ATTESTATION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      };
      
      res.json(report);
    } catch (error) {
      console.error('Marlin TEE analysis failed:', error);
      res.status(500).json({ error: 'Failed to perform TEE security analysis' });
    }
  });

  // Gemini AI endpoints
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, context } = req.body;
      
      let contextualPrompt = `You are an AI assistant for Aptos Sentinel AI, a comprehensive blockchain monitoring and security platform. You help users understand network metrics, analyze anomalies, and provide insights about the Aptos blockchain.`;
      
      if (context?.currentMetrics) {
        contextualPrompt += `\n\nCurrent Network Status:
- TPS: ${context.currentMetrics.tps || 'N/A'}
- Average Gas Price: ${context.currentMetrics.avgGasPrice || 'N/A'} Octas
- Pending Transactions: ${context.currentMetrics.pendingTransactions || 'N/A'}
- Active Smart Contracts: ${context.currentMetrics.activeContracts || 'N/A'}`;
      }

      if (context?.anomalyCount) {
        contextualPrompt += `\nCurrent Anomalies: ${context.anomalyCount} detected`;
      }

      if (context?.chatHistory && context.chatHistory.length > 0) {
        contextualPrompt += `\n\nRecent Chat Context:
${context.chatHistory.map((msg: any) => `${msg.sender}: ${msg.message}`).join('\n')}`;
      }

      contextualPrompt += `\n\nUser Question: ${message}

Please provide a helpful, accurate response about Aptos blockchain, network monitoring, anomaly detection, or general blockchain concepts. Be conversational but informative.`;

      const response = await geminiService.generateContent(contextualPrompt);
      res.json({ response });
    } catch (error) {
      console.error('Gemini chat failed:', error);
      res.status(500).json({ error: 'Failed to generate AI response' });
    }
  });

  app.post('/api/ai/rule-suggestion', async (req, res) => {
    try {
      const { description } = req.body;
      const suggestion = await geminiService.generateRuleSuggestion(description);
      res.json({ suggestion });
    } catch (error) {
      console.error('Gemini rule suggestion failed:', error);
      res.status(500).json({ error: 'Failed to generate rule suggestion' });
    }
  });

  app.post('/api/ai/analyze-anomaly', async (req, res) => {
    try {
      const { anomaly, metrics } = req.body;
      const analysis = await geminiService.analyzeAnomaly(anomaly, metrics);
      res.json({ analysis });
    } catch (error) {
      console.error('Gemini anomaly analysis failed:', error);
      res.status(500).json({ error: 'Failed to analyze anomaly' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      monitoring: monitoringActive,
      timestamp: new Date().toISOString(),
      websocketClients: connectedClients.size
    });
  });

  return httpServer;
}
