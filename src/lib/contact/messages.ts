import type { Locale } from '@/content/types';
import type { ContactErrorCode } from './types';

/**
 * Localized, safe failure messages.
 *
 * The `message` in a failure response comes only from this fixed table, keyed
 * by a stable error code. It never contains a provider response, a validation
 * detail, a field name, or anything else that would help someone probe the
 * endpoint — a person filling the form learns what to do next, and nothing about
 * the machinery behind it.
 */
const MESSAGES: Record<ContactErrorCode, Record<Locale, string>> = {
  intake_unconfigured: {
    ar: 'قناة الاستقبال الرسمية قيد الإعداد — لن يُرسل النموذج فعليًا حتى تفعيلها.',
    en: 'The official intake channel is being set up — the form will not actually send until it is connected.',
  },
  validation_failed: {
    ar: 'تعذّر إرسال الطلب. يُرجى مراجعة الحقول والمحاولة مرة أخرى.',
    en: 'Could not send the request. Please review the fields and try again.',
  },
  invalid_consent: {
    ar: 'فضلًا أكمل الحقول ووافق على التواصل معك بخصوص طلبك.',
    en: 'Please complete the fields and agree to be contacted about your request.',
  },
  unknown_field: {
    ar: 'تعذّر إرسال الطلب. يُرجى المحاولة مرة أخرى.',
    en: 'Could not send the request. Please try again.',
  },
  payload_too_large: {
    ar: 'حجم الطلب كبير جدًا. يُرجى تقصير النص والمحاولة مرة أخرى.',
    en: 'The request is too large. Please shorten the message and try again.',
  },
  bad_origin: {
    ar: 'تعذّر إرسال الطلب. يُرجى المحاولة مرة أخرى.',
    en: 'Could not send the request. Please try again.',
  },
  rate_limited: {
    ar: 'وصلتنا عدة محاولات متتالية. يُرجى المحاولة بعد قليل.',
    en: 'Several attempts came through in a row. Please try again shortly.',
  },
  duplicate: {
    ar: 'استلمنا طلبًا مطابقًا للتو. سنعاود التواصل معك — لا حاجة لإرساله مرة أخرى.',
    en: 'We just received a matching request. We will be in touch — no need to send it again.',
  },
  rejected: {
    ar: 'تعذّر إرسال الطلب. يُرجى المحاولة مرة أخرى.',
    en: 'Could not send the request. Please try again.',
  },
  expired: {
    ar: 'انتهت صلاحية النموذج. يُرجى تحديث الصفحة وإعادة المحاولة.',
    en: 'The form has expired. Please refresh the page and try again.',
  },
  persistence_failed: {
    ar: 'تعذّر إتمام الإرسال حاليًا. يُرجى المحاولة لاحقًا.',
    en: 'The submission could not be completed right now. Please try again later.',
  },
  server_error: {
    ar: 'تعذّر إتمام الإرسال حاليًا. يُرجى المحاولة لاحقًا.',
    en: 'The submission could not be completed right now. Please try again later.',
  },
};

export const messageFor = (code: ContactErrorCode, locale: Locale): string =>
  MESSAGES[code][locale];
