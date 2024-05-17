import { NextApiRequest, NextApiResponse } from 'next';
import { db } from 'lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { voteId } = req.query;

    if (!voteId || Array.isArray(voteId) || isNaN(Number(voteId))) {
      return res.status(400).json({ success: false, error: 'Invalid vote ID' });
    }

    try {
      const id = parseInt(voteId as string, 10);
      const deletedVote = await db.vote.delete({
        where: { id },
      });

      console.log('Deleted vote:', deletedVote);
      res.status(200).json({ success: true, message: 'Vote deleted successfully' });
    } catch (error) {
      console.error('Error deleting vote:', error);
      res.status(500).json({ success: false, error: 'Error deleting vote' });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
}
