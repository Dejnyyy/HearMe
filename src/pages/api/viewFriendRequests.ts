import { db } from 'lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next'
//to co nekdo posila mne

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    try {
      const pendingFriendRequests = await db.friendRequest.findMany({
        where: {
          receiverId: userId,
          status: 'pending'
        }
      });
      res.status(200).json(pendingFriendRequests);
      console.log("requesty co mi dosly",pendingFriendRequests)
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending friend requests." });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
