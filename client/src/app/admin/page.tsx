"use client"

import AdminDashboard from "@/components/AdminDashboard"
import { OWNER_ADDRESS } from "@/constants"
import { useWallet } from "@/contexts/WalletProvider"
import { JSX } from "react"

function AdminPage(): JSX.Element {
  const { account } = useWallet()

  if (!account) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-2xl font-bold">Please Connect Your Wallet</h1>
      </main>
    )
  }

  if (account.toLocaleLowerCase() !== OWNER_ADDRESS.toLocaleLowerCase()) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="mt-4 text-gray-400">This page is for the owner only.</p>
      </main>
    )
  }

  return <AdminDashboard />
}

export default AdminPage
