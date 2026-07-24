/**
 * Where each ecosystem entity's own section lives on the landing page.
 *
 * Deliberately a plain module rather than part of `SelectionContext`: the
 * footer and the page composition are server components and need this too, and
 * anything exported from a `'use client'` file cannot be called on the server.
 *
 * SULTAN keeps the bare `#sultan` anchor because it has a full deep-dive
 * section of its own; the rest share the chapter band.
 */
export const anchorFor = (id: string): string => (id === 'sultan' ? 'sultan' : `entity-${id}`);
