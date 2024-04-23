import { getSession } from "next-auth/react";
import {db} from 'lib/prisma'; // Adjust the import according to your setup
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { friendRequestId } = req.body;
    if (!friendRequestId) {
        return res.status(400).json({ error: "Friend request ID is required." });
    }

    try {
        const updatedFriendRequest = await db.friendRequest.update({
            where: { id: friendRequestId },
            data: { status: 'declined' }
        });
        res.status(200).json(updatedFriendRequest);
    } catch (error) {
        console.error('Failed to decline friend request:', error);
        res.status(500).json({ error: 'Failed to decline friend request.' });
    }
}
