import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import {db} from 'lib/prisma';

interface UserDetails {
  id: string;
  name: string;
  image?: string;
}

interface VoteCount {
  song: string;
  artist: string;
  voteCount: number;
  users: UserDetails[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VoteCount[] | { error: string }>
) {
  // Check for user session
  const session = await getSession({ req });
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;

  try {
    // Fetch friendships where the user is either the user or the friend
    const friendships = await db.friendship.findMany({
      where: {
        OR: [
          { userId: userId },
          { friendId: userId }
        ],
      },
      select: {
        userId: true,
        friendId: true,
      }
    });

    // Extract all unique user IDs from friendships
    const allUserIds = new Set<string>(friendships.flatMap(f => [f.userId, f.friendId]));
    allUserIds.add(userId);  // Include the current user's votes as well

    // Fetch votes from these users
    const votes = await db.vote.findMany({
      where: {
        userId: {
          in: Array.from(allUserIds),
        },
      },
      include: {
        user: true,
      },
    });

    // Aggregate votes by song and artist
    const voteCounts: Record<string, VoteCount> = votes.reduce((acc, vote) => {
      const key = `${vote.song}-${vote.artist}`;
      if (!acc[key]) {
        acc[key] = {
          song: vote.song,
          artist: vote.artist,
          voteCount: 0,
          users: [],
        };
      }
      acc[key].voteCount++;
      acc[key].users.push({
        id: vote.user.id,
        name: vote.user.name,
        image: vote.user.image,
      });
      return acc;
    }, {});

    // Convert the object into an array of results
    const results = Object.values(voteCounts);

    res.status(200).json(results);
  } catch (error) {
    console.error('Failed to fetch and count votes:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
