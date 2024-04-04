// pages/api/updateFavorites.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { db } from 'lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const session = await getSession({ req });
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { userId, favoriteAlbum, favoriteArtist } = req.body;

  // Make sure the user ID from the body matches the user ID from the session for security
  if (userId !== session.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const user = await db.user.update({
      where: { id: userId },
      data: { favoriteAlbum, favoriteArtist },
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error('Failed to update user:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
