import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useOKXWallet } from "@/hooks/useOKXWallet";
import { useGeminiAPI } from "@/hooks/useGeminiAPI";
import { useToast } from "@/hooks/use-toast";

import { WalletConnection } from "@/components/WalletConnection";
import { NetworkMetrics } from "@/components/NetworkMetrics";
import { AnomalyList } from "@/components/AnomalyList";
import { AnomalyDetails } from "@/components/AnomalyDetails";
import { ChatInterface } from "@/components/ChatInterface";
import { AgentGovernance } from "@/components/AgentGovernance";
import { HistoricalLog } from "@/components/HistoricalLog";
import { WalletBalance } from "@/components/WalletBalance";
import { AlloraPredictions } from "@/components/AlloraPredictions";
import { MarlinTEE } from "@/components/MarlinTEE";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { 
  NetworkMetrics as INetworkMetrics,
  Anomaly, 
  AgentRule, 
  HistoricalLogEntry, 
  ChatMessage, 
  RecommendedAction, 
  WebSocketMessage 
} from "@/types";

import { 
  Shield, 
  Play, 
  Pause, 
  Activity, 
  AlertTriangle,
  Menu,
  X,
  Bot,
  Send
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Dashboard() {
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  
  const queryClient = useQueryClient();
  const { wallet } = useOKXWallet();
  const { generateResponse } = useGeminiAPI();
  const { toast } = useToast();

  // Debug wallet state
  useEffect(() => {
    console.log("Dashboard wallet state:", wallet);
  }, [wallet]);

  // WebSocket connection
  const { isConnected, lastMessage, sendMessage } = useWebSocket('/ws');

  // Queries
  const { data: metrics, isLoading: metricsLoading } = useQuery<INetworkMetrics>({
    queryKey: ['/api/metrics'],
    refetchInterval: monitoringActive ? 10000 : false,
  });

  const { data: anomalies = [] } = useQuery<Anomaly[]>({
    queryKey: ['/api/anomalies'],
    refetchInterval: monitoringActive ? 5000 : false,
  });

  const { data: rules = [] } = useQuery<AgentRule[]>({
    queryKey: ['/api/rules'],
  });

  const { data: logs = [] } = useQuery<HistoricalLogEntry[]>({
    queryKey: ['/api/logs'],
    refetchInterval: 30000,
  });

  // Mutations
  const toggleMonitoringMutation = useMutation({
    mutationFn: async (active: boolean) => {
      return apiRequest('POST', '/api/monitoring/toggle', { active });
    },
    onSuccess: (_, active) => {
      setMonitoringActive(active);
      toast({
        title: active ? "Monitoring Started" : "Monitoring Paused",
        description: active 
          ? "Real-time blockchain monitoring is now active" 
          : "Monitoring has been paused",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Monitoring Toggle Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: async (rule: Partial<AgentRule>) => {
      return apiRequest('POST', '/api/rules', { 
        ...rule, 
        walletAddress: wallet.address 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rules'] });
    },
  });

  const toggleRuleMutation = useMutation({
    mutationFn: async ({ ruleId, isActive }: { ruleId: number; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/rules/${ruleId}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rules'] });
    },
  });

  const executeActionMutation = useMutation({
    mutationFn: async (action: RecommendedAction) => {
      return apiRequest('POST', '/api/actions/execute', { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
    },
  });

  // WebSocket message handling
  useEffect(() => {
    if (lastMessage) {
      handleWebSocketMessage(lastMessage);
    }
  }, [lastMessage]);

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'metrics':
        queryClient.setQueryData(['/api/metrics'], message.data);
        break;
      case 'anomaly':
        queryClient.invalidateQueries({ queryKey: ['/api/anomalies'] });
        toast({
          title: "New Anomaly Detected",
          description: message.data.description,
          variant: "destructive",
        });
        break;
      case 'log':
        queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
        break;
      case 'status':
        setMonitoringActive(message.data.active);
        break;
      default:
        break;
    }
  };

  // Event handlers
  const handleToggleMonitoring = () => {
    toggleMonitoringMutation.mutate(!monitoringActive);
  };

  const handleReviewAnomaly = (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly);
  };

  const handleCloseAnomalyDetails = () => {
    setSelectedAnomaly(null);
  };

  const handleExecuteAction = async (action: RecommendedAction) => {
    try {
      await executeActionMutation.mutateAsync(action);
      
      // Close anomaly details after successful action
      if (selectedAnomaly) {
        setSelectedAnomaly(null);
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleSendChatMessage = async (message?: string) => {
    const messageToSend = message || inputMessage;
    if (!messageToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: messageToSend,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage(""); // Clear input after sending

    try {
      const response = await generateResponse(messageToSend, {
        currentMetrics: metrics,
        anomalyCount: anomalies.length,
        chatHistory: chatMessages.slice(-5),
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: response,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      toast({
        title: "Chat Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateRule = async (rule: Partial<AgentRule>) => {
    await createRuleMutation.mutateAsync(rule);
  };

  const handleToggleRule = async (ruleId: number, isActive: boolean) => {
    await toggleRuleMutation.mutateAsync({ ruleId, isActive });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header */}
      <header className="bg-card border-b border-border px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Aptos Sentinel AI</h1>
                <p className="text-sm text-muted-foreground">Autonomous Blockchain Agent</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 ml-8">
              <div className={`w-3 h-3 rounded-full ${
                monitoringActive ? 'network-active' : 'network-paused'
              }`}></div>
              <span className="text-sm font-medium">Agent Status:</span>
              <Badge variant={monitoringActive ? "default" : "secondary"}>
                {monitoringActive ? "Active" : "Standby"}
              </Badge>
              {wallet.connected ? (
                <Button
                  onClick={handleToggleMonitoring}
                  disabled={toggleMonitoringMutation.isPending}
                  variant={monitoringActive ? "destructive" : "default"}
                  size="sm"
                  className="ml-2"
                >
                  {monitoringActive ? (
                    <>
                      <Pause className="w-4 h-4 mr-1" />
                      Pause Agent
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Activate Agent
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  disabled
                  variant="outline"
                  size="sm"
                  className="ml-2 opacity-50"
                >
                  Connect Wallet to Activate
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* WebSocket Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-accent' : 'bg-destructive'
              }`}></div>
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Network Info */}
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Network</div>
              <div className="text-sm font-medium text-foreground">Aptos Mainnet</div>
            </div>

            {/* Wallet Connection */}
            <WalletConnection />
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Column - Network Metrics & Agent Governance */}
          <div className="col-span-8 space-y-6">
            {/* Top Row - Network Metrics & Wallet Balance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <NetworkMetrics 
                    metrics={metrics || null}
                    isLoading={metricsLoading}
                  />
                </Card>
              </div>
              <div className="lg:col-span-1">
                <WalletBalance 
                  walletAddress={wallet.address}
                  walletConnected={wallet.connected}
                />
              </div>
            </div>

            {/* AI Predictions & Security Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AlloraPredictions walletConnected={wallet.connected} />
              <MarlinTEE 
                walletConnected={wallet.connected}
                walletAddress={wallet.address}
                currentBalance={0} // Will be updated with real balance data
              />
            </div>

            {/* Anomaly Details Panel */}
            {selectedAnomaly && (
              <Card className="p-6">
                <AnomalyDetails
                  anomaly={selectedAnomaly}
                  onClose={handleCloseAnomalyDetails}
                  onExecuteAction={handleExecuteAction}
                  walletConnected={wallet.connected}
                />
              </Card>
            )}

            {/* Agent Governance */}
            <Card className="p-6">
              <AgentGovernance
                rules={rules}
                onCreateRule={handleCreateRule}
                onToggleRule={handleToggleRule}
                walletConnected={wallet.connected}
              />
            </Card>

            {/* Status Cards */}
            {!wallet.connected && (
              <Card className="border-orange-500/20 bg-orange-500/10 p-4">
                <CardContent className="pt-2">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Wallet Not Connected
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Connect your Petra Wallet to enable autonomous actions and transaction signing.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Anomalies, Logs & AI Assistant */}
          <div className="col-span-4 space-y-6">
            
            {/* AI Assistant - Compact */}
            <Card className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">AI Assistant</h3>
                  <Badge variant="secondary" className="text-xs">
                    Powered by Gemini API
                  </Badge>
                </div>
              </div>
              
              {/* Compact Chat */}
              {wallet.connected ? (
                <div className="space-y-3">
                  <ScrollArea className="h-48 border rounded-lg p-3 bg-muted/20">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-4">
                        <div className="text-sm">
                          Ask me about network status, anomalies, or Aptos blockchain insights.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {chatMessages.slice(-3).map((message) => (
                          <div key={message.id} className="text-sm">
                            <div className={`p-2 rounded ${
                              message.sender === 'user' 
                                ? 'bg-primary text-primary-foreground ml-4' 
                                : 'bg-background mr-4'
                            }`}>
                              {message.message}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  
                  <div className="flex space-x-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendChatMessage(inputMessage);
                        }
                      }}
                      placeholder="Ask the AI..."
                      className="flex-1 text-sm"
                    />
                    <Button
                      onClick={() => handleSendChatMessage(inputMessage)}
                      disabled={!inputMessage.trim()}
                      size="sm"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-48 border rounded-lg p-3 bg-muted/20 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                    <div className="text-sm font-medium mb-1">Connect Wallet Required</div>
                    <div className="text-xs">Please connect your OKX wallet to use AI Assistant</div>
                  </div>
                </div>
              )}
            </Card>

            {/* Anomaly List */}
            <Card className="p-4">
              <AnomalyList 
                anomalies={anomalies} 
                onReviewAnomaly={handleReviewAnomaly}
                walletConnected={wallet.connected}
              />
            </Card>

            {/* Historical Log */}
            <Card className="p-4">
              <HistoricalLog logs={logs.slice(0, 10)} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
