import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
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
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.identifier as string },
                { username: credentials.identifier as string }
              ]
            },
          });

          if (!user || !user.passwordHash) {
            throw new Error("Aucun compte associé à cet email ou pseudo");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.passwordHash);

          if (!isPasswordValid) {
            throw new Error("Mot de passe incorrect");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.username,
            role: user.role,
            username: user.username,
          } as any;
        } catch (error: any) {
          throw new Error(error.message || "Erreur lors de l'authentification");
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
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
});
