// pages/api/deleteUser.ts

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { userId } = req.body;
    
      // Zde provádíme operace pro smazání uživatele z databáze nebo jiné operace na serveru
      // Například:
      // await deleteUserData(userId);

      res.status(200).json({ message: 'Uživatel byl úspěšně smazán.' });
    } catch (error) {
      res.status(500).json({ message: 'Došlo k chybě při mazání uživatele.' });
    }
  } else {
    res.status(405).json({ message: 'Metoda není povolena.' });
  }
}
