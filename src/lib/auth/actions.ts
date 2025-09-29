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
    return { success: false, message: 'El usuario y la contraseña son obligatorios. (Code: EMPTY_FIELDS)' };
  }

  const user = credentials.find(cred => cred.username === username);

  if (!user) {
    return { success: false, message: 'Credenciales inválidas. (Code: USER_NOT_FOUND)' };
  }

  try {
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return { success: false, message: 'Credenciales inválidas. (Code: BCRYPT_FAIL)' };
    }

    session.username = user.username;
    session.isLoggedIn = true;
    await session.save();

    return { success: true, message: 'Login successful.' };

  } catch (error) {
    console.error('[Auth] An unexpected error occurred during login:', error);
    return { success: false, message: 'Ocurrió un error inesperado en el servidor. (Code: UNEXPECTED_ERROR)' };
  }
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  await session.save();
}
