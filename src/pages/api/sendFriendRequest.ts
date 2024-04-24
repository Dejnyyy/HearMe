import { db } from 'lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
  if (req.method === 'POST') {
    const senderId = req.body.senderId; 
    const receiverId = req.body.receiverId;
    if (!senderId || !receiverId) {
      return res.status(400).json({ error: "Sender ID and Receiver ID are required." });
    }    
        try {
      const newFriendRequest = await db.friendRequest.create({
        data: {
          senderId,
          receiverId,
          status: 'pending'
        }
      });
      res.status(200).json(newFriendRequest);
    } catch (error) {
      res.status(500).json({ error: "Failed to send friend request." });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
