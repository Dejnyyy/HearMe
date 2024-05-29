import { NextApiRequest, NextApiResponse } from 'next';
import { db } from 'lib/prisma'; 

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
  try {
    const votes = await db.vote.findMany({
      include: {
        user: true,
      },
    });

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
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default getVotes;
