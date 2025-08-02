"use client"

import {
  PROOF_OF_SKILL_ABI,
  PROOF_OF_SKILL_CONTRACT_ADDRESS,
} from "@/constants"
import { useWallet } from "@/contexts/WalletProvider"
import { ethers } from "ethers"
import { useCallback, useEffect, useState } from "react"

type ProofOfSkillContract = ethers.Contract & {
  skillEndorsement: (skill: string) => Promise<bigint>
  endorseSkill: (skill: string) => Promise<ethers.ContractTransactionResponse>
}

export function useProofOfSkill() {
  const { account } = useWallet()
  const [contract, setContract] = useState<ProofOfSkillContract | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const contractInstance = new ethers.Contract(
        PROOF_OF_SKILL_CONTRACT_ADDRESS,
        Array.isArray(PROOF_OF_SKILL_ABI)
          ? PROOF_OF_SKILL_ABI
          : PROOF_OF_SKILL_ABI.abi,
        provider
      ) as ProofOfSkillContract
      setContract(contractInstance)
    }
  }, [])

  const getEndorsementCount = useCallback(
    async (skill: string): Promise<number> => {
      if (!contract) return 0

      try {
        const count = await contract.skillEndorsement(skill)

        return Number(count)
      } catch (error) {
        console.error("Error fetching endorsement count:", error)

        return 0
      }
    },
    [contract]
  )

  const endorseSkill = useCallback(async (skill: string) => {
    if (!contract || !account) {
      setError("Please connect your wallet to endorse a skill")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (!window.ethereum) {
        setError("Ethereum provider not found.")
        setIsLoading(false)
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contractWithSigner = contract.connect(signer) as ProofOfSkillContract
      const tx = await contractWithSigner.endorseSkill(skill)

      await tx.wait()
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred during endorsement.")
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [contract, account])

  return {
    getEndorsementCount,
    endorseSkill,
    isLoading,
    error
  }
}
