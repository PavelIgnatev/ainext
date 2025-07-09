'use server';

import { cookies } from 'next/headers';

export async function checkAdmin() {
  const cookie = await cookies();
  const passwordGate = cookie.get('password-gate');

  return passwordGate?.value === "G_-N'j*5qzXgd^=8Y~wRem";
}
