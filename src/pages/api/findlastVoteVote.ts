// api/findLastVoteVote.ts
import { db } from 'lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { subDays } from 'date-fns';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;
  const { song, voteType, artist, imageUrl } = req.body;

  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));

    const existingVote = await db.vote.findFirst({
      where: {
        userId: userId,
        createdAt: {
          gte: startOfToday,
        },
      },
    });

    if (existingVote) {
      return res.status(403).json({ error: 'You have already voted today' });
    }

    const newVote = await db.vote.create({
      data: {
        userId,
        song,
        voteType,
        artist,
        imageUrl,
        createdAt: new Date(),
      },
    });

    return res.status(200).json(newVote);
  } catch (error) {
    console.error('Failed to record vote:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
}
