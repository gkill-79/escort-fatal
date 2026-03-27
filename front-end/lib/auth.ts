import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// We don't need prisma or bcrypt here anymore!
// import { fetchApi } from "./api-client"; // This might cause issues if not absolute or if it uses env vars differently
// Instead, I'll use a local fetch with the server-side API URL

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email ou Pseudo", type: "text" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Veuillez renseigner vos identifiants");
        }

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: credentials.identifier,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Identifiants incorrects");
          }

          const user = await res.json();
          return user;
        } catch (error: any) {
          throw new Error(error.message || "Erreur de connexion au serveur");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
});
