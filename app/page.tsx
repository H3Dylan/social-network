import prisma from "@/lib/prisma";
import GroupCard from "@/components/GroupCard";

export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getGroups() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return [];

  const groups = await prisma.group.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { members: { some: { id: user.id } } }
      ]
    },
    include: {
      _count: {
        select: { members: true, albums: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return groups;
}

export default async function Home() {
  const groups = await getGroups();

  return (
    <div className="home-page">
      <header className="hero">
        <div className="container">
          <h1 className="hero-title">My Communities</h1>
          <p className="hero-subtitle">
            Join groups, share memories, and connect with friends through shared albums.
          </p>
        </div>
      </header>

      <div className="container">
        <div className="groups-grid">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              id={group.id}
              name={group.name}
              description={group.description}
              memberCount={group._count.members}
              albumCount={group._count.albums}
            />
          ))}

          {groups.length === 0 && (
            <div className="empty-state">
              <p>You haven't joined any groups yet. Create one or ask for an invite!</p>
            </div>
          )}
        </div>
      </div>

      {/* Global Styles for this page can be scoped or added here if using CSS-in-JS pattern broadly, 
          but usually Next.js prefers CSS modules or global CSS. 
          Mixing 'style jsx' for component-level styling in this setup.
      */}
      {/* @ts-ignore */}

    </div>
  );
}
