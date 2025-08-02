"use client"

import { useWallet } from "@/contexts/WalletProvider"
import { useProofOfSkill } from "@/hooks/useProofOfSkill"
import { motion } from "framer-motion"
import { FormEvent, JSX, useState } from "react"

type ReviewFormProps = {
  onReviewSubmitted: () => void
}

function ReviewForm({ onReviewSubmitted }: ReviewFormProps): JSX.Element {
  const [reviewText, setReviewText] = useState<string>("")
  const { leaveReview, isLoading } = useProofOfSkill()
  const { account } = useWallet()

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (!reviewText.trim()) return
    try {
      await leaveReview(reviewText)
      setReviewText("")
      onReviewSubmitted()
    } catch (error) {
      console.error("Failed to submit review:", error)
    }
  }

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder={account ? "Leave your honest review here..." : "Connect your wallet to leave a review"}
        disabled={!account || isLoading}
        className="w-full h-32 p-4 rounded-lg bg-gray-800/70 border border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all duration-300 disabled:opacity-50"
      />
      <div className="flex justify-end mt-4">
        <motion.button
          type="submit"
          disabled={!account || isLoading || !reviewText.trim()}
          className="px-8 py-3 rounded-lg font-semibold bg-teal-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isLoading ? "Submitting..." : "Submit Review"}
        </motion.button>
      </div>
    </motion.form>
  )
}

export default ReviewForm