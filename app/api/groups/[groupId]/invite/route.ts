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

        const { email } = await req.json()
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const groupId = params.groupId

        // specific check: ensure current user is admin/owner or member? 
        // strictly speaking typical social networks allow members to invite, or just admins. 
        // Let's allow any member to invite for now for simplicity, or just owner. 
        // implementation_plan didn't specify. Let's assume Owner only for now for better control.

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { members: true }
        })

        if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 })

        // Check if requester is owner
        // We need requester's ID.
        const requester = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!requester || group.ownerId !== requester.id) {
            return NextResponse.json({ error: "Only the group owner can invite members" }, { status: 403 })
        }

        // Find user to invite
        const userToInvite = await prisma.user.findUnique({ where: { email } })
        if (!userToInvite) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Add to group
        await prisma.group.update({
            where: { id: groupId },
            data: {
                members: {
                    connect: { id: userToInvite.id }
                }
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        return NextResponse.json({ error: "Failed to invite user" }, { status: 500 })
    }
}
