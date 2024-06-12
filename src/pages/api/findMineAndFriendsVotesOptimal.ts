import { db } from 'lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

interface Vote {
  id: number;
  createdAt: string;
  song: string;
  artist: string;
  voteType: string;
  imageUrl?: string | null;
  userId: string;
}

interface VoteWithCount extends Vote {
  voteCount: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 20;
  const offset = (page - 1) * limit;

  try {
    // Fetching friendships where the user is either the user or the friend
    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { userId: userId },
          { friendId: userId }
        ],
      },
      select: {
        userId: true,
        friendId: true,
      }
    });

    // Extract all unique user IDs from friendships
    const allUserIds = new Set(friendships.flatMap(f => [f.userId, f.friendId]));
    allUserIds.delete(userId);

    // Fetch votes from these users
    const votes = await db.vote.findMany({
      where: {
        userId: {
          in: Array.from(allUserIds),
        },
      },
      skip: offset,
      take: limit,
    });

    // Calculate total vote count for pagination
    const totalVotes = await db.vote.count({
      where: {
        userId: {
          in: Array.from(allUserIds),
        },
      },
    });

    // Calculate vote counts
    const voteCounts = votes.reduce((acc, vote) => {
      const key = `${vote.song}-${vote.artist}`;
      if (!acc[key]) {
        acc[key] = {
          ...vote,
          voteCount: 0,
          createdAt: vote.createdAt.toISOString(),
        };
      }
      acc[key]!.voteCount += 1; 
      return acc;
    }, {} as Record<string, VoteWithCount>);

    const votesWithCounts = Object.values(voteCounts).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({ votes: votesWithCounts, totalVotes });
  } catch (error) {
    console.error('Failed to fetch votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
}
