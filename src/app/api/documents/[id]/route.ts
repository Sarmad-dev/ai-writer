import { NextRequest, NextResponse } from "next/server"
import {auth} from "@/lib/auth/auth"
import prisma from "@/lib/db/prisma"

// GET /api/documents/[id] - Get document with settings
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const documentId = id

    const document = await prisma.contentSession.findFirst({
      where: {
        id: documentId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json({
      document: {
        ...document,
        documentSettings: document.documentSettings || null,
      },
    })
  } catch (error) {
    console.error("Error fetching document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/documents/[id] - Update document content and settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const documentId = id
    const body = await request.json()
    const { 
      title, 
      content, 
      settings, 
      wordCount, 
      characterCount, 
      paragraphCount, 
      readingTime 
    } = body

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

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (settings !== undefined) updateData.documentSettings = settings
    if (wordCount !== undefined) updateData.wordCount = wordCount
    if (characterCount !== undefined) updateData.characterCount = characterCount
    if (paragraphCount !== undefined) updateData.paragraphCount = paragraphCount
    if (readingTime !== undefined) updateData.readingTime = readingTime

    // Update the document
    const updatedDocument = await prisma.contentSession.update({
      where: {
        id: documentId,
      },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      document: updatedDocument,
    })
  } catch (error) {
    console.error("Error updating document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE /api/documents/[id] - Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const documentId = id

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

    // Delete the document
    await prisma.contentSession.delete({
      where: {
        id: documentId,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}