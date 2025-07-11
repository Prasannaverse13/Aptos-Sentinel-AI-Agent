import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Anomaly } from "@/types";
import { AlertTriangle, AlertCircle, Info, Zap, Eye, Clock } from "lucide-react";

interface AnomalyListProps {
  anomalies: Anomaly[];
  onReviewAnomaly: (anomaly: Anomaly) => void;
  walletConnected: boolean;
}

export function AnomalyList({ anomalies, onReviewAnomaly, walletConnected }: AnomalyListProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Zap className="w-4 h-4 text-destructive" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'low':
        return <Info className="w-4 h-4 text-accent" />;
      default:
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive text-destructive-foreground';
      case 'high':
        return 'bg-warning text-warning-foreground';
      case 'medium':
        return 'bg-warning/70 text-warning-foreground';
      case 'low':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-destructive text-destructive-foreground';
      case 'reviewed':
        return 'bg-warning text-warning-foreground';
      case 'resolved':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const anomalyTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - anomalyTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Recent Anomalies
          </CardTitle>
          <Badge 
            variant={anomalies.length > 0 ? "destructive" : "secondary"}
            className="text-xs"
          >
            {anomalies.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-4">
          {!walletConnected ? (
            <div className="text-center text-muted-foreground py-8">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
              <p className="text-sm font-medium">Connect Wallet Required</p>
              <p className="text-xs opacity-70">Please connect your OKX wallet to view anomalies</p>
            </div>
          ) : anomalies.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No anomalies detected</p>
              <p className="text-xs opacity-70">System monitoring is active</p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {anomalies.map((anomaly) => (
                <div
                  key={anomaly.id}
                  className="p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer animate-slide-in"
                  onClick={() => onReviewAnomaly(anomaly)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1">
                      {getSeverityIcon(anomaly.severity)}
                      <span className="text-sm font-medium text-foreground truncate">
                        {anomaly.type}
                      </span>
                      <div className="flex items-center space-x-1 ml-auto">
                        <Badge 
                          className={`text-xs ${getSeverityColor(anomaly.severity)}`}
                        >
                          {anomaly.severity}
                        </Badge>
                        <Badge 
                          className={`text-xs ${getStatusColor(anomaly.status)}`}
                        >
                          {anomaly.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {anomaly.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(anomaly.timestamp)}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs bg-primary/10 hover:bg-primary/20 border-primary/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReviewAnomaly(anomaly);
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
