import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res
        .status(500)
        .json({ error: "Spotify credentials not configured" });
    }

    const base64Credentials = Buffer.from(
      `${clientId}:${clientSecret}`,
    ).toString("base64");
    const tokenEndpoint = "https://accounts.spotify.com/api/token";

    const response = await axios.post(
      tokenEndpoint,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    res.status(200).json({ accessToken: response.data.access_token });
  } catch (error) {
    console.error("Error obtaining access token:", error);
    res.status(500).json({ error: "Failed to obtain access token" });
  }
}
