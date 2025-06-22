'use server';

import { cookies } from 'next/headers';

export const validateAdminPassword = async (password: string) => {
  if (password !== process.env.PASSWORD_GATE_SECRET) return false;

  const cookie = await cookies();
  cookie.set({
    name: 'password-gate',
    value: password,
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return true;
};
