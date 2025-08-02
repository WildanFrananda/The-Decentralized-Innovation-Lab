"use client"

import { useState, useEffect, useCallback, JSX } from "react"
import { useProofOfSkill, Review } from "@/hooks/useProofOfSkill"
import { motion } from "framer-motion"
import ReviewForm from "./ReviewForm"

function ReviewsList(): JSX.Element {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { getAllReviews } = useProofOfSkill()

  const fetchReviews = useCallback(async () => {
    setIsLoading(true)
    const fetchedReviews = await getAllReviews()
    setReviews(fetchedReviews)
    setIsLoading(false)
  }, [getAllReviews])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <section className="py-24 w-full">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-8">
          Guestbook Reviews
        </h2>
        <p className="text-center text-gray-400 mb-12 max-w-3xl mx-auto">
          Every review is permanently stored on the Sepolia testnet.
          Leave your mark on the blockchain!
        </p>
        
        <ReviewForm onReviewSubmitted={fetchReviews} />

        <div className="mt-16">
          {isLoading ? (
            <p className="text-center">Loading reviews from the blockchain...</p>
          ) : (
            <motion.div
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {reviews.map((review, index) => (
                <motion.div 
                  key={index} 
                  className="p-5 rounded-lg bg-gray-800/50 border border-gray-700"
                  variants={itemVariants}
                >
                  <p className="text-lg mb-2">{review.text}</p>
                  <p className="text-sm text-teal-400 font-mono">
                    - {truncateAddress(review.reviewer)}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ReviewsList