import { DefaultSession, User } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isAdmin?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    isAdmin?: boolean;
  }
}
