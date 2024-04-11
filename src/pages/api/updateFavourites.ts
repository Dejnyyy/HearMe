// pages/api/updateFavorites.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from "next-auth/react";
import { db } from "lib/prisma"; // Assuming you're using Prisma

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { userId, favoriteArtist, favoriteAlbum } = req.body;

  try {
    const updateUser = await db.user.update({
      where: { id: userId },
      data: {
        favoriteArtist,
        favoriteAlbum,
      },
    });
    res.status(200).json(updateUser);
  } catch (error) {
    console.error('Failed to update user favorites:', error);
    res.status(500).json({ message: 'Failed to update favorites' });
  }
}
