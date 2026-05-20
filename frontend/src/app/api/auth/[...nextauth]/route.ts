import NextAuth from 'next-auth'; import CredentialsProvider from 'next-auth/providers/credentials';
const handler = NextAuth({
  providers: [CredentialsProvider({ name: 'credentials', credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Пароль', type: 'password' } }, async authorize(credentials) { const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) }); const data = await res.json(); if (res.ok && data.user) return { id: data.user.id, email: data.user.email, role: data.user.role, token: data.token }; return null; } })],
  callbacks: { async jwt({ token, user }) { if (user) { token.id = user.id; token.role = (user as any).role; token.accessToken = (user as any).token; } return token; }, async session({ session, token }) { session.user.id = token.id; session.user.role = token.role; session.accessToken = token.accessToken; return session; } },
  pages: { signIn: '/login' }, session: { strategy: 'jwt' }
});
export { handler as GET, handler as POST };
