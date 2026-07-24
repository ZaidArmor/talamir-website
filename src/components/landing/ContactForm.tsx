'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { LandingCopy } from '@/content/landing';
import type { Locale } from '@/content/types';
import { href } from '@/lib/i18n';

/**
 * The enquiry form.
 *
 * It posts to `POST /api/contact` and reports only what the server confirms.
 * The server is fail-closed: until the intake is fully provisioned it answers
 * `intake_unconfigured`, and the form shows the honest "being set up" note —
 * never a fabricated success. When the backend is live, a submission shows the
 * real reference the server issued, and only after the lead is stored.
 *
 * On any failure the entered values are preserved (the inputs are uncontrolled,
 * so nothing is reset unless the submission actually succeeded) and a localized
 * message is shown. Nothing typed here is sent anywhere but this site's own API.
 */

type Result =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'success'; text: string }
  | { kind: 'error'; text: string };

const value = (entry: FormDataEntryValue | null): string =>
  typeof entry === 'string' ? entry : '';

export function ContactForm({ copy, locale }: { copy: LandingCopy; locale: Locale }) {
  const [result, setResult] = useState<Result>({ kind: 'idle' });
  const [token, setToken] = useState<string | null>(null);
  const noteRef = useRef<HTMLParagraphElement>(null);

  // Fetch a fresh, server-signed timing token when the form mounts. It binds
  // this rendered form to a server timestamp the client cannot forge; a missing
  // token simply means the server will decline, which is the safe outcome.
  useEffect(() => {
    let live = true;
    fetch('/api/contact', { method: 'GET' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { token?: string | null } | null) => {
        if (live && data && typeof data.token === 'string') setToken(data.token);
      })
      .catch(() => {
        /* No token — the server declines, which is the correct failure. */
      });
    return () => {
      live = false;
    };
  }, []);

  const selects = [
    { name: 'business', field: 'activityType', ...copy.contact.selects.business },
    { name: 'product', field: 'interestedProduct', ...copy.contact.selects.product },
    { name: 'timeline', field: 'timeframe', ...copy.contact.selects.timeline },
    { name: 'preference', field: 'preferredContactMethod', ...copy.contact.selects.preference },
  ];

  const announce = () => {
    // Move focus to the status line so assistive tech reads the outcome.
    requestAnimationFrame(() => noteRef.current?.focus());
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // A cheap client check avoids a round trip on an obviously incomplete form.
    // It is a convenience only; the server validates authoritatively.
    const required = [
      'name',
      'company',
      'city',
      'contact',
      'business',
      'product',
      'timeline',
      'preference',
    ];
    const missing = required.some((name) => value(data.get(name)).trim() === '');
    if (missing || data.get('consent') !== 'on') {
      setResult({ kind: 'error', text: copy.contact.incompleteNote });
      announce();
      return;
    }

    const payload = {
      locale,
      fullName: value(data.get('name')),
      companyName: value(data.get('company')),
      city: value(data.get('city')),
      phoneOrEmail: value(data.get('contact')),
      activityType: value(data.get('business')),
      interestedProduct: value(data.get('product')),
      timeframe: value(data.get('timeline')),
      preferredContactMethod: value(data.get('preference')),
      challenge: value(data.get('challenge')),
      consent: data.get('consent') === 'on',
      marketingConsent: data.get('marketingConsent') === 'on',
      pageUrl: typeof window !== 'undefined' ? window.location.href : '/',
      // Transport-only fields the server strips before validation.
      formToken: token,
      _hp: value(data.get('_hp')),
    };

    setResult({ kind: 'sending' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as
        | { success: true; referenceId: string }
        | { success: false; code: string; message: string };

      if (body.success) {
        setResult({
          kind: 'success',
          text: copy.contact.success.replace('{ref}', body.referenceId),
        });
        form.reset();
      } else {
        // The message is the server's localized, safe text.
        setResult({ kind: 'error', text: body.message });
      }
    } catch {
      setResult({ kind: 'error', text: copy.contact.networkError });
    } finally {
      announce();
    }
  };

  const tone = result.kind === 'success' ? 'ok' : result.kind === 'error' ? 'error' : 'idle';
  const noteText =
    result.kind === 'idle'
      ? copy.contact.disabledNote
      : result.kind === 'sending'
        ? copy.contact.sending
        : result.text;

  return (
    <form className="lp-form" onSubmit={onSubmit} noValidate>
      <div className="lp-form-grid">
        <label>
          <span className="sr-only">{copy.contact.fields.name}</span>
          <input
            name="name"
            type="text"
            required
            placeholder={copy.contact.fields.name}
            autoComplete="name"
          />
        </label>
        <label>
          <span className="sr-only">{copy.contact.fields.company}</span>
          <input
            name="company"
            type="text"
            required
            placeholder={copy.contact.fields.company}
            autoComplete="organization"
          />
        </label>
        <label>
          <span className="sr-only">{copy.contact.fields.city}</span>
          <input
            name="city"
            type="text"
            required
            placeholder={copy.contact.fields.city}
            autoComplete="address-level2"
          />
        </label>
        <label>
          <span className="sr-only">{copy.contact.fields.contact}</span>
          <input name="contact" type="text" required placeholder={copy.contact.fields.contact} />
        </label>

        {selects.map((select) => (
          <label key={select.name}>
            <span className="sr-only">{select.label}</span>
            <select name={select.name} required defaultValue="">
              <option value="" disabled hidden>
                {select.label}
              </option>
              {select.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <label>
        <span className="sr-only">{copy.contact.fields.challenge}</span>
        <textarea name="challenge" rows={3} placeholder={copy.contact.fields.challenge} />
      </label>

      {/* Honeypot. Hidden from people and assistive tech; only a bot fills it. */}
      <div className="lp-hp" aria-hidden="true">
        <label>
          Company website
          <input name="_hp" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="lp-consent">
        <input type="checkbox" name="consent" required />
        <span>{copy.contact.consent}</span>
      </label>

      <label className="lp-consent">
        <input type="checkbox" name="marketingConsent" />
        <span>{copy.contact.marketingConsent}</span>
      </label>

      <p className="lp-consent-note">
        {copy.contact.disclosure}{' '}
        <Link href={href(locale, '/privacy')} className="lp-teal">
          {copy.contact.privacyLink}
        </Link>
      </p>

      <button type="submit" className="lp-btn lp-btn-primary" disabled={result.kind === 'sending'}>
        {copy.contact.submit}
      </button>

      <p
        className="lp-form-note"
        ref={noteRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        data-tone={tone}
      >
        {noteText}
      </p>
    </form>
  );
}
