import { db } from 'lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const senderId = req.body.senderId; 
    const receiverId = req.body.receiverId;
    try {
      // Find the first pending friend request where the user is the receiver
      const friendRequest = await db.friendRequest.findFirst({
        where: {
            receiverId: receiverId,
          senderId: senderId,
          status: 'pending'
        }
      })
      console.log(req.body)
      console.log(friendRequest);

      if (!friendRequest) {
        res.status(404).json({ error: "Pending friend request not found." });
        return;
      }

      // Update the friend request to 'declined'
      const declineFriendRequest = await db.friendRequest.update({
        where: { id: friendRequest.id },
        data: { status: 'declined' }
      });

      res.status(200).json(declineFriendRequest);
    } catch (error) {
      res.status(500).json({ error: "Failed to accept friend request." });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
