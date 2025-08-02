"use client"

import { useWallet } from "@/contexts/WalletProvider"
import { motion } from "framer-motion"
import { JSX } from "react"

function ConnectWalletButton(): JSX.Element {
  const { account, connectWallet, isLoading } = useWallet()

  function truncateAddress(address: string): string {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <motion.button
      onClick={connectWallet}
      disabled={isLoading || !!account}
      className="px-6 py-2 rounded-full font-semibold text-white bg-blue-600/80 backdrop-blur-sm border border-blue-500/60 shadow-lg shadow-blue-500/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      whileHover={{ scale: 1.05, boxShadow: '0px 0px 15px rgba(59, 130, 246, 0.4)' }}
      whileTap={{ scale: 0.95 }}
    >
      {isLoading
        ? 'Connecting...'
        : account
        ? truncateAddress(account)
        : 'Connect Wallet'}
    </motion.button>
  )
}

export default ConnectWalletButton
