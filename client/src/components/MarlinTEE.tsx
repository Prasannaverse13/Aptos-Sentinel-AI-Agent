import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Cpu, CheckCircle } from "lucide-react";
import { useState } from "react";
import { marlinTEEService } from "@/services/marlin";

interface MarlinTEEProps {
  walletConnected: boolean;
  walletAddress: string | null;
  currentBalance?: number;
}

export function MarlinTEE({ walletConnected, walletAddress, currentBalance }: MarlinTEEProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [securityReport, setSecurityReport] = useState<any>(null);

  const handleSecurityAnalysis = async () => {
    if (!walletAddress || currentBalance === undefined) return;
    
    setIsProcessing(true);
    try {
      const report = await marlinTEEService.executeBalanceSecurityCheck(
        walletAddress, 
        currentBalance
      );
      setSecurityReport(report);
    } catch (error) {
      console.error('TEE security analysis failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!walletConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Marlin TEE Security
          </CardTitle>
          <CardDescription>
            Secure computation powered by Trusted Execution Environments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Lock className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Connect your wallet to access confidential security analysis
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Marlin TEE Security
        </CardTitle>
        <CardDescription>
          Confidential security analysis using Trusted Execution Environments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-green-600" />
            <span className="font-medium text-black dark:text-white">TEE Status</span>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Secure Enclave Active
          </Badge>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={handleSecurityAnalysis}
            disabled={isProcessing || !currentBalance}
            className="w-full"
            variant="outline"
          >
            {isProcessing ? (
              <>
                <Cpu className="h-4 w-4 mr-2 animate-pulse" />
                Processing in TEE...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Run Confidential Security Analysis
              </>
            )}
          </Button>
        </div>

        {securityReport && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="font-medium">Security Score</span>
              <Badge 
                variant={securityReport.securityScore >= 80 ? "default" : "destructive"}
              >
                {securityReport.securityScore}/100
              </Badge>
            </div>

            {securityReport.risks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-red-600">Detected Risks:</h4>
                <ul className="space-y-1">
                  {securityReport.risks.map((risk: string, index: number) => (
                    <li key={index} className="text-xs text-red-600 flex items-start gap-1">
                      <span className="text-red-400">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {securityReport.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-blue-600">TEE Recommendations:</h4>
                <ul className="space-y-1">
                  {securityReport.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-xs text-blue-600 flex items-start gap-1">
                      <span className="text-blue-400">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Analysis performed in secure TEE environment</span>
              {securityReport.teeProcessed && (
                <Badge variant="outline" className="text-xs">
                  TEE Verified
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Powered by Marlin Protocol's Oyster TEE infrastructure for tamper-proof security analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );
}