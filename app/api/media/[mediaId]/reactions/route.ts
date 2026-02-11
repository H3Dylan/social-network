import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface RouteParams {
    params: Promise<{ mediaId: string }>
}

export async function POST(req: Request, props: RouteParams) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { type } = await req.json() // e.g., "LIKE"

        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        const mediaId = params.mediaId

        // Check if reaction exists
        const existingReaction = await prisma.reaction.findUnique({
            where: {
                userId_mediaId_type: {
                    userId: user.id,
                    mediaId,
                    type: type || 'LIKE'
                }
            }
        })

        if (existingReaction) {
            // Toggle off (delete)
            await prisma.reaction.delete({
                where: { id: existingReaction.id }
            })
            return NextResponse.json({ deleted: true })
        } else {
            // Create
            const reaction = await prisma.reaction.create({
                data: {
                    type: type || 'LIKE',
                    userId: user.id,
                    mediaId
                }
            })
            return NextResponse.json(reaction)
        }

    } catch (error) {
        return NextResponse.json({ error: "Failed to react" }, { status: 500 })
    }
}
