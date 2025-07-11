import { useState, useEffect } from "react";

declare global {
  interface Window {
    okxwallet?: {
      aptos?: {
        connect(): Promise<{ address: string; publicKey: string }>;
        disconnect(): Promise<void>;
        isConnected(): Promise<boolean>;
        account(): Promise<{ address: string; publicKey: string }>;
        signAndSubmitTransaction(transaction: any): Promise<{ hash: string }>;
        network(): Promise<{ name: string; chainId: string }>;
      };
    };
  }
}

export function useOKXWallet() {
  const [wallet, setWallet] = useState({
    connected: false,
    address: null as string | null,
    publicKey: null as string | null,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Check if OKX wallet is installed
  const getOKXWallet = () => {
    if (window.okxwallet?.aptos) {
      return window.okxwallet.aptos;
    } else {
      window.open('https://www.okx.com/web3', '_blank');
      return null;
    }
  };

  // Check if OKX wallet is installed
  const isOKXInstalled = () => {
    return !!(window.okxwallet?.aptos);
  };

  useEffect(() => {
    checkConnection();
    
    // Set up periodic connection check
    const interval = setInterval(() => {
      checkConnection();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const okxWallet = getOKXWallet();
      if (okxWallet) {
        const isConnected = await okxWallet.isConnected();
        if (isConnected) {
          const account = await okxWallet.account();
          setWallet({
            connected: true,
            address: account.address,
            publicKey: account.publicKey,
          });
        }
      }
    } catch (error) {
      console.error("Failed to check OKX wallet connection:", error);
    }
  };

  const connect = async () => {
    setIsLoading(true);
    try {
      console.log("Attempting to connect to OKX wallet...");
      
      const okxWallet = getOKXWallet();
      if (!okxWallet) {
        throw new Error("OKX Wallet is not installed. Please install it from the Chrome Web Store.");
      }

      console.log("Calling OKX wallet.connect()...");
      const response = await okxWallet.connect();
      console.log("OKX Connect response:", response);
      
      console.log("Calling OKX wallet.account()...");
      const account = await okxWallet.account();
      console.log("OKX Account response:", account);
      
      setWallet({
        connected: true,
        address: response.address,
        publicKey: response.publicKey,
      });

      console.log("Successfully connected to OKX wallet:", { address: response.address });
      
      // Force a re-check to ensure state is consistent
      setTimeout(() => {
        checkConnection();
      }, 100);
      
      return response;
    } catch (error: any) {
      console.error("Failed to connect to OKX Wallet:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    setIsLoading(true);
    try {
      const okxWallet = getOKXWallet();
      if (okxWallet) {
        await okxWallet.disconnect();
      }
      setWallet({
        connected: false,
        address: null,
        publicKey: null,
      });
      console.log("Successfully disconnected from OKX wallet");
    } catch (error: any) {
      console.error("Failed to disconnect from OKX Wallet:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signAndSubmitTransaction = async (transaction: any) => {
    try {
      const okxWallet = getOKXWallet();
      if (!okxWallet || !wallet.connected) {
        throw new Error("Wallet not connected");
      }

      const result = await okxWallet.signAndSubmitTransaction(transaction);
      return result;
    } catch (error: any) {
      console.error("Transaction failed:", error);
      throw error;
    }
  };

  const getNetwork = async () => {
    try {
      const okxWallet = getOKXWallet();
      if (!okxWallet) {
        throw new Error("OKX Wallet is not installed");
      }

      const network = await okxWallet.network();
      return network;
    } catch (error: any) {
      console.error("Failed to get network:", error);
      throw error;
    }
  };

  return {
    wallet,
    connect,
    disconnect,
    signAndSubmitTransaction,
    getNetwork,
    isLoading,
    isOKXInstalled,
  };
}