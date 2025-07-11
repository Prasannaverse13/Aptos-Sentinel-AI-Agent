export class BigQueryService {
  private baseUrl = '/api/bigquery';

  async getNetworkMetrics(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/metrics`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('BigQuery metrics fetch failed:', error);
      throw error;
    }
  }

  async getHistoricalData(timeRange: string = '1h'): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/historical?range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch historical data: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('BigQuery historical data fetch failed:', error);
      throw error;
    }
  }

  async getTransactionData(limit: number = 100): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transaction data: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('BigQuery transaction data fetch failed:', error);
      throw error;
    }
  }

  async getContractActivity(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/contracts`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch contract activity: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('BigQuery contract activity fetch failed:', error);
      throw error;
    }
  }
}

export const bigQueryService = new BigQueryService();
