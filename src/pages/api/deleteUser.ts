// pages/api/deleteUser.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { SmazUsery } from 'src/server/api/smazusery';
interface RequestBody {
    userId: string; // Adjust the type as necessary
  }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
if (req.method === 'POST') {
    try {
        const { userId } = req.body as RequestBody;

        // Call deleteUser function from smazusery.ts
        const smazUsery = new SmazUsery({ userList: [] }); // Provide the required argument
        const deletedUserId = await smazUsery.deleteUser(userId);

        // Send response
        res.status(200).json({ success: true, deletedUserId });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, error: 'Error deleting user' });
    }
} else {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
}
