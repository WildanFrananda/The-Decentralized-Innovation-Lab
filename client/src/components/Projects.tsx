"use client"

import { motion } from "framer-motion"
import ProjectCard from "./ProjectCard"
import { JSX, useEffect, useState } from "react"
import axios from "axios"

export type Project = {
  title: string
  description: string
  image: string
  liveUrl: string
  githubUrl: string
}

function Projects(): JSX.Element {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function fetchProjects(): Promise<void> {
      const cid = process.env.NEXT_PUBLIC_PROJECTS_LIST_CID

      if (!cid) {
        console.error("Projects list CID is not defined in .env.local")
        setIsLoading(false)
        return
      }

      try {
        const { data } = await axios.get<Project[]>(
          `https://gateway.pinata.cloud/ipfs/${cid}`
        )
        setProjects(data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  if (isLoading) {
    return (
      <section className="py-24 w-full text-center">
        <p>Loading projects from IPFS...</p>
      </section>
    )
  }

  return (
    <section className="py-24 w-full">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">
          Genesis Blueprints
        </h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Projects
