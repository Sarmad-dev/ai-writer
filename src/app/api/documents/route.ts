import { NextRequest, NextResponse } from "next/server"
import { DocumentSettings } from "@/stores/editorStore"
import prisma from "@/lib/db/prisma"
import {auth} from "@/lib/auth/auth"

// GET /api/documents - Get user's documents
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const contentType = searchParams.get("contentType")

    const skip = (page - 1) * limit

    const where: any = {
      userId: session.user.id,
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ]
    }

    if (contentType) {
      where.contentType = contentType
    }

    const [documents, total] = await Promise.all([
      prisma.contentSession.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.contentSession.count({ where }),
    ])

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching documents:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/documents - Create new document
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      content = "", 
      contentType = "GENERAL", 
      settings,
      isTemplate = false,
      templateCategory 
    } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Calculate initial statistics
    const wordCount = content.trim().split(/\s+/).filter((word: string) => word.length > 0).length
    const characterCount = content.length
    const paragraphCount = content.split(/\n\s*\n/).filter((p: string) => p.trim().length > 0).length
    const readingTime = Math.ceil(wordCount / 200) // 200 words per minute

    const document = await prisma.contentSession.create({
      data: {
        userId: session.user.id,
        title,
        content,
        contentType,
        documentSettings: settings || null,
        wordCount,
        characterCount,
        paragraphCount,
        readingTime,
        isTemplate,
        templateCategory,
        status: "COMPLETED",
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

    return NextResponse.json({
      success: true,
      document,
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating document:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}