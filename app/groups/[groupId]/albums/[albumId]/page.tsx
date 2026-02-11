import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import UploadMediaButton from "@/components/UploadMediaButton";
import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface PageProps {
    params: Promise<{
        groupId: string;
        albumId: string;
    }>
}

async function getAlbum(id: string) {
    const album = await prisma.album.findUnique({
        where: { id },
        include: {
            medias: {
                orderBy: { createdAt: 'desc' }
            },
            group: true
        }
    });
    return album;
}

export default async function AlbumPage(props: PageProps) {
    const params = await props.params;
    const album = await getAlbum(params.albumId);

    if (!album) notFound();

    // Access Control
    // We need to fetch the current user to verify membership in the album's group
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) return notFound();

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return notFound();

    const group = await prisma.group.findUnique({
        where: { id: params.groupId },
        include: { members: true }
    });

    if (!group) return notFound();

    const isMember = group.members.some(m => m.id === user.id) || group.ownerId === user.id;

    if (!isMember) {
        return notFound(); // Or hidden
    }

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <header className="album-header">
                <div>
                    <h1>{album.title}</h1>
                    <p className="description">{album.description}</p>
                    <div className="breadcrumb">
                        Group: {album.group.name}
                    </div>
                </div>
                <div className="actions">
                    <UploadMediaButton groupId={params.groupId} albumId={params.albumId} />
                </div>
            </header>

            <div className="media-grid">
                {album.medias.map(media => (
                    <Link key={media.id} href={`/groups/${params.groupId}/albums/${params.albumId}/media/${media.id}`} className="media-item">
                        {media.type === 'VIDEO' ? (
                            <div className="video-container">
                                <video src={media.url} className="media-content" preload="metadata" />
                                <div className="play-overlay">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="play-icon">
                                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <div className="image-wrapper">
                                <Image
                                    src={media.url}
                                    alt="Album media"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        )}
                    </Link>
                ))}

                {album.medias.length === 0 && (
                    <div className="empty-state">
                        <p>No photos or videos yet.</p>
                    </div>
                )}
            </div>


        </div>
    );
}
