import { db } from 'lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = session.user.id;
  const fetchLastVote = req.query.last === 'true';
  const fetchFriendsLastVotes = req.query.friends === 'true'; // Query to get friends' votes

  try {
    if (fetchLastVote) {
      // Fetch the current user's last vote
      const lastVote = await db.vote.findFirst({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!lastVote) {
        return res.status(404).json({ error: 'No votes found' });
      }

      return res.status(200).json(lastVote);
    } else if (fetchFriendsLastVotes) {
      // Fetch the current user's friends
      const friends = await db.friendship.findMany({
        where: {
          userId: userId,  // Get friends where the user is the current user
        },
        select: {
          friendId: true,
        },
      });

      const friendIds = friends.map(f => f.friendId); // Extract friend IDs

      if (friendIds.length === 0) {
        return res.status(404).json({ error: 'No friends found' });
      }

      // Fetch the last vote for each friend using Promise.all for efficient parallel fetching
      const lastVotes = await Promise.all(friendIds.map(async (friendId) => {
        return await db.vote.findFirst({
          where: { userId: friendId },
          orderBy: { createdAt: 'desc' },
        });
      }));

      // Filter out any friends who may not have any votes
      const filteredLastVotes = lastVotes.filter(vote => vote !== null);

      if (filteredLastVotes.length === 0) {
        return res.status(404).json({ error: 'No votes found for friends' });
      }

      return res.status(200).json(filteredLastVotes);
    } else {
      // Fetch all votes for the current user
      const votes = await db.vote.findMany({
        where: {
          userId: userId,
        },
      });

      return res.status(200).json(votes);
    }
  } catch (error) {
    console.error('Failed to fetch votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
}
