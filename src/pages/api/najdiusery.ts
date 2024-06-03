import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@prisma/client';
import { db } from 'lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const users: User[] = await db.user.findMany();
        console.log('Fetching users:', users);
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, error: 'Error fetching users' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
}
