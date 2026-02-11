import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface RouteParams {
    params: Promise<{ mediaId: string }>
}

export async function GET(req: Request, props: RouteParams) {
    const params = await props.params;
    try {
        const comments = await prisma.comment.findMany({
            where: { mediaId: params.mediaId },
            include: { user: true },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(comments)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
    }
}

export async function POST(req: Request, props: RouteParams) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { content } = await req.json()
        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        const comment = await prisma.comment.create({
            data: {
                content,
                mediaId: params.mediaId,
                userId: user.id
            },
            include: { user: true }
        })

        return NextResponse.json(comment)
    } catch (error) {
        return NextResponse.json({ error: "Failed to post comment" }, { status: 500 })
    }
}
