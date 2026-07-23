import type { Locale, Localized } from '@/content/types';

/**
 * Bilingual routing and UI strings.
 *
 * Arabic is the default and the primary reading experience; English is the
 * secondary locale. Direction is derived from the locale, never hardcoded —
 * layout uses CSS logical properties so a third locale needs no layout work.
 */

export const locales: Locale[] = ['ar', 'en'];
export const defaultLocale: Locale = 'ar';

export const isLocale = (value: string): value is Locale => (locales as string[]).includes(value);

export const dirOf = (locale: Locale): 'rtl' | 'ltr' => (locale === 'ar' ? 'rtl' : 'ltr');

/** Reads the correct side of a `Localized` value. */
export const t = (value: Localized, locale: Locale): string => value[locale];

/** Language names, each written in its own language. */
export const localeLabel: Record<Locale, string> = { ar: 'العربية', en: 'English' };

/**
 * UI chrome strings — navigation labels, buttons, empty states.
 *
 * Content strings live in the content registries; only the shell lives here.
 * Keeping them apart means translating the interface and authoring the copy
 * are separate jobs with separate owners.
 */
export const ui = {
  skipToContent: { ar: 'تخطَّ إلى المحتوى', en: 'Skip to content' },
  mainNav: { ar: 'التنقّل الرئيسي', en: 'Main navigation' },
  footerNav: { ar: 'روابط التذييل', en: 'Footer navigation' },
  openMenu: { ar: 'افتح القائمة', en: 'Open menu' },
  closeMenu: { ar: 'أغلق القائمة', en: 'Close menu' },
  toggleTheme: { ar: 'بدّل المظهر', en: 'Toggle theme' },
  switchLanguage: { ar: 'تغيير اللغة', en: 'Switch language' },
  readMore: { ar: 'اقرأ المزيد', en: 'Read more' },
  backTo: { ar: 'العودة إلى', en: 'Back to' },
  onThisPage: { ar: 'في هذه الصفحة', en: 'On this page' },
  lastUpdated: { ar: 'آخر تحديث', en: 'Last updated' },
  category: { ar: 'الفئة', en: 'Category' },
  lifecycleStage: { ar: 'مرحلة دورة الحياة', en: 'Lifecycle stage' },
  pendingOwnerInput: {
    ar: 'بانتظار إدخال المالك',
    en: 'Pending owner input',
  },
  emptyTitle: { ar: 'لا يوجد محتوى منشور بعد', en: 'Nothing published yet' },
  emptyBody: {
    ar: 'هذا القسم مبني وجاهز. سيظهر المحتوى هنا فور اعتماده من مالك المحتوى.',
    en: 'This section is built and ready. Content appears here once its owner approves it.',
  },
  notFoundTitle: { ar: 'الصفحة غير موجودة', en: 'Page not found' },
  notFoundBody: {
    ar: 'الرابط الذي طلبته لا يقابل أي صفحة.',
    en: 'The address you requested does not match a page.',
  },
  goHome: { ar: 'إلى الصفحة الرئيسية', en: 'Go to homepage' },
} as const satisfies Record<string, Localized>;

/** Builds a locale-prefixed href. Every internal link goes through this. */
export const href = (locale: Locale, path: string): string => {
  const clean = path === '/' ? '' : path.replace(/\/$/, '');
  return `/${locale}${clean}` || `/${locale}`;
};
