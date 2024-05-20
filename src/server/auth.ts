import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { env } from "~/env.mjs";
import { db } from "~/server/db";
import SpotifyProvider from "next-auth/providers/spotify";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      isAdmin?: boolean;
    };
  }

  interface User {
    id: string;
    isAdmin?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: async ({ session, user }) => {
      try {
        const fullUser = await db.user.findUnique({
          where: { id: user.id }
        });

        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            isAdmin: fullUser?.isAdmin?? false,  // Ensure isAdmin is included
          },
        };
      } catch (error) {
        console.error("Error in session callback:", error);
        return session;
      }
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    SpotifyProvider({
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      authorization: "https://accounts.spotify.com/authorize?scope=user-read-currently-playing,user-read-recently-played,user-top-read,user-read-email,user-read-private,user-library-read,user-library-modify,user-read-playback-state,user-modify-playback-state",
    })
  ],
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
