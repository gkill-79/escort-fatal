import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

type UserRole = "MEMBER" | "ESCORT" | "ADMIN";

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

        const identifier = credentials.identifier as string;
        const password = credentials.password as string;

        // Find user by email or username
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { username: identifier }],
          },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Identifiants incorrects");
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          throw new Error("Identifiants incorrects");
        }

        if (!user.isActive) {
          throw new Error("Ce compte est désactivé");
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Intial sign in
      if (user) {
        token.id = user.id;
        token.role = (user as any).role as UserRole;
        token.username = (user as any).username as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
});
