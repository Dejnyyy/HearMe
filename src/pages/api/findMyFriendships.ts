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
    });

    console.log(friendships);
    return res.status(200).json(friendships);
  } catch (error) {
    console.error('Failed to fetch friendships:', error);
    res.status(500).json({ error: 'Failed to fetch friendships' });
  }
}
