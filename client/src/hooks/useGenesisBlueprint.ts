"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import {
  GENESIS_BLUEPRINT_ABI,
  GENESIS_BLUEPRINT_CONTRACT_ADDRESS,
} from "@/constants"
import { useWallet } from "@/contexts/WalletProvider"

type GenesisBlueprintContract = ethers.Contract & {
  safeMint: (
    to: string,
    uri: string
  ) => Promise<ethers.ContractTransactionResponse>
}

export function useGenesisBlueprint() {
  const { account } = useWallet()
  const [contract, setContract] = useState<GenesisBlueprintContract | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)
  const [isMinting, setIsMinting] = useState<boolean>(false)

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contractInstance = new ethers.Contract(
        GENESIS_BLUEPRINT_CONTRACT_ADDRESS,
        Array.isArray(GENESIS_BLUEPRINT_ABI)
          ? GENESIS_BLUEPRINT_ABI
          : GENESIS_BLUEPRINT_ABI.abi,
        provider
      ) as GenesisBlueprintContract
      setContract(contractInstance)
    }
  }, [])

  const mintNFT = useCallback(
    async (metadataCID: string) => {
      if (!contract || !account) {
        const errorMessage = "Please connect your wallet to mint an NFT."
        setError(errorMessage)
        throw new Error(errorMessage)
      }

      setIsMinting(true)
      setError(null)

      try {
        const provider = new ethers.BrowserProvider(window.ethereum!)
        const signer = await provider.getSigner()
        const contractWithSigner = contract.connect(
          signer
        ) as GenesisBlueprintContract

        const tokenURI = `ipfs://${metadataCID}`

        const tx = await contractWithSigner.safeMint(account, tokenURI)

        await tx.wait()
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An unknown error occurred during minting."
        setError(errorMessage)
        console.error("Minting failed:", err)
        throw new Error(errorMessage)
      } finally {
        setIsMinting(false)
      }
    },
    [contract, account]
  )

  return { mintNFT, isMinting, error }
}
