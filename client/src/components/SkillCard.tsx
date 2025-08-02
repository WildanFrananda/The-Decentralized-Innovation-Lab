"use client"

import { useWallet } from "@/contexts/WalletProvider"
import { useProofOfSkill } from "@/hooks/useProofOfSkill"
import { motion } from "framer-motion"
import { JSX, useEffect, useState } from "react"

type SkillCardProps = {
  skill: string
  index: number
}

function SkillCard({ skill, index }: SkillCardProps): JSX.Element {
  const { getEndorsementCount, endorseSkill, isLoading: isEndorsing } = useProofOfSkill()
  const { account } = useWallet()
  const [endorsements, setEndorsements] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchEndorsements(): Promise<void> {
      setIsLoading(true)
      const count = await getEndorsementCount(skill)
      setEndorsements(count)
      setIsLoading(false)
    }

    fetchEndorsements()
  }, [getEndorsementCount, skill])

  async function handleEndorse(): Promise<void> {
    try {
      await endorseSkill(skill)

      setEndorsements(prev => prev + 1)
    } catch (error) {
      console.error("Endorsement failed:", error)
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: index * 0.1
      } 
    },
  }

  return (
    <motion.div
      className="p-6 rounded-xl bg-gray-800/50 border border-gray-700/80 shadow-lg flex flex-col items-center justify-center text-center"
      variants={cardVariants}
    >
      <h3 className="text-2xl font-bold text-teal-300">{skill}</h3>
      <p className="text-4xl font-mono font-extrabold my-4">
        {isLoading ? "..." : endorsements}
      </p>
      <p className="text-sm text-gray-400 mb-6">Endorsements</p>
      <motion.button
        onClick={handleEndorse}
        disabled={!account || isEndorsing}
        className="px-5 py-2 rounded-lg font-semibold text-sm bg-teal-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isEndorsing ? "Endorsing..." : "Endorse"}
      </motion.button>
    </motion.div>
  )
}

export default SkillCard
