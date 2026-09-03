const ADMIN_USER = import.meta.env.VITE_ADMIN_USER ?? "admin";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "Admin123*";

export function verifyCredentials(
  username: string,
  password: string,
): boolean {
  return username === ADMIN_USER && password === ADMIN_PASSWORD;
}
