'use server';

import { cookies } from 'next/headers';

export async function checkAdmin() {
  const cookie = await cookies();
  const passwordGate = cookie.get('password-gate');

  return passwordGate?.value === process.env.PASSWORD_GATE_SECRET;
}
