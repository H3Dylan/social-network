import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { writeFile } from 'fs/promises'
import path from 'path'
import { mkdir } from 'fs/promises'

interface RouteParams {
    params: Promise<{ groupId: string; albumId: string }>
}

export async function POST(req: Request, props: RouteParams) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { fileData, fileName, fileType } = await req.json()

        if (!fileData || !fileName || !fileType) {
            return NextResponse.json({ error: "Missing file data" }, { status: 400 })
        }

        const { groupId, albumId } = params

        // Verify access
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            include: { members: true }
        })

        if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 })

        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        const isMember = group.members.some(m => m.id === user.id) || group.ownerId === user.id

        console.log(`Upload Check: User ${user.email} (${user.id})`);
        console.log(`Group Owner: ${group.ownerId}`);
        console.log(`Members: ${group.members.map(m => m.id).join(', ')}`);
        console.log(`Is Member or Owner: ${isMember}`);

        if (!isMember) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }

        // Save file locally (MVP approach)
        // Create uploads dir if not exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const extension = path.extname(fileName) || '.jpg'
        const storedFileName = `upload-${uniqueSuffix}${extension}`
        const filePath = path.join(uploadDir, storedFileName)

        // fileData is expected to be base64 string "data:image/png;base64,..."
        const base64Data = fileData.replace(/^data:(.*);base64,/, '')

        await writeFile(filePath, Buffer.from(base64Data, 'base64'))

        // Create Media record
        const media = await prisma.media.create({
            data: {
                url: `/uploads/${storedFileName}`,
                type: fileType.startsWith('video') ? "VIDEO" : "IMAGE",
                albumId,
                userId: user.id
            }
        })

        return NextResponse.json(media)

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to upload media" }, { status: 500 })
    }
}
