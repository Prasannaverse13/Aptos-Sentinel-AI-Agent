import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOKXWallet } from "@/hooks/useOKXWallet";
import { Wallet, WalletIcon, LogOut, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function WalletConnection() {
  const { wallet, isLoading, connect, disconnect, isOKXInstalled } = useOKXWallet();
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      if (!isOKXInstalled()) {
        toast({
          title: "OKX Wallet Not Found",
          description: "Please install OKX Wallet from the Chrome Web Store",
          variant: "destructive",
        });
        return;
      }

      await connect();
      toast({
        title: "Wallet Connected",
        description: `Connected to ${wallet.address?.slice(0, 6)}...${wallet.address?.slice(-4)}`,
      });
    } catch (err: any) {
      toast({
        title: "Connection Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from OKX Wallet",
      });
    } catch (err: any) {
      toast({
        title: "Disconnection Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (wallet.connected) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-card px-3 py-2 rounded-lg border">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
          <WalletIcon className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">Connected</span>
          <Badge variant="secondary" className="text-xs font-mono">
            {formatAddress(wallet.address!)}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          disabled={isLoading}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        onClick={handleConnect}
        disabled={isLoading}
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isLoading ? "Connecting..." : "Connect OKX Wallet"}
      </Button>
    </div>
  );
}
