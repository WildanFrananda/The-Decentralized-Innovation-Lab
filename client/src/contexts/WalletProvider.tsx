"use client"

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  JSX,
} from "react"
import { ethers } from "ethers"

type WalletContextType = {
  account: string | null
  connectWallet: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on: (eventName: string, listener: (...args: unknown[]) => void) => void
  removeListener: (
    eventName: string,
    listener: (...args: unknown[]) => void
  ) => void
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

export function WalletProvider({
  children,
}: {
  children: ReactNode
}): JSX.Element {
  const [account, setAccount] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  async function connectWallet(): Promise<void> {
    if (!window.ethereum) {
      setError("Please install MetaMask to use this application.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const provider = new ethers.BrowserProvider(
        window.ethereum as ethers.Eip1193Provider
      )
      const account = (await provider.send(
        "eth_requestAccounts",
        []
      )) as string

      if (account.length > 0) {
        setAccount(account[0])
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to connect to wallet.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    function handleAccountsChanged(accounts: unknown): void {
      if (
        Array.isArray(accounts) &&
        accounts.length > 0 &&
        typeof accounts[0] === "string"
      ) {
        setAccount(accounts[0])
      } else {
        setAccount(null)
      }
    }

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountChanged", handleAccountsChanged)
      }
    }
  }, [])

  const value = { account, connectWallet, isLoading, error }

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  )
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext)

  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }

  return context
}
