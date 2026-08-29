const ADMIN_USER = 'profe';
const ADMIN_PASSWORD_HASH = '00c1765ef09cc29713dea57d40ce03bf85a06869c4d936ab4b41012471830fcf';

async function sha256(value: string): Promise<string> {
  const enc = new TextEncoder().encode(value);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyCredentials(usuario: string, contrasena: string): Promise<boolean> {
  if (usuario !== ADMIN_USER || !contrasena) return false;
  const digest = await sha256(contrasena);
  return digest === ADMIN_PASSWORD_HASH;
}