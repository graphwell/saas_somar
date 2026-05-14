import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcrypt';
import { NextAuthOptions } from 'next-auth';

const googleEnabled =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

export const authOptions: NextAuthOptions = {
  // Adapter apenas quando Google OAuth está ativo
  ...(googleEnabled ? { adapter: PrismaAdapter(prisma) } : {}),

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha obrigatórios.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
          select: { id: true, email: true, name: true, password: true, role: true },
        });

        if (!user) throw new Error('E-mail não encontrado.');
        if (!user.password) throw new Error('Esta conta usa login social. Entre com Google.');

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) throw new Error('Senha incorreta.');

        // Retorna role diretamente do banco — fonte de verdade
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),

    ...(googleEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            profile(profile) {
              return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                // Google OAuth NUNCA cria admin — sempre USER
                role: 'USER',
              };
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // Login por credentials — role vem do banco via authorize()
      if (user && account?.provider === 'credentials') {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { id: true, role: true },
        });
        token.id = dbUser?.id ?? user.id;
        token.role = dbUser?.role ?? 'USER';
      }

      // Login por Google — busca no banco, mas NUNCA permite role ADMIN via OAuth
      if (account?.provider === 'google' && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          // Google OAuth: força USER, mesmo que DB tenha ADMIN
          // Admin só pode logar via /admin/login com credentials
          token.role = dbUser.role === 'ADMIN' ? 'USER' : dbUser.role;
        } else {
          token.role = 'USER';
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },

    // Após login Google: configura novos usuários com subscription + agente
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
          if (dbUser) {
            const hasSub = await prisma.subscription.findUnique({ where: { userId: dbUser.id } });
            if (!hasSub) {
              await prisma.subscription.create({
                data: {
                  userId: dbUser.id,
                  planType: 'trial',
                  status: 'active',
                  messagesLimit: 100,
                  currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
              });
              await prisma.agent.create({
                data: {
                  userId: dbUser.id,
                  name: 'Atendente Padrão',
                  systemPrompt: `Você é uma assistente virtual profissional. Responda de forma educada e eficiente.`,
                  temperature: 0.7,
                },
              });
            }
          }
        } catch (err) {
          console.error('[GOOGLE_SIGNIN_SETUP]', err);
        }
      }
      return true;
    },
  },

  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
  },
};

export default NextAuth(authOptions);
