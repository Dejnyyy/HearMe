import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../server/db';

const prisma = db;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, song, voteType, artist } = req.body;

    try {
      console.log('Creating vote:', { userId, song, voteType, artist });
      const vote = await prisma.vote.create({
        data: {
          userId,
          song,
          voteType,
          artist
        }
      });
      res.json(vote);
    } catch (error) {
      console.error('Error while creating vote:', error);
      res.status(500).json({ error: 'Failed to create vote' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
