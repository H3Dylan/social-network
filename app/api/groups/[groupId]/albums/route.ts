import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

interface RouteParams {
    params: Promise<{ groupId: string }>
}

export async function POST(req: Request, props: RouteParams) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { title, description } = await req.json()
        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 })
        }

        const groupId = params.groupId

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { members: true } // Check membership
        })

        if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 })

        // Check if user is a member or owner
        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        const isMember = group.members.some(m => m.id === user.id) || group.ownerId === user.id

        if (!isMember) {
            return NextResponse.json({ error: "You must be a member of the group to create albums" }, { status: 403 })
        }

        const album = await prisma.album.create({
            data: {
                title,
                description,
                groupId,
            }
        })

        return NextResponse.json(album)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create album" }, { status: 500 })
    }
}
