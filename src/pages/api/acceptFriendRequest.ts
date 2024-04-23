import { db } from 'lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
    if (req.method === 'POST') {
    const { friendRequestId } = req.body;
    const {receiverId} = req.body;
    console.log(req.body);
    try {
      const acceptFriendRequest = await db.friendRequest.update({
        where: { senderId: friendRequestId, receiverId: receiverId},
        data: { status: 'accepted' }
      });

      const addFriend = await db.friendship.create({
        data: {
          userId: acceptFriendRequest.senderId,
          friendId: acceptFriendRequest.receiverId
        }
      });
      
      res.status(200).json(addFriend);
    } catch (error) {
      res.status(500).json({ error: "Failed to accept friend request."});
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
