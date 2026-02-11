import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CommentSection from "@/components/CommentSection";
import ReactionButton from "@/components/ReactionButton";
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
                include: { user: true },
                orderBy: { createdAt: 'desc' }
            },
            reactions: true,
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


    // Wait, we need to be sure we have user ID. In authOptions we added it.
    // But for SSR, we might need to fetch user ID if session.user.id is missing or untyped.
    // Ideally we fetch current user to check if they liked it.
    let currentUserId = null;
    if (userEmail) {
        const u = await prisma.user.findUnique({ where: { email: userEmail } });
        currentUserId = u?.id;
    }

    const userHasLiked = media.reactions.some(r => r.userId === currentUserId);
    const likeCount = media.reactions.length;

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
                <Link href={`/groups/${params.groupId}/albums/${params.albumId}`} className="btn btn-secondary btn-sm">
                    &larr; Back to Album
                </Link>
            </div>

            <div className="media-container">
                <div className="media-display">
                    {media.type === 'VIDEO' ? (
                        <video src={media.url} controls className="media-content" autoPlay />
                    ) : (
                        <div className="image-wrapper">
                            <Image
                                src={media.url}
                                alt="Media Detail"
                                fill
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                    )}
                </div>

                <div className="media-sidebar">
                    <div className="sidebar-header">
                        <span className="uploaded-by">Uploaded by {media.user.name}</span>
                        <ReactionButton mediaId={media.id} initialCount={likeCount} initialLiked={userHasLiked} />
                    </div>

                    <CommentSection
                        mediaId={media.id}
                        initialComments={media.comments.map(c => ({
                            ...c,
                            createdAt: c.createdAt.toISOString()
                        }))}
                    />
                </div>
            </div>


        </div>
    );
}
