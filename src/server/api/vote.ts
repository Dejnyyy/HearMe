import express, { Request, Response } from 'express';
import { db } from '../db';

const prisma = db;
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

interface VoteData {
    userId: string;
    song: string;
    voteType: string;
    artist: string; 
  }
  
app.post('/api/vote', async (req: Request, res: Response) => {
  const { userId, song, voteType, artist }: VoteData = req.body;

try {
    console.log('Creating vote:', { userId, song, voteType, artist });
    const vote = await prisma.vote.create({
        data: {
            userId,
            song,
            voteType,
            artist
        }
    });
    res.json(vote);
} catch (error) {
    console.error('Error while creating vote:', error);
    res.status(500).json({ error: 'Failed to create vote' });
}
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
