import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import MediaViewClient from "@/components/MediaViewClient";
import Link from "next/link";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface PageProps {
    params: Promise<{
        groupId: string;
        albumId: string;
        mediaId: string;
    }>
}

async function getMedia(id: string) {
    const media = await prisma.media.findUnique({
        where: { id },
        include: {
            comments: {
                include: {
                    user: true,
                    reactions: { select: { userId: true, emoji: true } }
                },
                orderBy: { createdAt: 'desc' }
            },
            reactions: { select: { userId: true, emoji: true, user: { select: { name: true } } } },
            user: true // Uploader
        }
    });
    return media;
}

export default async function MediaPage(props: PageProps) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    const media = await getMedia(params.mediaId);

    if (!media) notFound();

    const userEmail = session?.user?.email;

    let currentUserId: string | undefined = undefined;
    if (userEmail) {
        const u = await prisma.user.findUnique({ where: { email: userEmail } });
        if (u) currentUserId = u.id;
    }

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
                <Link href={`/groups/${params.groupId}/albums/${params.albumId}`} className="btn btn-secondary btn-sm">
                    &larr; Back to Album
                </Link>
            </div>

            <MediaViewClient
                media={media}
                currentUserId={currentUserId}
            />


        </div>
    );
}
