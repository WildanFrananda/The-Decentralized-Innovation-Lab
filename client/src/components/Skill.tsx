"use client"

import { SKILLS_LIST } from "@/constants"
import { motion } from "framer-motion"
import SkillCard from "./SkillCard"

const Skills = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Proof of Skills
        </h2>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {SKILLS_LIST.map((skill, index) => (
            <SkillCard key={skill} skill={skill} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Skills