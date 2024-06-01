// pages/api/vote.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, song, voteType, artist, imageUrl } = req.body;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingVote = await db.vote.findFirst({
        where: {
          userId,
          createdAt: {
            gte: today,
          },
        },
      });

      if (existingVote) {
        res.status(400).json({ error: 'You have already voted today.' });
        return;
      }

      const vote = await db.vote.create({
        data: {
          userId,
          song,
          voteType,
          artist,
          imageUrl,
        },
      });
      res.status(200).json(vote);
    } catch (error) {
      console.error('Error while creating vote:', error);
      res.status(500).json({ error: 'Failed to create vote' });
    }
  } else if (req.method === 'GET') {
    const { userId } = req.query;

    if (typeof userId !== 'string') {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    try {
      const lastVote = await db.vote.findFirst({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.status(200).json({ lastVoteDate: lastVote?.createdAt ?? null });
    } catch (error) {
      console.error('Error while fetching last vote date:', error);
      res.status(500).json({ error: 'Failed to fetch last vote date' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
