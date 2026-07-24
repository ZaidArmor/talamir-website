import { createHash } from 'node:crypto';

/**
 * Abuse guards that need no external service.
 *
 * A fixed-window rate limiter and a short-window deduper, both backed by an
 * in-process Map. On a serverless platform each instance keeps its own counters,
 * so this is a per-instance floor, not a global quota — enough to blunt a naive
 * flood and a double-click, and documented as such. A global limit (Vercel KV
 * or similar) is a later, optional hardening; the interface here does not change
 * when that is added.
 *
 * Nothing stored here is personal data: the rate key is an opaque hash, and the
 * dedupe key is a hash of the submission, never the submission itself.
 */

export interface RateLimiter {
  /** Records a hit and reports whether it is within the limit. */
  hit(key: string): { allowed: boolean };
}

export function createRateLimiter(max: number, windowMs: number): RateLimiter {
  const buckets = new Map<string, number[]>();

  return {
    hit(key) {
      const now = Date.now();
      const cutoff = now - windowMs;
      const recent = (buckets.get(key) ?? []).filter((t) => t > cutoff);
      recent.push(now);
      buckets.set(key, recent);

      // Opportunistic prune so the map cannot grow without bound.
      if (buckets.size > 5000) {
        for (const [k, times] of buckets) {
          if (times.every((t) => t <= cutoff)) buckets.delete(k);
        }
      }

      return { allowed: recent.length <= max };
    },
  };
}

export interface Deduper {
  /** Returns true if this key was already seen inside the window. */
  seen(key: string): boolean;
}

export function createDeduper(windowMs: number): Deduper {
  const lastSeen = new Map<string, number>();

  return {
    seen(key) {
      const now = Date.now();
      const cutoff = now - windowMs;
      const previous = lastSeen.get(key);
      lastSeen.set(key, now);

      if (lastSeen.size > 5000) {
        for (const [k, t] of lastSeen) if (t <= cutoff) lastSeen.delete(k);
      }

      return previous !== undefined && previous > cutoff;
    },
  };
}

/** A stable, non-reversible key for deduping a submission. */
export function dedupeKey(parts: {
  fullName: string;
  phoneOrEmail: string;
  companyName: string;
}): string {
  const basis = `${parts.fullName}|${parts.phoneOrEmail}|${parts.companyName}`.toLowerCase();
  return createHash('sha256').update(basis).digest('hex');
}

/** A stable, non-reversible key for rate limiting by client. */
export function clientKey(ip: string | null, host: string | null): string {
  return createHash('sha256')
    .update(`${ip ?? 'unknown'}|${host ?? 'unknown'}`)
    .digest('hex');
}

/**
 * Origin/host validation.
 *
 * A cross-site POST from a page we did not serve is rejected. `Origin` is
 * preferred; some legitimate same-origin posts omit it, so `Referer` and then
 * the `Host` header are consulted before giving up.
 */
export function isAllowedOrigin(
  headers: { origin: string | null; referer: string | null; host: string | null },
  allowedHosts: string[],
): boolean {
  const hostOf = (value: string | null): string | null => {
    if (!value) return null;
    try {
      return new URL(value).hostname.toLowerCase();
    } catch {
      // `Host` header is a bare host[:port], not a URL.
      return value.split(':')[0].toLowerCase();
    }
  };

  const candidates = [headers.origin, headers.referer].map(hostOf).filter(Boolean) as string[];
  if (candidates.length > 0) return candidates.every((host) => allowedHosts.includes(host));

  const host = hostOf(headers.host);
  return host !== null && allowedHosts.includes(host);
}

/** Honeypot: a field no human sees. If anything filled it, it is a bot. */
export const isHoneypotTripped = (value: unknown): boolean =>
  typeof value === 'string' && value.trim().length > 0;
