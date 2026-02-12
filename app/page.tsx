import prisma from "@/lib/prisma";
import HomeClient from "@/components/HomeClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

async function getData() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return { groups: [], feedItems: [], currentUserId: null };
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return { groups: [], feedItems: [], currentUserId: null };

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

  // Fetch feed items (latest media from user's groups)
  const groupIds = groups.map(g => g.id);

  const rawFeedItems = await prisma.media.findMany({
    where: {
      album: {
        groupId: { in: groupIds }
      }
    },
    include: {
      user: {
        select: { id: true, name: true, image: true }
      },
      album: {
        include: {
          group: {
            select: { id: true, name: true }
          }
        }
      },
      _count: {
        select: { reactions: true, comments: true }
      },
      reactions: {
        select: { userId: true, emoji: true, user: { select: { name: true } } }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  const feedItems = rawFeedItems.map(item => ({
    id: item.id,
    url: item.url,
    type: item.type,
    createdAt: item.createdAt,
    user: item.user,
    group: item.album.group,
    album: { id: item.album.id, title: item.album.title },
    _count: item._count,
    reactions: item.reactions,
  }));

  return { groups, feedItems, currentUserId: user.id };
}

export default async function Home() {
  const { groups, feedItems, currentUserId } = await getData();

  return <HomeClient groups={groups} feedItems={feedItems} currentUserId={currentUserId} />; // passing currentUserId to HomeClient
}
