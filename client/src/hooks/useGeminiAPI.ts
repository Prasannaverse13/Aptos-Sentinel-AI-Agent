import { useState } from 'react';
import { geminiService } from '@/services/gemini';

export function useGeminiAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = async (prompt: string, context?: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await geminiService.generateContent(prompt, context);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate AI response';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateRuleSuggestion = async (description: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await geminiService.generateRuleSuggestion(description);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate rule suggestion';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const analyzeAnomaly = async (anomaly: any, metrics: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await geminiService.analyzeAnomaly(anomaly, metrics);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to analyze anomaly';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateResponse,
    generateRuleSuggestion,
    analyzeAnomaly,
  };
}
