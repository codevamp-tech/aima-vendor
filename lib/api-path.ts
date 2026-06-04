/**
 * Central API path helper.
 *
 * Reads NEXT_PUBLIC_BASE_PATH from env so every fetch() call
 * automatically gets the correct prefix in production
 * (e.g. /account) while staying clean (empty prefix) in local dev.
 *
 * Usage:
 *   import { apiUrl } from '@/lib/api-path';
 *   fetch(apiUrl('/api/register'), { method: 'POST', ... })
 */
export const BASE_PATH: string = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Prepend the base path to an API route. */
export function apiUrl(path: string): string {
  return `${BASE_PATH}${path}`;
}
