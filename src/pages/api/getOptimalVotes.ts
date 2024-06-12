import { NextApiRequest, NextApiResponse } from 'next';
import { db } from 'lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const offset = (page - 1) * limit;

      const votes = await db.vote.findMany({
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalVotes = await db.vote.count();

      res.status(200).json({ votes, totalVotes });
    } catch (error) {
      console.error('Error fetching votes:', error);
      res.status(500).json({ success: false, error: 'Error fetching votes' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
}
