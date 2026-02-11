import prisma from "@/lib/prisma";
import GroupActions from "@/components/GroupActions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<any>;
}

async function getGroup(id: string) {
    const group = await prisma.group.findUnique({
        where: { id },
        include: {
            owner: true,
            albums: {
                include: { _count: { select: { medias: true } } },
                orderBy: { createdAt: 'desc' }
            },
            _count: {
                select: { members: true, albums: true }
            },
            members: true
        }
    });
    return group;
}

export default async function GroupPage(props: PageProps) {
    const params = await props.params;
    const session = await getServerSession(authOptions);

    if (!params.groupId) {
        notFound();
    }

    const group = await getGroup(params.groupId);

    if (!group) {
        notFound();
    }

    const userEmail = session?.user?.email;
    if (!userEmail) {
        // Should be handled by middleware, but double check
        return notFound();
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return notFound();

    const isMember = group.members.some(m => m.id === user.id) || group.ownerId === user.id;

    if (!isMember) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <h1>Access Denied</h1>
                <p>You are not a member of this group.</p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    Go Home
                </Link>
            </div>
        );
    }

    // derived for UI
    const isOwner = group.ownerId === user.id;

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <header className="group-header">
                <div className="header-content">
                    <h1>{group.name}</h1>
                    <p className="description">{group.description}</p>
                    <div className="meta">
                        <span>Created by {group.owner.name}</span>
                        <span>•</span>
                        <span>{group._count.members} Members</span>
                        <span>•</span>
                        <span>{group._count.albums} Albums</span>
                    </div>
                </div>
                <div className="header-actions">
                    <GroupActions groupId={group.id} isOwner={isOwner} />
                </div>
            </header>

            <div className="albums-section">
                <h2>Albums</h2>

                <div className="albums-grid">
                    {group.albums.map(album => (
                        <Link key={album.id} href={`/groups/${group.id}/albums/${album.id}`} className="album-card">
                            <div className="album-content">
                                <h3>{album.title}</h3>
                                <p className="album-desc">{album.description || "No description"}</p>
                                <span className="album-meta">{album._count.medias} items</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {group.albums.length === 0 && (
                    <div className="empty-state">
                        <p>No albums yet. Create one to start sharing memories!</p>
                    </div>
                )}
            </div>


        </div>
    );
}
