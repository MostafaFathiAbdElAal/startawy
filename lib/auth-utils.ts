import { jwtVerify } from 'jose';

export async function verifyAuth(token: string | undefined) {
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as { id: string; email: string; role: string };
  } catch (error) {
    console.error('JWT Verification Failed:', error);
    return null;
  }
}
