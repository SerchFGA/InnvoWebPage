'use server';

import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/session';
import credentials from '@/lib/credentials.json';

export async function login(formData: FormData) {
  const session = await getSession();
  
  const username = String(formData.get('username'));
  const password = String(formData.get('password'));

  if (!username || !password) {
    return { success: false, message: 'El usuario y la contraseña son obligatorios.' };
  }

  const user = credentials.find(cred => cred.username === username);

  if (!user) {
    return { success: false, message: 'Invalid credentials.' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return { success: false, message: 'Invalid credentials.' };
  }

  session.username = user.username;
  session.isLoggedIn = true;
  await session.save();

  return { success: true };
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  await session.save();
}
