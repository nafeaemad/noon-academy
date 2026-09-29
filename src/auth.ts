import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = String(credentials?.email || "").trim().toLowerCase();
      const password = String(credentials?.password || "");
      if (!email || !password) return null;

      const rows = await db.select().from(users).where(eq(users.email, email));
      const user = rows[0];
      if (!user || !user.passwordHash) return null;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      return { id: String(user.id), name: user.name, email: user.email, image: user.imageUrl || undefined };
    },
  }),
];

// Google sign-in only turns on once the admin sets these in Vercel's environment
// variables — no code changes needed, but it stays hidden until configured.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const email = user.email.toLowerCase();
        const existing = await db.select().from(users).where(eq(users.email, email));
        if (existing[0]) {
          await db
            .update(users)
            .set({ googleId: account.providerAccountId, imageUrl: user.image || existing[0].imageUrl })
            .where(eq(users.id, existing[0].id));
          user.id = String(existing[0].id);
        } else {
          const [created] = await db
            .insert(users)
            .values({
              name: user.name || email.split("@")[0],
              email,
              provider: "google",
              googleId: account.providerAccountId,
              imageUrl: user.image || null,
            })
            .returning();
          user.id = String(created.id);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) session.user.id = String(token.userId);
      return session;
    },
  },
});
