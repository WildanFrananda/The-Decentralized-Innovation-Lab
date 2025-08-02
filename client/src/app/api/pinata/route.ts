import { NextRequest, NextResponse } from "next/server"
import pinataSDK, { PinataPinResponse } from "@pinata/sdk"
import { Readable } from "stream"
import axios from "axios"

const pinata = new pinataSDK({
  pinataApiKey: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
})

async function uploadImage(formData: FormData): Promise<PinataPinResponse> {
  const file = formData.get("file") as File | null

  if (!file) {
    throw new Error("No file uploaded")
  }

  const stream = Readable.from(Buffer.from(await file.arrayBuffer()))
  const options = {
    pinataMetadata: {
      name: file.name
    }
  }
  const result = await pinata.pinFileToIPFS(stream, options)

  return result
}

async function updateProjectsList(newProject: unknown) {
  const currentProjectsCID = process.env.NEXT_PUBLIC_PROJECTS_LIST_CID
  let currentProjects: unknown[] = []

  if (currentProjectsCID) {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${currentProjectsCID}`)

    if (response.status === 200) {
      currentProjects = response.data
    }
  }

  const updatedProjects = [...currentProjects, newProject]
  const result = await pinata.pinJSONToIPFS(updatedProjects, {
    pinataMetadata: { name: 'projects-list.json' }
  })

  if (currentProjectsCID) {
    await pinata.unpin(currentProjectsCID)
  }

  return result
}

export async function POST(req: NextRequest) {
  try {
    const action = req.headers.get("X-Action")

    if (action === "upload-image") {
      const formData = await req.formData()
      const result = await uploadImage(formData)

      return NextResponse.json({ cid: result.IpfsHash }, { status: 200 })
    }

    if (action === "update-projects") {
      const body = await req.json()
      const result = await updateProjectsList(body.newProject)

      return NextResponse.json({ cid: result.IpfsHash }, { status: 200 })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    console.error("Pinata API Error:", errorMessage)

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
