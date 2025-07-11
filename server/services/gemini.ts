const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'your-api';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export class GeminiService {
  async generateContent(prompt: string): Promise<string> {
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
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateRuleSuggestion(description: string): Promise<string> {
    const prompt = `You are an expert blockchain monitoring system for Aptos. Convert this natural language rule description into a structured monitoring rule:

"${description}"

Please provide a clear, technical rule specification that includes:
1. Condition/Trigger (specific metrics and thresholds)
2. Time windows for evaluation
3. Recommended actions
4. Severity level

Focus on Aptos-specific metrics like TPS, gas prices (in Octas), transaction volume, and smart contract interactions. Return a well-formatted, actionable rule specification.`;

    return this.generateContent(prompt);
  }

  async analyzeAnomaly(anomaly: any, metrics: any): Promise<string> {
    const prompt = `You are an expert Aptos blockchain analyst. Analyze this anomaly:

Anomaly: ${anomaly.type} - ${anomaly.description}
Severity: ${anomaly.severity}
Current Metrics: TPS: ${metrics.tps}, Gas: ${metrics.avgGasPrice} Octas, Pending: ${metrics.pendingTransactions}

Provide:
1. Root cause analysis
2. Network impact assessment
3. Recommended actions
4. Prevention strategies

Keep response concise and actionable.`;

    return this.generateContent(prompt);
  }
}
