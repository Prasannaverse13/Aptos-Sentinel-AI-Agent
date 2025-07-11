import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HistoricalLogEntry } from "@/types";
import { 
  History, 
  Info, 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  Clock,
  Eye,
  Trash2
} from "lucide-react";

interface HistoricalLogProps {
  logs: HistoricalLogEntry[];
  onClearLogs?: () => void;
}

export function HistoricalLog({ logs, onClearLogs }: HistoricalLogProps) {
  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-accent" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-accent/20 bg-accent/5';
      case 'warning':
        return 'border-warning/20 bg-warning/5';
      case 'error':
        return 'border-destructive/20 bg-destructive/5';
      case 'info':
      default:
        return 'border-primary/20 bg-primary/5';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - logTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getFullTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>Historical Log</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {logs.length} entries
            </Badge>
            {logs.length > 0 && onClearLogs && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearLogs}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] px-4">
          {logs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No historical data</p>
              <p className="text-xs opacity-70">Activity logs will appear here</p>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border transition-all hover:shadow-sm ${getLogColor(log.type)} animate-slide-in`}
                  title={getFullTimestamp(log.timestamp)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground font-medium mb-1">
                      {log.message}
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </div>
                      {log.metadata && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            // Could open a modal with detailed metadata
                            console.log('Log metadata:', log.metadata);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Details
                        </Button>
                      )}
                    </div>
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
