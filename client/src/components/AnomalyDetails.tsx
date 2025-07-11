import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Anomaly, RecommendedAction } from "@/types";
import { X, Shield, Pause, AlertTriangle, Eye, Zap, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AnomalyDetailsProps {
  anomaly: Anomaly | null;
  onClose: () => void;
  onExecuteAction: (action: RecommendedAction) => Promise<void>;
  walletConnected: boolean;
}

export function AnomalyDetails({ 
  anomaly, 
  onClose, 
  onExecuteAction,
  walletConnected 
}: AnomalyDetailsProps) {
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const { toast } = useToast();

  if (!anomaly) return null;

  const generateRecommendedActions = (anomaly: Anomaly): RecommendedAction[] => {
    const baseActions: RecommendedAction[] = [];

    switch (anomaly.type) {
      case 'Gas Price Spike':
        baseActions.push(
          {
            id: 'adjust-gas-limits',
            title: 'Adjust Gas Limits',
            description: 'Temporarily increase gas limits for critical transactions',
            type: 'transaction',
            critical: true,
            requiresWallet: true
          },
          {
            id: 'pause-non-critical',
            title: 'Pause Non-Critical Operations',
            description: 'Temporarily pause non-essential smart contract operations',
            type: 'pause',
            critical: true,
            requiresWallet: true
          }
        );
        break;
      
      case 'High TPS Alert':
        baseActions.push(
          {
            id: 'monitor-load',
            title: 'Monitor Network Load',
            description: 'Increase monitoring frequency for network metrics',
            type: 'monitor',
            critical: false,
            requiresWallet: false
          },
          {
            id: 'scale-infrastructure',
            title: 'Scale Infrastructure',
            description: 'Recommend scaling infrastructure to handle increased load',
            type: 'alert',
            critical: false,
            requiresWallet: false
          }
        );
        break;
      
      case 'Network Congestion':
        baseActions.push(
          {
            id: 'increase-fees',
            title: 'Increase Transaction Fees',
            description: 'Temporarily increase transaction fees to prioritize processing',
            type: 'transaction',
            critical: false,
            requiresWallet: true
          },
          {
            id: 'delay-transactions',
            title: 'Delay Non-Critical Transactions',
            description: 'Queue non-critical transactions for later processing',
            type: 'pause',
            critical: false,
            requiresWallet: false
          }
        );
        break;
      
      case 'Suspicious Contract':
        baseActions.push(
          {
            id: 'pause-contract',
            title: 'Pause Affected Contract',
            description: 'Immediately pause the suspicious smart contract',
            type: 'pause',
            critical: true,
            requiresWallet: true
          },
          {
            id: 'alert-admin',
            title: 'Send Alert to Admin',
            description: 'Notify system administrators of suspicious activity',
            type: 'alert',
            critical: true,
            requiresWallet: false
          }
        );
        break;
      
      default:
        baseActions.push(
          {
            id: 'log-review',
            title: 'Log for Manual Review',
            description: 'Log the anomaly for manual investigation',
            type: 'monitor',
            critical: false,
            requiresWallet: false
          }
        );
    }

    // Always add monitoring option
    baseActions.push({
      id: 'monitor-only',
      title: 'Monitor Only',
      description: 'Continue monitoring without taking automated action',
      type: 'monitor',
      critical: false,
      requiresWallet: false
    });

    return baseActions;
  };

  const recommendedActions = generateRecommendedActions(anomaly);

  const handleExecuteAction = async (action: RecommendedAction) => {
    if (action.requiresWallet && !walletConnected) {
      toast({
        title: "Wallet Required",
        description: "This action requires a connected wallet for transaction signing.",
        variant: "destructive",
      });
      return;
    }

    setExecutingAction(action.id);
    try {
      await onExecuteAction(action);
      toast({
        title: "Action Executed",
        description: `Successfully executed: ${action.title}`,
      });
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to execute action",
        variant: "destructive",
      });
    } finally {
      setExecutingAction(null);
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

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'pause':
        return <Pause className="w-4 h-4" />;
      case 'transaction':
        return <Zap className="w-4 h-4" />;
      case 'alert':
        return <AlertTriangle className="w-4 h-4" />;
      case 'monitor':
        return <Eye className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <Card className="w-full animate-slide-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-foreground flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>Anomaly Analysis</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Detection Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Detection Details</h3>
            <Card className="bg-muted/50">
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Type:</span>
                  <span className="text-sm font-semibold text-foreground">{anomaly.type}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Severity:</span>
                  <Badge className={getSeverityColor(anomaly.severity)}>
                    {anomaly.severity}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  <Badge variant="outline">{anomaly.status}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Detected:</span>
                  <span className="text-sm text-foreground">
                    {new Date(anomaly.timestamp).toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Description:</span>
                  <p className="text-sm text-foreground">{anomaly.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Recommended Actions</h3>
            <div className="space-y-3">
              {recommendedActions.map((action) => (
                <Card 
                  key={action.id}
                  className={`cursor-pointer transition-all hover:border-primary/50 ${
                    action.critical ? 'border-destructive/30 bg-destructive/5' : ''
                  }`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getActionIcon(action.type)}
                          <span className="text-sm font-medium text-foreground">
                            {action.title}
                          </span>
                          {action.critical && (
                            <Badge variant="destructive" className="text-xs">
                              Critical
                            </Badge>
                          )}
                          {action.requiresWallet && (
                            <Badge variant="outline" className="text-xs">
                              Requires Wallet
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          {action.description}
                        </p>
                        <Button
                          size="sm"
                          variant={action.critical ? "destructive" : "default"}
                          className="w-full"
                          disabled={
                            executingAction === action.id || 
                            (action.requiresWallet && !walletConnected)
                          }
                          onClick={() => handleExecuteAction(action)}
                        >
                          {executingAction === action.id ? (
                            "Executing..."
                          ) : (
                            `Execute ${action.title}`
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Wallet Connection Alert */}
        {recommendedActions.some(action => action.requiresWallet) && !walletConnected && (
          <Alert className="border-warning/20 bg-warning/10">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <AlertDescription className="text-warning-foreground">
              Some actions require wallet connection for transaction signing. 
              Please connect your Petra Wallet to enable these features.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
