'use client';

import { useState } from 'react';
import type { LandingCopy } from '@/content/landing';

/**
 * The enquiry form.
 *
 * No intake endpoint is configured, and rather than pretend otherwise the form
 * says so. Submitting validates the fields and then reports honestly that the
 * channel is not connected yet — it does not show a success message, and it
 * does not quietly discard what someone typed.
 *
 * That is the whole behaviour on purpose. Wiring a real endpoint means adding
 * one environment variable and a POST here; inventing a fake confirmation in
 * the meantime would be the kind of small dishonesty this site is built to
 * avoid.
 *
 * Nothing typed here leaves the browser.
 */
export function ContactForm({ copy }: { copy: LandingCopy }) {
  const [note, setNote] = useState<{ text: string; tone: 'idle' | 'error' } | null>(null);

  const selects = [
    { name: 'business', ...copy.contact.selects.business },
    { name: 'product', ...copy.contact.selects.product },
    { name: 'timeline', ...copy.contact.selects.timeline },
    { name: 'preference', ...copy.contact.selects.preference },
  ];

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!event.currentTarget.checkValidity()) {
      setNote({ text: copy.contact.incompleteNote, tone: 'error' });
      return;
    }

    setNote({ text: copy.contact.disabledNote, tone: 'idle' });
  };

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

      <label className="lp-consent">
        <input type="checkbox" name="consent" required />
        <span>{copy.contact.consent}</span>
      </label>

      <button type="submit" className="lp-btn lp-btn-primary">
        {copy.contact.submit}
      </button>

      <p className="lp-form-note" role="status" aria-live="polite" data-tone={note?.tone ?? 'idle'}>
        {note?.text ?? copy.contact.disabledNote}
      </p>
    </form>
  );
}
