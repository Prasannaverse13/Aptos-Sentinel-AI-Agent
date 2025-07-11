const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'your_api_key';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export class GeminiService {
  private async callAPI(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  async generateContent(prompt: string, context?: any): Promise<string> {
    let contextualPrompt = prompt;
    
    if (context) {
      contextualPrompt = `Context: ${JSON.stringify(context, null, 2)}\n\nUser Query: ${prompt}`;
    }

    return this.callAPI(contextualPrompt);
  }

  async generateRuleSuggestion(description: string): Promise<string> {
    const prompt = `You are an expert blockchain monitoring system. Convert this natural language rule description into a structured monitoring rule for an Aptos blockchain system:

"${description}"

Please provide a clear, technical rule specification that includes:
1. Condition/Trigger
2. Threshold values
3. Time windows
4. Recommended actions
5. Severity level

Focus on Aptos-specific metrics like TPS, gas prices (in Octas), transaction volume, and smart contract interactions. Return the response in plain text format without any markdown formatting, asterisks, or special symbols. Use simple bullet points with dashes only.`;

    return this.callAPI(prompt);
  }

  async analyzeAnomaly(anomaly: any, currentMetrics: any): Promise<string> {
    const prompt = `You are an expert Aptos blockchain analyst. Analyze this anomaly and provide insights:

Anomaly Details:
- Type: ${anomaly.type}
- Severity: ${anomaly.severity}
- Description: ${anomaly.description}
- Timestamp: ${anomaly.timestamp}

Current Network Metrics:
- TPS: ${currentMetrics.tps || 'N/A'}
- Gas Price: ${currentMetrics.avgGasPrice || 'N/A'} Octas
- Pending Transactions: ${currentMetrics.pendingTransactions || 'N/A'}
- Active Contracts: ${currentMetrics.activeContracts || 'N/A'}

Please provide:
1. Root cause analysis
2. Potential impact on the network
3. Recommended immediate actions
4. Long-term prevention strategies
5. Risk assessment

Keep the response concise and actionable.`;

    return this.callAPI(prompt);
  }

  async getChatResponse(message: string, chatHistory: any[], currentMetrics: any): Promise<string> {
    const contextPrompt = `You are an AI assistant for Aptos Sentinel AI, a comprehensive blockchain monitoring and security platform. You help users understand network metrics, analyze anomalies, and provide insights about the Aptos blockchain.

Current Network Status:
- TPS: ${currentMetrics?.tps || 'N/A'}
- Average Gas Price: ${currentMetrics?.avgGasPrice || 'N/A'} Octas
- Pending Transactions: ${currentMetrics?.pendingTransactions || 'N/A'}
- Active Smart Contracts: ${currentMetrics?.activeContracts || 'N/A'}

Recent Chat Context:
${chatHistory.slice(-3).map(msg => `${msg.sender}: ${msg.message}`).join('\n')}

User Question: ${message}

Please provide a helpful, accurate response about Aptos blockchain, network monitoring, anomaly detection, or general blockchain concepts. Be conversational but informative. Return the response in plain text format without any markdown formatting, asterisks, hashtags, or special symbols. Use simple text with line breaks for readability.`;

    return this.callAPI(contextPrompt);
  }
}

export const geminiService = new GeminiService();
