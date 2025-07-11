import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { aptosBalanceService } from "@/services/aptosBalance";
import { 
  Wallet, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  TrendingUp,
  Coins
} from "lucide-react";

interface WalletBalanceProps {
  walletAddress: string | null;
  walletConnected: boolean;
}

export function WalletBalance({ walletAddress, walletConnected }: WalletBalanceProps) {
  const [balance, setBalance] = useState<{
    balance: number;
    balanceInAPT: number;
    lastUpdated: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<{
    type: 'warning' | 'info' | 'success';
    title: string;
    message: string;
    actions: string[];
  } | null>(null);

  const fetchBalance = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const balanceData = await aptosBalanceService.getWalletBalance(walletAddress);
      setBalance(balanceData);
      
      const rec = aptosBalanceService.generateBalanceRecommendations(
        balanceData.balanceInAPT, 
        walletAddress
      );
      setRecommendation(rec);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletConnected && walletAddress) {
      fetchBalance();
      
      // Set up automatic balance refresh every 30 seconds
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [walletConnected, walletAddress]);

  const formatBalance = (aptBalance: number) => {
    if (aptBalance === 0) return "0.0000";
    if (aptBalance < 0.0001) return "< 0.0001";
    return aptBalance.toFixed(4);
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getBalanceColor = (aptBalance: number) => {
    if (aptBalance === 0) return "text-red-500";
    if (aptBalance < 1) return "text-orange-500";
    if (aptBalance < 10) return "text-yellow-600";
    return "text-green-500";
  };

  if (!walletConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Wallet className="w-5 h-5" />
            <span>Wallet Balance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Wallet className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Connect wallet to view balance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5" />
            <span>Wallet Balance</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchBalance}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <Alert className="border-red-500/20 bg-red-500/10">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        ) : balance ? (
          <>
            {/* Balance Display */}
            <div className="text-center py-4 space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <Coins className={`w-6 h-6 ${getBalanceColor(balance.balanceInAPT)}`} />
                <span className={`text-3xl font-bold ${getBalanceColor(balance.balanceInAPT)}`}>
                  {formatBalance(balance.balanceInAPT)}
                </span>
                <span className="text-lg text-muted-foreground">APT</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {balance.balance.toLocaleString()} Octas
              </div>
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date(balance.lastUpdated).toLocaleTimeString()}
              </div>
            </div>

            {/* Balance Status Badge */}
            <div className="text-center">
              <Badge 
                variant={
                  balance.balanceInAPT === 0 ? "destructive" :
                  balance.balanceInAPT < 1 ? "default" :
                  balance.balanceInAPT < 10 ? "secondary" : "default"
                }
                className="text-xs"
              >
                {balance.balanceInAPT === 0 ? "Empty Wallet" :
                 balance.balanceInAPT < 1 ? "Low Balance" :
                 balance.balanceInAPT < 10 ? "Moderate Balance" : "Healthy Balance"}
              </Badge>
            </div>

            {/* Wallet Address */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground font-mono">
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-6)}
              </p>
            </div>

            {/* AI Recommendations */}
            {recommendation && (
              <Alert className={`${
                recommendation.type === 'warning' ? 'border-orange-500/20 bg-orange-500/10' :
                recommendation.type === 'success' ? 'border-green-500/20 bg-green-500/10' :
                'border-blue-500/20 bg-blue-500/10'
              }`}>
                {getRecommendationIcon(recommendation.type)}
                <AlertDescription>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">
                      {recommendation.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.message}
                    </p>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-foreground">Recommendations:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {recommendation.actions.slice(0, 3).map((action, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span className="text-primary">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : loading ? (
          <div className="text-center py-6">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Fetching balance...</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}