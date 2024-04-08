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
  const fetchLastVote = req.query.last === 'true';

  try {
    if (fetchLastVote) {
      const lastVote = await db.vote.findFirst({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: 'desc', // Assuming you have a 'createdAt' field to sort by
        },
      });

      if (!lastVote) {
        return res.status(404).json({ error: 'No votes found' });
      }

      return res.status(200).json(lastVote);
    } else {
      const votes = await db.vote.findMany({
        where: {
          userId: userId,
        },
      });

      return res.status(200).json(votes);
    }
  } catch (error) {
    console.error('Failed to fetch votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
}
