"use client"

import type { JSX } from "react"
import { motion } from "framer-motion"
import Skills from "@/components/Skill"
import ReviewsList from "@/components/ReviewList"
import Projects from "@/components/Projects"

function HomePage(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <motion.h1
          className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 pb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          The Decentralized
        </motion.h1>
        <motion.h2
          className="text-6xl md:text-8xl font-extrabold"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Innovation Lab
        </motion.h2>
      </div>
      <Projects />
      <div className="w-full my-16 border-t border-gray-700/50" />
      <Skills />
      <div className="w-full my-16 border-t border-gray-700/50" />
      <ReviewsList />
    </main>
  )
}

export default HomePage
