// File: pages/api/getUserByUserId.ts

import { NextApiRequest, NextApiResponse } from 'next';
import {db} from 'lib/prisma';

const findUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId } = req.query; 

  if (!userId) {
    res.status(400).json({ error: 'No userId provided' });
    return;
  }

  try {
    const user = await db.user.findUnique({
      where: {
        id: String(userId),
       }, 
       select: {
        id: true,
        name: true,
        email: true,
        image: true, 
        favoriteAlbum: true,
        favAlbImg: true,
        favoriteArtist: true,
        favArtImg: true,
        isAdmin: true
      }
    });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Request error', error);
    res.status(500).json({ error: 'Error retrieving user information' });
  }
};

export default findUser;
