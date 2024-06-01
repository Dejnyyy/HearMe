// pages/api/getUserVotes.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (req.method === 'GET') {
    try {
      const votes = await prisma.vote.findMany({
        where: { userId: String(userId) },
        orderBy: { createdAt: 'asc' },
      });

      res.status(200).json(votes);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
