import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from "next-auth/react";
import { db } from "lib/prisma"; // Assuming you're using Prisma

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
console.log(session);
  try {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        favoriteArtist: true,
        favoriteAlbum: true, // Ujistěte se, že přidáte i toto pole
      },
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
}  
