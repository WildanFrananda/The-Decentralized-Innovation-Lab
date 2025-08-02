"use client"

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react"
import axios from "axios"
import { FilePond, registerPlugin } from 'react-filepond'
import 'filepond/dist/filepond.min.css'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview)

type Project = {
  title: string
  description: string
  image: string
  liveUrl: string
  githubUrl: string
}

function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [imageFile, setImageFile] = useState<File[]>([])
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    liveUrl: "",
    githubUrl: "",
  })

  const fetchProjects = useCallback(async () => {
    const cid = process.env.NEXT_PUBLIC_PROJECTS_LIST_CID
    if (!cid) {
      console.warn(
        "Projects list CID is not set. Starting with an empty list."
      )
      setIsLoading(false)
      return
    }
    try {
      const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void {
    const { name, value } = e.target

    setNewProject((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()

    if (!imageFile) {
      setStatusMessage("Error: Project image is required")

      return
    }

    try {
      setStatusMessage("Uploading image to IPFS...")

      const formData = new FormData()
      formData.append("file", imageFile[0])
      const imageRes = await axios.post("/api/pinata", {
        headers: { "X-Action": "upload-image" },
        body: formData
      })
      const imageData = await imageRes.data

      if (imageRes.status !== 200) throw new Error(imageData.error)

      const imageCID = imageData.cid

      setStatusMessage(`Image uploaded successfully! CID: ${imageCID}`)

      const projectData: Project = {
        ...newProject,
        image: `ipfs://${imageCID}`
      }

      setStatusMessage("Updating projects list on IPFS...")

      const projectsRes = await axios.post("/api/pinata", {
        headers: {
          "Content-Type": "application/json",
          "X-Action": "update-projects",
        },
        body: JSON.stringify({ newProject: projectData })
      })
      const projectsData = await projectsRes.data

      if (projectsRes.status !== 200) throw new Error(projectsData.error)

      setStatusMessage(`Projects list updated! New master CID: ${projectsData.cid}. Please update this in your .env.local file.`)

      setNewProject({ title: "", description: "", liveUrl: "", githubUrl: "" })
      setImageFile([])
      fetchProjects()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      setStatusMessage(`Error: ${errorMessage}`)
    }
  }

  return (
    <main className="container mx-auto px-6 py-32">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700">
        <h2 className="text-2xl font-semibold mb-6">Add New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" name="title" placeholder="Project Title" value={newProject.title} onChange={handleInputChange} className="w-full p-3 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
          <textarea name="description" placeholder="Project Description" value={newProject.description} onChange={handleInputChange} className="w-full p-3 bg-gray-700 rounded-md h-24 focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
          <input type="text" name="liveUrl" placeholder="Live Demo URL" value={newProject.liveUrl} onChange={handleInputChange} className="w-full p-3 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          <input type="text" name="githubUrl" placeholder="GitHub URL" value={newProject.githubUrl} onChange={handleInputChange} className="w-full p-3 bg-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">Project Image</label>
            <FilePond
                files={imageFile}
                onupdatefiles={ (fileItems) => setImageFile(fileItems.map(fileItem => fileItem.file as File)) }
                allowMultiple={false}
                name="files"
                labelIdle='Drag & Drop your image or <span class="filepond--label-action">Browse</span>'
            />
          </div>

          <button type="submit" className="px-6 py-3 bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Add Project & Publish</button>
        </form>
        {statusMessage && <p className="mt-4 text-teal-400">{statusMessage}</p>}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Current Projects</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-4">
            {projects.map((p, i) => (
              <div key={i} className="p-4 bg-gray-700/50 rounded-lg flex justify-between items-center">
                <p>{p.title}</p>
                <a href={`https://gateway.pinata.cloud/ipfs/${p.image.replace('ipfs://', '')}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">View Image</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default AdminDashboard
