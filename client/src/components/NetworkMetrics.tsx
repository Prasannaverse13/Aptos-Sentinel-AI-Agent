import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NetworkMetrics as INetworkMetrics } from "@/types";
import { TrendingUp, TrendingDown, Minus, Activity, Fuel, Clock, FileCode } from "lucide-react";

interface NetworkMetricsProps {
  metrics: INetworkMetrics | null;
  isLoading: boolean;
}

export function NetworkMetrics({ metrics, isLoading }: NetworkMetricsProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getChangeIndicator = (value: number, baseline: number) => {
    const change = ((value - baseline) / baseline) * 100;
    const isPositive = change > 0;
    const isNeutral = Math.abs(change) < 5;

    if (isNeutral) {
      return {
        icon: <Minus className="w-3 h-3" />,
        text: "Normal",
        className: "text-muted-foreground",
      };
    }

    return {
      icon: isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />,
      text: `${isPositive ? '+' : ''}${change.toFixed(1)}%`,
      className: isPositive ? "text-accent" : "text-destructive",
    };
  };

  const metricCards = [
    {
      title: "Transactions Per Second",
      value: metrics?.tps || 0,
      baseline: 800,
      icon: <Activity className="w-5 h-5 text-primary" />,
      suffix: "",
    },
    {
      title: "Average Gas Price",
      value: metrics?.avgGasPrice || 0,
      baseline: 100,
      icon: <Fuel className="w-5 h-5 text-primary" />,
      suffix: " Octas",
    },
    {
      title: "Pending Transactions",
      value: metrics?.pendingTransactions || 0,
      baseline: 3000,
      icon: <Clock className="w-5 h-5 text-primary" />,
      suffix: "",
    },
    {
      title: "Active Smart Contracts",
      value: metrics?.activeContracts || 0,
      baseline: 60000,
      icon: <FileCode className="w-5 h-5 text-primary" />,
      suffix: "",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Real-time Network Metrics</h2>
        {metrics?.timestamp && (
          <Badge variant="outline" className="text-xs">
            Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => {
          const changeInfo = getChangeIndicator(card.value, card.baseline);
          
          return (
            <Card key={index} className="bg-card border border-border hover:box-glow transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {isLoading ? (
                    <div className="h-8 bg-muted animate-pulse rounded"></div>
                  ) : (
                    `${formatNumber(card.value)}${card.suffix}`
                  )}
                </div>
                <div className={`flex items-center text-sm mt-2 ${changeInfo.className}`}>
                  {changeInfo.icon}
                  <span className="ml-1">{changeInfo.text}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!metrics && !isLoading && (
        <Card className="border-destructive/20">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No network data available</p>
              <p className="text-sm">Start monitoring to see real-time metrics</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
