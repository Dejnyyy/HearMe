import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { voteId } = req.query;

    if (!voteId || Array.isArray(voteId) || isNaN(Number(voteId))) {
      return res.status(400).json({ success: false, error: 'Invalid vote ID' });
    }

    try {
      const id = parseInt(voteId as string, 10);

      // Start a transaction
      await db.$transaction(async (prisma) => {
        // Retrieve the vote data
        const vote = await prisma.vote.findUnique({
          where: { id },
        });

        if (!vote) {
          throw new Error('Vote not found');
        }

        // Delete the vote from the Vote table
        await prisma.vote.delete({
          where: { id },
        });

        // Insert a record into the DeletedVote table with the same data
        await prisma.deletedVote.create({
          data: {
            originalId: vote.id,
            createdAt: vote.createdAt,
            song: vote.song,
            artist: vote.artist,
            voteType: vote.voteType,
            userId: vote.userId,
          },
        });

        console.log('Deleted vote:', vote);
      });

      res.status(200).json({ success: true, message: 'Vote deleted successfully' });
    } catch (error) {
      console.error('Error deleting vote:', error);
      res.status(500).json({ success: false, error: 'Error deleting vote' });
    } finally {
      await db.$disconnect();
    }
  } else {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
}
