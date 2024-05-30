// pages/api/getVotes.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from 'lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

interface Vote {
  id: number;
  createdAt: string;
  song: string;
  artist: string;
  voteType: string;
  imageUrl?: string;
  userId: string;
}

interface VoteWithCount extends Vote {
  voteCount: number;
}

const getVotes = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());

      // Fetch votes from the database for the current date
      const votes = await db.vote.findMany({
        where: {
          createdAt: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Calculate vote counts
      const voteCounts = votes.reduce((acc, vote) => {
        const key = `${vote.song}-${vote.artist}`;
        if (!acc[key]) {
          acc[key] = {
            ...vote,
            voteCount: 0,
          };
        }
        acc[key].voteCount += 1;
        return acc;
      }, {} as Record<string, VoteWithCount>);

      const votesWithCounts = Object.values(voteCounts);
      res.status(200).json(votesWithCounts);
    } catch (error) {
      console.error('Error fetching votes:', error);
      res.status(500).json({ success: false, error: 'Error fetching votes' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
};

export default getVotes;
