import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AgentRule } from "@/types";
import { Settings, Sparkles, CheckCircle, XCircle, Plus, Activity } from "lucide-react";
import { useState } from "react";
import { useGeminiAPI } from "@/hooks/useGeminiAPI";
import { useToast } from "@/hooks/use-toast";

interface AgentGovernanceProps {
  rules: AgentRule[];
  onCreateRule: (rule: Partial<AgentRule>) => Promise<void>;
  onToggleRule: (ruleId: number, isActive: boolean) => Promise<void>;
  walletConnected: boolean;
}

export function AgentGovernance({ rules, onCreateRule, onToggleRule, walletConnected }: AgentGovernanceProps) {
  const [ruleDescription, setRuleDescription] = useState("");
  const [suggestedRule, setSuggestedRule] = useState<string | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const { loading, generateRuleSuggestion } = useGeminiAPI();
  const { toast } = useToast();

  const handleGenerateRule = async () => {
    if (!ruleDescription.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe the monitoring rule you want to create.",
        variant: "destructive",
      });
      return;
    }

    try {
      const suggestion = await generateRuleSuggestion(ruleDescription.trim());
      setSuggestedRule(suggestion);
      setShowSuggestion(true);
    } catch (error: any) {
      toast({
        title: "Rule Generation Failed",
        description: error.message || "Failed to generate rule suggestion",
        variant: "destructive",
      });
    }
  };

  const handleApplyRule = async () => {
    if (!suggestedRule) return;

    try {
      await onCreateRule({
        name: `Custom Rule ${Date.now()}`,
        description: ruleDescription,
        condition: suggestedRule,
        action: "alert", // Default action
      });
      
      setRuleDescription("");
      setSuggestedRule(null);
      setShowSuggestion(false);
      
      toast({
        title: "Rule Created",
        description: "Successfully created new monitoring rule",
      });
    } catch (error: any) {
      toast({
        title: "Rule Creation Failed",
        description: error.message || "Failed to create rule",
        variant: "destructive",
      });
    }
  };

  const handleToggleRule = async (rule: AgentRule) => {
    try {
      await onToggleRule(rule.id, !rule.isActive);
      toast({
        title: rule.isActive ? "Rule Disabled" : "Rule Enabled",
        description: `${rule.name} has been ${rule.isActive ? 'disabled' : 'enabled'}`,
      });
    } catch (error: any) {
      toast({
        title: "Rule Toggle Failed",
        description: error.message || "Failed to toggle rule",
        variant: "destructive",
      });
    }
  };

  const formatRuleDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Agent Governance</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Current Agent Rules</span>
              <Badge variant="secondary" className="ml-auto">
                {rules.filter(rule => rule.isActive).length} active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[400px]">
              {rules.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No rules configured</p>
                  <p className="text-xs opacity-70">Create your first monitoring rule</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <Card 
                      key={rule.id}
                      className={`border transition-all ${
                        rule.isActive 
                          ? 'border-accent/30 bg-accent/5' 
                          : 'border-muted bg-muted/20'
                      }`}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              {rule.isActive ? (
                                <CheckCircle className="w-4 h-4 text-accent" />
                              ) : (
                                <XCircle className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="text-sm font-medium text-foreground">
                                {rule.name}
                              </span>
                              <Badge 
                                variant={rule.isActive ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {rule.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {rule.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Created: {formatRuleDate(rule.createdAt)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleRule(rule)}
                            className="ml-2"
                          >
                            {rule.isActive ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Rule Suggestion */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Suggest New Rule</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {walletConnected ? (
              <div className="space-y-3">
                <Textarea
                  value={ruleDescription}
                  onChange={(e) => setRuleDescription(e.target.value)}
                  placeholder="Describe a new monitoring rule in natural language... 

Example: 'Alert me if gas fees stay above 1000 Octas for more than 5 minutes' or 'Monitor when transaction throughput drops below 500 TPS'"
                  className="min-h-[100px] bg-background border-border focus:border-primary resize-none"
                  disabled={loading}
                />
                
                <Button
                  onClick={handleGenerateRule}
                  disabled={loading || !ruleDescription.trim()}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {loading ? "Generating..." : "Generate Rule Suggestion"}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <Settings className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">Connect Wallet Required</h4>
                  <p className="text-sm text-muted-foreground">Please connect your OKX wallet to create and manage agent rules</p>
                </div>
              </div>
            )}

            {/* Suggested Rule Display */}
            {showSuggestion && suggestedRule && (
              <Alert className="border-primary/20 bg-primary/5 animate-slide-in">
                <Sparkles className="w-4 h-4 text-primary" />
                <AlertDescription>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">
                        Proposed Rule:
                      </h4>
                      <div className="text-sm text-foreground bg-background/60 rounded p-3 border">
                        <pre className="whitespace-pre-wrap font-mono text-xs">
                          {suggestedRule}
                        </pre>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleApplyRule}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Apply Rule
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowSuggestion(false)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3">
              <p className="font-medium mb-1">Pro tip:</p>
              <p>Be specific about conditions, thresholds, and time windows for better rule generation. 
              Use Aptos-specific terms like 'Octas' for gas prices and 'TPS' for transaction throughput.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
