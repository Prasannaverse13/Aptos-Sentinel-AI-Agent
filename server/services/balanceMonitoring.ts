// Server-side balance monitoring service
export class BalanceMonitoringService {
  private aptosNodeUrl = 'https://fullnode.mainnet.aptoslabs.com/v1';

  async getWalletBalance(address: string): Promise<{
    balance: number;
    balanceInAPT: number;
    timestamp: string;
  }> {
    try {
      const response = await fetch(`${this.aptosNodeUrl}/accounts/${address}/resource/0x1::coin::CoinStore%3C0x1::aptos_coin::AptosCoin%3E`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            balance: 0,
            balanceInAPT: 0,
            timestamp: new Date().toISOString(),
          };
        }
        throw new Error(`Failed to fetch balance: ${response.status}`);
      }

      const data = await response.json();
      const balanceOctas = parseInt(data.data.coin.value);
      const balanceAPT = balanceOctas / 100000000;

      return {
        balance: balanceOctas,
        balanceInAPT: balanceAPT,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      throw error;
    }
  }

  generateBalanceAlert(balanceAPT: number, address: string): {
    type: 'low_balance' | 'zero_balance' | 'balance_change';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    recommendations: string[];
  } | null {
    if (balanceAPT === 0) {
      return {
        type: 'zero_balance',
        severity: 'critical',
        message: `Wallet ${address.slice(0, 6)}...${address.slice(-4)} has zero APT balance. Transaction fees cannot be paid.`,
        recommendations: [
          'Purchase APT from a cryptocurrency exchange',
          'Transfer APT from another wallet',
          'Use a bridge to transfer tokens from other networks',
          'Verify you are connected to the correct wallet'
        ]
      };
    } else if (balanceAPT < 0.5) {
      return {
        type: 'low_balance',
        severity: 'high',
        message: `Wallet ${address.slice(0, 6)}...${address.slice(-4)} has very low balance: ${balanceAPT.toFixed(4)} APT. Risk of insufficient funds for transactions.`,
        recommendations: [
          'Add more APT to ensure transaction fees can be paid',
          'Monitor balance closely to avoid failed transactions',
          'Consider keeping at least 2-5 APT for regular use'
        ]
      };
    } else if (balanceAPT < 2) {
      return {
        type: 'low_balance',
        severity: 'medium',
        message: `Wallet ${address.slice(0, 6)}...${address.slice(-4)} has low balance: ${balanceAPT.toFixed(4)} APT. Consider adding more funds.`,
        recommendations: [
          'Balance is sufficient for basic transactions',
          'Consider adding more APT for peace of mind',
          'Monitor for any unusual balance changes'
        ]
      };
    }

    return null; // No alert needed for healthy balances
  }

  async checkBalanceAnomalies(address: string, previousBalance?: number): Promise<any[]> {
    try {
      const currentBalance = await this.getWalletBalance(address);
      const anomalies: any[] = [];

      // Generate balance alert if needed
      const balanceAlert = this.generateBalanceAlert(currentBalance.balanceInAPT, address);
      if (balanceAlert) {
        anomalies.push({
          type: balanceAlert.type === 'zero_balance' ? 'Zero Wallet Balance' : 'Low Wallet Balance',
          severity: balanceAlert.severity,
          description: balanceAlert.message,
          metadata: {
            walletAddress: address,
            currentBalance: currentBalance.balanceInAPT,
            balanceType: 'APT',
            recommendations: balanceAlert.recommendations
          }
        });
      }

      // Check for significant balance changes (if we have previous balance)
      if (previousBalance !== undefined && previousBalance > 0) {
        const changePercent = Math.abs((currentBalance.balanceInAPT - previousBalance) / previousBalance) * 100;
        
        if (changePercent > 50) {
          const changeType = currentBalance.balanceInAPT > previousBalance ? 'increase' : 'decrease';
          anomalies.push({
            type: 'Significant Balance Change',
            severity: changeType === 'decrease' ? 'high' : 'medium',
            description: `Wallet balance ${changeType}d by ${changePercent.toFixed(1)}% from ${previousBalance.toFixed(4)} to ${currentBalance.balanceInAPT.toFixed(4)} APT`,
            metadata: {
              walletAddress: address,
              previousBalance,
              currentBalance: currentBalance.balanceInAPT,
              changePercent,
              changeType
            }
          });
        }
      }

      return anomalies;
    } catch (error) {
      console.error('Failed to check balance anomalies:', error);
      return [];
    }
  }
}

export const balanceMonitoringService = new BalanceMonitoringService();