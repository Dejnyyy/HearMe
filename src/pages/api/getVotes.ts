// pages/api/getVotes.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from 'lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const votes = await db.vote.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
      console.log('Fetching votes:', votes);
      res.status(200).json(votes);
    } catch (error) {
      console.error('Error fetching votes:', error);
      res.status(500).json({ success: false, error: 'Error fetching votes' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
}
