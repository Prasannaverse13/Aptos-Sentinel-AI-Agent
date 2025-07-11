import { NetworkMetrics, Anomaly } from '@shared/schema';

export class AnomalyDetectionService {
  private thresholds = {
    tps: { min: 300, max: 1500 },
    gasPrice: { min: 20, max: 250 },
    pendingTransactions: { min: 500, max: 8000 },
    contractsGrowth: { maxPercentage: 10 } // Max 10% growth per hour
  };

  private previousMetrics: NetworkMetrics | null = null;

  detectAnomalies(currentMetrics: NetworkMetrics): Partial<Anomaly>[] {
    const anomalies: Partial<Anomaly>[] = [];

    // TPS Anomalies
    if (currentMetrics.tps < this.thresholds.tps.min) {
      anomalies.push({
        type: 'Low TPS Alert',
        severity: 'medium',
        description: `Transaction throughput dropped to ${currentMetrics.tps} TPS, below normal threshold of ${this.thresholds.tps.min}`,
        metadata: { metric: 'tps', value: currentMetrics.tps, threshold: this.thresholds.tps.min }
      });
    } else if (currentMetrics.tps > this.thresholds.tps.max) {
      anomalies.push({
        type: 'High TPS Alert',
        severity: 'low',
        description: `Transaction throughput spiked to ${currentMetrics.tps} TPS, above normal threshold of ${this.thresholds.tps.max}`,
        metadata: { metric: 'tps', value: currentMetrics.tps, threshold: this.thresholds.tps.max }
      });
    }

    // Gas Price Anomalies
    if (currentMetrics.avgGasPrice > this.thresholds.gasPrice.max) {
      const severity = currentMetrics.avgGasPrice > this.thresholds.gasPrice.max * 2 ? 'critical' : 'high';
      anomalies.push({
        type: 'Gas Price Spike',
        severity,
        description: `Average gas price reached ${currentMetrics.avgGasPrice} Octas, significantly above normal threshold of ${this.thresholds.gasPrice.max} Octas`,
        metadata: { metric: 'gasPrice', value: currentMetrics.avgGasPrice, threshold: this.thresholds.gasPrice.max }
      });
    }

    // Pending Transactions Anomalies
    if (currentMetrics.pendingTransactions > this.thresholds.pendingTransactions.max) {
      anomalies.push({
        type: 'Network Congestion',
        severity: 'medium',
        description: `Pending transactions reached ${currentMetrics.pendingTransactions.toLocaleString()}, indicating network congestion`,
        metadata: { metric: 'pendingTransactions', value: currentMetrics.pendingTransactions, threshold: this.thresholds.pendingTransactions.max }
      });
    }

    // Contract Growth Anomalies
    if (this.previousMetrics) {
      const contractGrowth = ((currentMetrics.activeContracts - this.previousMetrics.activeContracts) / this.previousMetrics.activeContracts) * 100;
      if (contractGrowth > this.thresholds.contractsGrowth.maxPercentage) {
        anomalies.push({
          type: 'Unusual Contract Activity',
          severity: 'medium',
          description: `Active contracts increased by ${contractGrowth.toFixed(1)}% in recent period, potentially indicating unusual deployment activity`,
          metadata: { metric: 'contractGrowth', value: contractGrowth, threshold: this.thresholds.contractsGrowth.maxPercentage }
        });
      }
    }

    // Simulated Suspicious Contract Detection (would use actual pattern analysis in production)
    if (Math.random() < 0.05) { // 5% chance for demo purposes
      anomalies.push({
        type: 'Suspicious Contract',
        severity: 'critical',
        description: `Detected unusual transaction patterns in smart contract 0x${Math.random().toString(16).substring(2, 8)}... that may indicate malicious behavior`,
        metadata: { 
          metric: 'pattern_analysis', 
          contractAddress: `0x${Math.random().toString(16).substring(2, 66)}`,
          suspiciousActivity: 'rapid_execution_pattern'
        }
      });
    }

    this.previousMetrics = currentMetrics;
    return anomalies;
  }

  // Allora Labs integration simulation
  async checkAlloraAnomalies(metrics: NetworkMetrics): Promise<Partial<Anomaly>[]> {
    try {
      // This would integrate with actual Allora Labs API
      // For now, simulate predictive anomaly detection
      const anomalies: Partial<Anomaly>[] = [];
      
      // Simulate Allora's predictive model detecting future issues
      if (Math.random() < 0.1) { // 10% chance
        anomalies.push({
          type: 'Predicted Network Stress',
          severity: 'medium',
          description: 'Allora predictive model indicates potential network stress in the next 15 minutes based on current transaction patterns',
          metadata: { 
            source: 'allora_prediction', 
            confidence: (Math.random() * 20 + 80).toFixed(1) + '%',
            timeframe: '15_minutes'
          }
        });
      }

      return anomalies;
    } catch (error) {
      console.error('Allora anomaly detection failed:', error);
      return [];
    }
  }

  // Update thresholds based on historical data
  updateThresholds(historicalData: NetworkMetrics[]) {
    if (historicalData.length < 10) return;

    // Calculate dynamic thresholds based on historical data
    const tpsValues = historicalData.map(d => d.tps);
    const gasPriceValues = historicalData.map(d => d.avgGasPrice);
    const pendingValues = historicalData.map(d => d.pendingTransactions);

    const tpsAvg = tpsValues.reduce((a, b) => a + b, 0) / tpsValues.length;
    const gasPriceAvg = gasPriceValues.reduce((a, b) => a + b, 0) / gasPriceValues.length;
    const pendingAvg = pendingValues.reduce((a, b) => a + b, 0) / pendingValues.length;

    // Update thresholds to be more adaptive
    this.thresholds.tps.min = Math.max(200, tpsAvg * 0.6);
    this.thresholds.tps.max = tpsAvg * 1.8;
    this.thresholds.gasPrice.max = Math.max(200, gasPriceAvg * 2);
    this.thresholds.pendingTransactions.max = Math.max(5000, pendingAvg * 1.5);

    console.log('Updated anomaly detection thresholds:', this.thresholds);
  }
}
