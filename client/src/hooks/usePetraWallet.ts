import { useState, useEffect } from "react";

declare global {
  interface Window {
    aptos?: {
      connect(): Promise<{ address: string; publicKey: string }>;
      disconnect(): Promise<void>;
      isConnected(): Promise<boolean>;
      account(): Promise<{ address: string; publicKey: string }>;
      signAndSubmitTransaction(transaction: any): Promise<{ hash: string }>;
      network(): Promise<{ name: string; chainId: string }>;
    };
  }
}

export function usePetraWallet() {
  const [wallet, setWallet] = useState({
    connected: false,
    address: null as string | null,
    publicKey: null as string | null,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Check if Petra is installed - following exact pattern provided
  const getAptosWallet = () => {
    if ('aptos' in window) {
      return window.aptos;
    } else {
      window.open('https://petra.app/', `_blank`);
      return null;
    }
  };

  // Check if Petra is installed
  const isPetraInstalled = () => {
    return 'aptos' in window;
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const aptosWallet = getAptosWallet();
      if (aptosWallet) {
        const isConnected = await aptosWallet.isConnected();
        if (isConnected) {
          const account = await aptosWallet.account();
          setWallet({
            connected: true,
            address: account.address,
            publicKey: account.publicKey,
          });
        }
      }
    } catch (error) {
      console.error("Failed to check wallet connection:", error);
    }
  };

  const connect = async () => {
    setIsLoading(true);
    try {
      console.log("Attempting to connect to Petra wallet...");
      
      const aptosWallet = getAptosWallet();
      if (!aptosWallet) {
        throw new Error("Petra Wallet is not installed. Please install it from the Chrome Web Store.");
      }

      // Following the exact pattern: call wallet.connect() then wallet.account()
      console.log("Calling wallet.connect()...");
      const response = await aptosWallet.connect();
      console.log("Connect response:", response);
      
      console.log("Calling wallet.account()...");
      const account = await aptosWallet.account();
      console.log("Account response:", account);
      
      setWallet({
        connected: true,
        address: response.address,
        publicKey: response.publicKey,
      });

      console.log("Successfully connected to Petra wallet:", { address: response.address });
      return response;
    } catch (error: any) {
      console.error("Failed to connect to Petra Wallet:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    setIsLoading(true);
    try {
      const aptosWallet = getAptosWallet();
      if (aptosWallet) {
        await aptosWallet.disconnect();
      }
      setWallet({
        connected: false,
        address: null,
        publicKey: null,
      });
      console.log("Successfully disconnected from Petra wallet");
    } catch (error: any) {
      console.error("Failed to disconnect from Petra Wallet:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signAndSubmitTransaction = async (transaction: any) => {
    try {
      const aptosWallet = getAptosWallet();
      if (!aptosWallet || !wallet.connected) {
        throw new Error("Wallet not connected");
      }

      const result = await aptosWallet.signAndSubmitTransaction(transaction);
      return result;
    } catch (error: any) {
      console.error("Transaction failed:", error);
      throw error;
    }
  };

  const getNetwork = async () => {
    try {
      const aptosWallet = getAptosWallet();
      if (!aptosWallet) {
        throw new Error("Petra Wallet is not installed");
      }

      const network = await aptosWallet.network();
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
    isPetraInstalled,
  };
}