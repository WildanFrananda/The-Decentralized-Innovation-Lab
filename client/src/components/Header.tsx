"use client"

import { motion } from "framer-motion"
import { JSX } from "react"
import ConnectWalletButton from "./ConnectWalletButton"

function Header(): JSX.Element {
  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
          LabDecentral
        </div>
        <ConnectWalletButton />
      </nav>
    </motion.header>
  )
}

export default Header
