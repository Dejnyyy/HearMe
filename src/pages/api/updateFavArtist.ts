import type { NextApiRequest, NextApiResponse } from 'next';
import {db} from 'lib/prisma';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, artistName, favArtImg } = req.body;

    try {
      const user = await db.user.update({
        where: { id: userId },
        data: { favoriteArtist: artistName, favArtImg: favArtImg},
      });

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update favorite artist" });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
