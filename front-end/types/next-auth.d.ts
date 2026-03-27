import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: "MEMBER" | "ESCORT" | "ADMIN";
      username: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: "MEMBER" | "ESCORT" | "ADMIN";
    username: string;
  }
}
