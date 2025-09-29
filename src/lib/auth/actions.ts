'use server';

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
    return { success: false, message: 'Credenciales inválidas. (Code: EMPTY_FIELDS)' };
  }

  const user = credentials.find(cred => cred.username === username);

  if (!user) {
    return { success: false, message: 'Credenciales inválidas. (Code: USER_NOT_FOUND)' };
  }

  // Temporary plaintext comparison for debugging
  const isPasswordValid = password === user.password;

  if (!isPasswordValid) {
    return { success: false, message: 'Credenciales inválidas. (Code: INVALID_PASSWORD)' };
  }

  session.username = user.username;
  session.isLoggedIn = true;
  await session.save();

  return { success: true, message: 'Login successful.' };
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  await session.save();
}