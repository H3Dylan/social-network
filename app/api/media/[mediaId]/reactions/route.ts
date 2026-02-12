import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
    params: Promise<{ mediaId: string }>
}

export async function POST(req: Request, props: RouteParams) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { mediaId } = params;
        const { emoji } = await req.json();

        // Check if specific reaction (user + media + emoji) exists
        const existing = await prisma.reaction.findUnique({
            where: {
                userId_mediaId_emoji: {
                    userId: user.id,
                    mediaId: mediaId,
                    emoji: emoji
                }
            }
        });

        if (existing) {
            // Remove if clicking same emoji (toggle off)
            await prisma.reaction.delete({ where: { id: existing.id } });
            return NextResponse.json({ status: 'removed' });
        } else {
            // Create new (allow multiple different emojis)
            const created = await prisma.reaction.create({
                data: {
                    userId: user.id,
                    mediaId: mediaId,
                    type: "EMOJI",
                    emoji: emoji
                }
            });
            return NextResponse.json(created);
        }

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
