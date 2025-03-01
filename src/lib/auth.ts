// src/lib/auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { compare } from "@/lib/bcrypt";
import NextAuth from "next-auth";
// Perluas tipe Session dan JWT untuk user
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: {
    ...PrismaAdapter(prisma),
    createUser: async (data: any) => {
      // Handle OAuth user creation without password
      return prisma.user.create({
        data: {
          ...data,
          role: "user",
          emailVerified: new Date(), // Auto-verify OAuth users
          password: data.password || null, // Allow null for OAuth users
        },
      });
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET, // Pastikan ini ada
  debug: process.env.NODE_ENV === "development", // Aktifkan debug mode di development
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Credentials missing");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            select: {
              id: true,
              name: true,
              email: true,
              password: true,
              role: true, // Tambahkan ini
            },
          });

          if (!user) {
            console.log("User not found");
            return null;
          }

          if (user.password) {
            const passwordMatch = await compare(credentials.password, user.password);
            if (!passwordMatch) {
              console.log("Password doesn't match");
              return null;
            }
          }

          console.log("Authentication successful");
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session, user }) {
      const dbUser = await prisma.user.findUnique({
        where: { id: token.sub || user?.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
        },
      });
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.role = token.role;
      }
      return {
        ...session,
        user: {
          ...session.user,
          ...dbUser,
          role: dbUser?.role || token.role,
        },
      };
    },
    async jwt({ token, user, trigger, session }) {
      // Handle update session jika diperlukan
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }

      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
export const getAuthSession = () => getServerSession(authOptions);

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
