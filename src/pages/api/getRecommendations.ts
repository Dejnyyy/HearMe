import { type NextApiRequest, type NextApiResponse } from "next";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

export default async function getRecommendations(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1. Get user session
  const session = await getServerAuthSession({ req, res });
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // 2. Fetch the user's Spotify account to get the access token
    const account = await db.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "spotify",
      },
    });

    if (!account?.access_token) {
      return res
        .status(401)
        .json({ error: "No Spotify account linked or missing access token" });
    }

    // 3. Fetch user's top tracks from Spotify (short_term = approx last 4 weeks)
    // Alternatively, we could use recently-played, but top tracks often yield better "favorites" to vote on.
    const spotifyRes = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=30",
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
        },
      },
    );

    if (!spotifyRes.ok) {
      // If unauthorized (e.g. token expired), we might need the user to re-login
      if (spotifyRes.status === 401) {
        return res.status(401).json({
          error: "Spotify token expired. Please log out and back in.",
        });
      }
      return res.status(500).json({ error: "Failed to fetch from Spotify" });
    }

    const data = await spotifyRes.json();
    const tracks = data.items || [];

    // 4. Fetch the user's existing votes
    const existingVotes = await db.vote.findMany({
      where: {
        userId: session.user.id,
      },
    });

    // We'll normalize names to lower case for comparison just in case
    const votedSongs = existingVotes.map((v) => ({
      song: v.song.toLowerCase(),
      artist: v.artist.toLowerCase(),
    }));

    // 5. Filter out tracks they have already voted for
    const recommendedTracks = [];
    for (const track of tracks) {
      const trackName = track.name.toLowerCase();
      // Spotify returns an array of artists, we check the primary one
      const primaryArtist = track.artists[0]?.name.toLowerCase();

      const hasVoted = votedSongs.some(
        (v) => v.song === trackName && v.artist === primaryArtist,
      );

      if (!hasVoted) {
        recommendedTracks.push({
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name,
          imageUrl: track.album?.images[0]?.url || null,
          previewUrl: track.preview_url,
          spotifyUrl: track.external_urls?.spotify,
        });
      }

      // Limit to 10 recommendations to show
      if (recommendedTracks.length >= 10) break;
    }

    return res.status(200).json({ recommendations: recommendedTracks });
  } catch (error) {
    console.error("Error in getRecommendations:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
