'use server';

export async function getAutoResponse() {
  await new Promise((res) => setTimeout(res, 1500));
  return 'test';
}
