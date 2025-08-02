"use client"

import { JSX, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useGenesisBlueprint } from "@/hooks/useGenesisBlueprint"
import { useWallet } from "@/contexts/WalletProvider"
import { Project } from "./Projects"

interface ProjectCardProps {
  project: Project
  index: number
}

type MintingStatus = "idle" | "uploading" | "minting" | "success" | "error"

function ProjectCard({ project, index }: ProjectCardProps): JSX.Element {
  const { mintNFT } = useGenesisBlueprint()
  const { account } = useWallet()
  const [status, setStatus] = useState<MintingStatus>("idle")

  function getButtonText(): string {
    switch (status) {
      case "uploading": return "Uploading to IPFS..."
      case "minting": return "Minting on-chain..."
      case "success": return "Minted Successfully!"
      case "error": return "Minting Failed"
      default: return "Mint as NFT"
    }
  }

  function resolveIpfsUrl(ipfsUrl: string): string {
    if (!ipfsUrl || !ipfsUrl.startsWith('ipfs://')) return '/placeholder.png'
    const cid = ipfsUrl.replace("ipfs://", "")
    return `https://gateway.pinata.cloud/ipfs/${cid}`
  }

  async function handleMint(): Promise<void> {
    if (!account) {
      alert("Please connect your wallet first.")
      return
    }

    setStatus("uploading")
    try {
      const metadata = {
        name: project.title,
        description: project.description,
        image: project.image,
      }

      const response = await fetch("/api/uploadToPinata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ metadata }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to upload metadata to IPFS")
      }
      
      const metadataCID = data.cid
      setStatus("minting")

      await mintNFT(metadataCID)

      setStatus("success")
      setTimeout(() => setStatus("idle"), 5000)

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      console.error("Minting process failed:", errorMessage)
      setStatus("error")
      setTimeout(() => setStatus("idle"), 5000)
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.2,
        duration: 0.6
      }
    }
  }

  return (
    <motion.div 
      className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/80 flex flex-col"
      variants={cardVariants}
    >
      <div className="relative w-full h-56">
        <Image 
          src={resolveIpfsUrl(project.image)} 
          alt={`[Gambar ${project.title}]`}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
        <p className="text-gray-400 mb-6 flex-grow">{project.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-4">
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 transition-colors">Live Demo</a>
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 transition-colors">GitHub</a>
          </div>
          <motion.button 
            onClick={handleMint}
            disabled={!account || status !== "idle"}
            className="px-4 py-2 w-40 text-sm font-semibold rounded-lg bg-blue-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: status === "idle" ? 1.05 : 1 }}
            whileTap={{ scale: status === "idle" ? 0.95 : 1 }}
          >
            {getButtonText()}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default ProjectCard