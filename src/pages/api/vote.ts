// pages/api/vote.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../server/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, song, voteType, artist, imageUrl } = req.body;

    try {
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
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
