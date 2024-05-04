import { db } from 'lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

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
    });

    res.status(200).json(votes);
  } catch (error) {
    console.error('Failed to fetch votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
}
