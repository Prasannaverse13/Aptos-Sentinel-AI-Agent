// Service to fetch real Aptos wallet balance from blockchain
export class AptosBalanceService {
  private aptosNodeUrl = 'https://fullnode.mainnet.aptoslabs.com/v1';

  async getWalletBalance(address: string): Promise<{
    balance: number;
    balanceInAPT: number;
    lastUpdated: string;
  }> {
    try {
      // Get account resources to find the APT coin balance
      const response = await fetch(`${this.aptosNodeUrl}/accounts/${address}/resource/0x1::coin::CoinStore%3C0x1::aptos_coin::AptosCoin%3E`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Account doesn't exist or has no APT balance
          return {
            balance: 0,
            balanceInAPT: 0,
            lastUpdated: new Date().toISOString(),
          };
        }
        throw new Error(`Failed to fetch balance: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const balanceOctas = parseInt(data.data.coin.value);
      const balanceAPT = balanceOctas / 100000000; // Convert from Octas to APT (1 APT = 100,000,000 Octas)

      return {
        balance: balanceOctas,
        balanceInAPT: balanceAPT,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      throw error;
    }
  }

  async getAccountInfo(address: string): Promise<{
    exists: boolean;
    sequenceNumber: string;
    authenticationKey: string;
  }> {
    try {
      const response = await fetch(`${this.aptosNodeUrl}/accounts/${address}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            exists: false,
            sequenceNumber: '0',
            authenticationKey: '',
          };
        }
        throw new Error(`Failed to fetch account info: ${response.status}`);
      }

      const data = await response.json();
      return {
        exists: true,
        sequenceNumber: data.sequence_number,
        authenticationKey: data.authentication_key,
      };
    } catch (error) {
      console.error('Failed to fetch account info:', error);
      throw error;
    }
  }

  generateBalanceRecommendations(balanceAPT: number, address: string): {
    type: 'warning' | 'info' | 'success';
    title: string;
    message: string;
    actions: string[];
  } {
    if (balanceAPT === 0) {
      return {
        type: 'warning',
        title: 'Zero Balance Detected',
        message: 'Your wallet has no APT balance. You need APT tokens to pay for transaction fees on the Aptos network.',
        actions: [
          'Purchase APT from a cryptocurrency exchange (Binance, Coinbase, etc.)',
          'Transfer APT from another wallet you own',
          'Use a bridge to transfer tokens from other networks',
          'Check if you have APT on a different Aptos address',
          'Ensure you\'re connected to the correct wallet'
        ]
      };
    } else if (balanceAPT < 1) {
      return {
        type: 'warning',
        title: 'Low Balance Warning',
        message: `Your balance of ${balanceAPT.toFixed(4)} APT is quite low. Consider adding more APT for transaction fees.`,
        actions: [
          'Add more APT to ensure you can pay transaction fees',
          'Monitor your balance closely to avoid failed transactions',
          'Set up balance alerts to notify you when balance gets low',
          'Consider keeping at least 5-10 APT for regular transactions'
        ]
      };
    } else if (balanceAPT < 10) {
      return {
        type: 'info',
        title: 'Moderate Balance',
        message: `You have ${balanceAPT.toFixed(4)} APT. This should be sufficient for transaction fees.`,
        actions: [
          'Your balance is adequate for regular transactions',
          'Consider setting up balance monitoring rules',
          'Monitor for any unusual balance changes',
          'Keep track of your transaction history'
        ]
      };
    } else {
      return {
        type: 'success',
        title: 'Healthy Balance',
        message: `Excellent! You have ${balanceAPT.toFixed(4)} APT. Your wallet is well-funded.`,
        actions: [
          'Your balance is healthy for all types of transactions',
          'Consider setting up monitoring rules for large balance changes',
          'Monitor for any suspicious activity on your account',
          'Keep your wallet secure with proper backup practices',
          'Consider staking some APT to earn rewards if you\'re not actively trading'
        ]
      };
    }
  }
}

export const aptosBalanceService = new AptosBalanceService();