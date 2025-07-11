export class AlloraService {
  private baseUrl = 'https://api.allora.network/v2/allora/consumer/price';
  private apiKey = 'UP-040bfd4341124fcd962bebba'; // Thunderdome hackathon key
  
  async getPricePrediction(token: string, timeframe: '5m' | '8h'): Promise<{
    networkInference: number;
    confidenceInterval: number[];
    timestamp: string;
    topicId: number;
  }> {
    try {
      const endpoint = `${this.baseUrl}/ethereum-11155111/${token}/${timeframe}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'accept': 'application/json',
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Allora API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        networkInference: parseFloat(data.data.inference_data.network_inference_normalized),
        confidenceInterval: data.data.inference_data.confidence_interval_values_normalized || [],
        timestamp: data.data.inference_data.timestamp,
        topicId: data.data.inference_data.topic_id
      };
    } catch (error) {
      console.error('Allora prediction error:', error);
      throw error;
    }
  }

  async getMultiTokenPredictions(): Promise<{
    eth5m: any;
    eth8h: any;
    btc5m: any;
    btc8h: any;
    apt5m?: any;
  }> {
    try {
      const [eth5m, eth8h, btc5m, btc8h] = await Promise.allSettled([
        this.getPricePrediction('ETH', '5m'),
        this.getPricePrediction('ETH', '8h'),
        this.getPricePrediction('BTC', '5m'),
        this.getPricePrediction('BTC', '8h')
      ]);

      return {
        eth5m: eth5m.status === 'fulfilled' ? eth5m.value : null,
        eth8h: eth8h.status === 'fulfilled' ? eth8h.value : null,
        btc5m: btc5m.status === 'fulfilled' ? btc5m.value : null,
        btc8h: btc8h.status === 'fulfilled' ? btc8h.value : null,
        apt5m: null // APT predictions may be added in future
      };
    } catch (error) {
      console.error('Multi-token prediction error:', error);
      throw error;
    }
  }

  generatePredictionInsights(predictions: any): string {
    const insights = [];
    
    if (predictions.eth5m) {
      insights.push(`ETH 5min prediction: $${predictions.eth5m.networkInference.toFixed(2)}`);
    }
    
    if (predictions.eth8h) {
      insights.push(`ETH 8hour prediction: $${predictions.eth8h.networkInference.toFixed(2)}`);
    }
    
    if (predictions.btc5m) {
      insights.push(`BTC 5min prediction: $${predictions.btc5m.networkInference.toFixed(0)}`);
    }
    
    if (predictions.btc8h) {
      insights.push(`BTC 8hour prediction: $${predictions.btc8h.networkInference.toFixed(0)}`);
    }

    return insights.join(' | ');
  }
}

export const alloraService = new AlloraService();