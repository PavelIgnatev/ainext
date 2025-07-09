'use server';

import { cookies } from 'next/headers';

export const validateAdminPassword = async (password: string) => {
  if (password !== "G_-N'j*5qzXgd^=8Y~wRem") return false;

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
