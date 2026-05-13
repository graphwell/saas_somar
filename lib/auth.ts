import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcrypt';
import { NextAuthOptions } from 'next-auth';

const providers = [];

// Credentials (email + senha) — sempre ativo
providers.push(
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
        where: { email: credentials.email },
      });

      if (!user || !user.password) {
        throw new Error('Usuário não encontrado ou sem senha configurada.');
      }

      const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
      if (!isPasswordCorrect) throw new Error('Senha incorreta.');

      return { id: user.id, email: user.email, name: user.name, role: user.role };
    },
  })
);

// Google OAuth — só ativo se as variáveis estiverem configuradas
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'USER',
        };
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role ?? 'USER';
      }

      // Após login Google, busca o role do DB
      if (account?.provider === 'google' && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      if (trigger === 'update' && session) {
        return { ...token, ...session.user };
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

    // Após login Google: cria subscription trial se for usuário novo
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const existing = await prisma.subscription.findFirst({
            where: { user: { email: user.email } },
          });
          if (!existing) {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email },
            });
            if (dbUser) {
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
                  systemPrompt: `Você é uma assistente virtual profissional. Responda de forma educada e eficiente para os clientes da empresa ${dbUser.name}.`,
                  temperature: 0.7,
                },
              });
            }
          }
        } catch (err) {
          console.error('GOOGLE_SIGNIN_SETUP:', err);
        }
      }
      return true;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
  },
};

export default NextAuth(authOptions);
