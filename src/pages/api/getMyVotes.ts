// pages/api/getVotes.ts
import { db } from 'lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next'
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
    const votes = await db.vote.findMany({
      where: {
        userId: userId, // Assuming each vote has a userId field
      },
    });

    res.status(200).json(votes);
  } catch (error) {
    console.error('Failed to fetch votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
}
