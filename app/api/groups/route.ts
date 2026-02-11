import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        const groups = await prisma.group.findMany({
            include: {
                _count: {
                    select: { members: true, albums: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(groups)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        console.log("Groups API Session:", JSON.stringify(session, null, 2));

        if (!session || !session.user || !session.user.email) {
            console.log("Unauthorized access attempt");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { name, description } = await req.json()

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 })
        }

        // Get user id from db based on email (session might not have all fields if using custom provider without callbacks properly set? 
        // actually we mocked it to return id in session callback, so session.user.id should be there if we typed it correctly)
        // But safely fetching user is better.
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        const group = await prisma.group.create({
            data: {
                name,
                description,
                ownerId: user.id,
                members: {
                    connect: { id: user.id }
                }
            }
        })

        return NextResponse.json(group)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create group" }, { status: 500 })
    }
}
