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
          where: { id: user.id as string }
        });

        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            isAdmin: fullUser?.isAdmin?? false,
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
      authorization: "https://accounts.spotify.com/authorize?scope=user-read-email,user-read-private",
    })
  ],
  events: {
    async signIn(message) {
      console.log('Sign in message:', message);
    },
    async signOut(message) {
      console.log('Sign out message:', message);
    },
    async createUser(message) {
      console.log('Create user message:', message);
    },
  },
  debug: true,
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
