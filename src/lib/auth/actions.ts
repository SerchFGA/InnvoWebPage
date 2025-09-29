'use server';

import bcrypt from 'bcrypt';
import { getSession } from '@/lib/session';
import credentials from '@/lib/credentials.json';

export async function login(
  prevState: { success: boolean; message: string } | undefined,
  formData: FormData
) {
  const session = await getSession();
  
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '').trim();

  if (!username || !password) {
    return { success: false, message: 'El usuario y la contraseña son obligatorios.' };
  }

  // Find user (case-sensitive)
  const user = credentials.find(cred => cred.username === username);

  if (!user) {
    console.error(`[Auth] Login failed: User not found for username: "${username}"`);
    return { success: false, message: 'Invalid credentials.' };
  }

  try {
    // DIAGNOSTIC LOGGING
    console.error(`[Auth] ATTEMPTING LOGIN FOR: "${username}"`);
    console.error(`[Auth] PASSWORD RECEIVED: "${password}" (length: ${password.length})`);
    console.error(`[Auth] HASH FROM DB: "${user.passwordHash}"`);

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      console.error(`[Auth] bcrypt.compare FAILED for user: "${username}".`);
      return { success: false, message: 'Invalid credentials. (Code: BCRYPT_FAIL)' };
    }

    // Set session
    session.username = user.username;
    session.isLoggedIn = true;
    await session.save();

    console.log(`[Auth] Login successful for user: "${username}"`);
    return { success: true, message: 'Login successful.' };

  } catch (error) {
    console.error('[Auth] An unexpected error occurred during bcrypt.compare:', error);
    return { success: false, message: 'An unexpected server error occurred.' };
  }
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  await session.save();
}
