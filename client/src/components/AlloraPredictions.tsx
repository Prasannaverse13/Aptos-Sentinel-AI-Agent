import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { alloraService } from "@/services/allora";

interface AlloraPredictionsProps {
  walletConnected: boolean;
}

export function AlloraPredictions({ walletConnected }: AlloraPredictionsProps) {
  const { data: predictions, isLoading, error } = useQuery({
    queryKey: ['/api/allora/predictions'],
    queryFn: () => alloraService.getMultiTokenPredictions(),
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: walletConnected
  });

  if (!walletConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Allora AI Predictions
          </CardTitle>
          <CardDescription>
            Connect your wallet to access AI-powered price predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Wallet connection required for predictive oracle access
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Allora AI Predictions
          </CardTitle>
          <CardDescription>
            Fetching AI-powered predictions from Allora Network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading predictions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Allora AI Predictions
          </CardTitle>
          <CardDescription>
            Unable to fetch predictions from Allora Network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">
            Error connecting to Allora predictive oracle. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (price: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(price);
  };

  const getTrendIcon = (prediction: any) => {
    if (!prediction) return <Activity className="h-4 w-4" />;
    
    // Simplified trend analysis - in real app would compare with current price
    const price = prediction.networkInference;
    return price > 2000 ? 
      <TrendingUp className="h-4 w-4 text-green-600" /> : 
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Allora AI Predictions
        </CardTitle>
        <CardDescription>
          Real-time AI-powered price predictions from Allora Network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {predictions?.eth5m && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border">
            <div className="flex items-center gap-2">
              {getTrendIcon(predictions.eth5m)}
              <span className="font-medium text-black dark:text-white">ETH (5min)</span>
              <Badge variant="secondary">Topic {predictions.eth5m.topicId}</Badge>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-black dark:text-white">
                {formatPrice(predictions.eth5m.networkInference)}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(predictions.eth5m.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {predictions?.eth8h && (
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border">
            <div className="flex items-center gap-2">
              {getTrendIcon(predictions.eth8h)}
              <span className="font-medium text-black dark:text-white">ETH (8hour)</span>
              <Badge variant="secondary">Topic {predictions.eth8h.topicId}</Badge>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-black dark:text-white">
                {formatPrice(predictions.eth8h.networkInference)}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(predictions.eth8h.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {predictions?.btc5m && (
          <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border">
            <div className="flex items-center gap-2">
              {getTrendIcon(predictions.btc5m)}
              <span className="font-medium text-black dark:text-white">BTC (5min)</span>
              <Badge variant="secondary">Topic {predictions.btc5m.topicId}</Badge>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-black dark:text-white">
                {formatPrice(predictions.btc5m.networkInference, 0)}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(predictions.btc5m.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {predictions?.btc8h && (
          <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border">
            <div className="flex items-center gap-2">
              {getTrendIcon(predictions.btc8h)}
              <span className="font-medium text-black dark:text-white">BTC (8hour)</span>
              <Badge variant="secondary">Topic {predictions.btc8h.topicId}</Badge>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-black dark:text-white">
                {formatPrice(predictions.btc8h.networkInference, 0)}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(predictions.btc8h.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Predictions powered by Allora Network's decentralized AI marketplace
          </p>
        </div>
      </CardContent>
    </Card>
  );
}