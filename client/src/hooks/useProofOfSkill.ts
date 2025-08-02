"use client"

import {
  PROOF_OF_SKILL_ABI,
  PROOF_OF_SKILL_CONTRACT_ADDRESS,
} from "@/constants"
import { useWallet } from "@/contexts/WalletProvider"
import { ethers } from "ethers"
import { useCallback, useEffect, useState } from "react"

export type Review = {
  reviewer: string
  text: string,
  timestamp: bigint
}

type ProofOfSkillContract = ethers.Contract & {
  skillEndorsements: (skill: string) => Promise<bigint>
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
        const count = await contract.skillEndorsements(skill)

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
      const provider = new ethers.BrowserProvider(window.ethereum!)
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

  const leaveReview = useCallback(async (reviewText: string) => {
    if (!contract || !account) {
      setError("Please connect your wallet to leave a review.")
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum!)
      const signer = await provider.getSigner()
      const contractWithSigner = contract.connect(signer) as ProofOfSkillContract
      const tx = await contractWithSigner.leaveReview(reviewText)

      await tx.wait()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred while leaving a review.")
      }

      throw err
    } finally {
      setIsLoading(false)
    }
  }, [contract, account])

  const getAllReviews = useCallback(async (): Promise<Review[]> => {
    if (!contract) return []
    try {
      const count = await contract.getReviewsCount()
      const reviewsCount = Number(count)
      const reviews: Review[] = []

      for (let i = reviewsCount - 1; i >= 0; i--) {
        const review = await contract.reviews(i)
        reviews.push(review)
      }

      return reviews
    } catch (err) {
      console.error("Error fetching reviews:", err)

      return []
    }
  }, [contract])

  return {
    getEndorsementCount,
    endorseSkill,
    leaveReview,
    getAllReviews,
    isLoading,
    error
  }
}
