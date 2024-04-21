import { db } from 'lib/prisma'; // Adjust this import according to your setup
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse) {
  if (req.method === 'POST') {
    const { friendRequestId } = req.body;
    try {
      const declineFriendRequest = await db.friendRequest.update({
        where: { id: friendRequestId },
        data: { status: 'declined' }
      });
      res.status(200).json(declineFriendRequest);
    } catch (error) {
      res.status(500).json({ error: "Failed to decline friend request." });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
