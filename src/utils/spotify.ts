import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

interface SpotifyImage {
  url: string;
}

interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  access_token?: string; // Assuming access_token might be optional, adjust as necessary
}

export default function Spotify<P extends SpotifyProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: "spotify",
    name: "Spotify",
    type: "oauth",
    authorization: "https://accounts.spotify.com/authorize?scope=user-read-email",
    token: "https://accounts.spotify.com/api/token",
    userinfo: "https://api.spotify.com/v1/me",
    profile(profile: SpotifyProfile) {
      return {
        id: profile.id,
        name: profile.display_name,
        email: profile.email,
        image: profile.images?.[0]?.url,
        accessToken: profile.access_token,
      };
    },
    options,
    style: { logo: "/spotify.svg", text: "#fff", bg: "#000" },
  };
}
