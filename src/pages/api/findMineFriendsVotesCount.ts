import { db } from 'lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { startOfDay, endOfDay } from 'date-fns';

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

  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

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

    // Fetch votes from these users for the current date
    const votes = await db.vote.findMany({
      where: {
        userId: {
          in: Array.from(allUserIds),
        },
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // Calculate vote counts
    const voteCounts = votes.reduce<Record<string, VoteWithCount>>((acc, vote) => {
      const key = `${vote.song}-${vote.artist}`;
      const voteValue = vote.voteType === '+' ? 1 : -1;

      if (!acc[key]) {
        acc[key] = {
          ...vote,
          voteCount: 0,
          createdAt: vote.createdAt.toISOString(),
        };
      }
      acc[key]!.voteCount += voteValue;
      return acc;
    }, {});

    const votesWithCounts = Object.values(voteCounts);
    res.status(200).json(votesWithCounts);
  } catch (error) {
    console.error('Failed to fetch votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
}
