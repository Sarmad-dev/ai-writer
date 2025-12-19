import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"
import { DocumentSettings } from "@/stores/editorStore"

// GET /api/documents/[id]/settings - Get document settings
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const documentId = params.id

    const document = await prisma.contentSession.findFirst({
      where: {
        id: documentId,
        userId: session.user.id,
      },
      select: {
        documentSettings: true,
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({
      settings: document.documentSettings || null,
    })
  } catch (error) {
    console.error("Error fetching document settings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/documents/[id]/settings - Update document settings
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const documentId = params.id
    const body = await request.json()
    const { settings } = body as { settings: DocumentSettings }

    // Validate that the document exists and belongs to the user
    const existingDocument = await prisma.contentSession.findFirst({
      where: {
        id: documentId,
        userId: session.user.id,
      },
    })

    if (!existingDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Update the document settings
    const updatedDocument = await prisma.contentSession.update({
      where: {
        id: documentId,
      },
      data: {
        documentSettings: settings,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        documentSettings: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      document: updatedDocument,
    })
  } catch (error) {
    console.error("Error updating document settings:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}