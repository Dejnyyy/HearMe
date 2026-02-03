import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userId, imageUrl } = req.body;

  if (!userId || !imageUrl) {
    return res.status(400).json({ message: "Missing userId or imageUrl" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
    });
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile image:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
