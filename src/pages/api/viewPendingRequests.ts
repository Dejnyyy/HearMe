import { db } from 'lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
//to co posilam ja

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'UserId is required' });
    }
    
    try {
      const pendingRequests = await db.friendRequest.findMany({
        where: {
          senderId: userId,
          status: 'pending'
        },
        include: {
          receiver: true // This will include details of the receiver in the response
        }
      });
      console.log("requesty co ja poslal", pendingRequests);
      res.status(200).json(pendingRequests); // Always send a response back
    } catch (error) {
      console.error('Failed to fetch pending friend requests:', error);
      res.status(500).json({ error: "Failed to fetch pending friend requests." });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
