import type { Localized } from './types';

/**
 * Copy for the fixed pages — the ones that are not driven by a content
 * registry. Keeping it here rather than inside the route files means the whole
 * site's wording can be reviewed, translated, or handed to a CMS in one pass.
 *
 * Note what is absent: no capability claims, no availability statements, no
 * pricing, no customer references, no legal entity details. `talamir-product-
 * portfolio` and `talamir-legal-compliance` hold no approved source for any of
 * those, so the pages describe *structure and intent* only. Each page carries a
 * `pending` note naming what is still owed and by whom.
 */

export interface StaticPageCopy {
  title: Localized;
  lede: Localized;
  /** What this page is still waiting on. Rendered in the empty state. */
  pending: Localized;
  /** Optional section scaffolding — headings with no invented body copy. */
  sections?: Array<{ heading: Localized; body: Localized }>;
}

export const pageCopy = {
  home: {
    title: {
      ar: 'مجموعة منتجات مؤسسية — قيد البناء',
      en: 'An enterprise product group — under construction',
    },
    lede: {
      ar: 'هذا الموقع مبني بالكامل من ناحية الهيكل والتنقّل والمكوّنات، بهوية بصرية مؤقتة. الاسم والشعار والألوان قيد التحقق ولم تُعتمد بعد.',
      en: 'This site is structurally complete — architecture, navigation and components — on a temporary visual identity. The name, mark and palette are under validation and not yet approved.',
    },
    pending: {
      ar: 'محتوى الصفحة الرئيسية التسويقي بانتظار اعتماد الهوية ومصدر معتمد للادعاءات التجارية.',
      en: 'Homepage marketing copy awaits identity sign-off and an approved source for commercial claims.',
    },
  },

  about: {
    title: { ar: 'من نحن', en: 'About' },
    lede: {
      ar: 'صفحة التعريف بالشركة — الهيكل جاهز، والمحتوى بانتظار مصدر معتمد.',
      en: 'The company page — structure ready, content pending an approved source.',
    },
    pending: {
      ar: 'يتطلب: نص الرسالة، تاريخ التأسيس، الكيان القانوني، وفريق القيادة. لا يوجد مصدر معتمد لأي منها حتى الآن.',
      en: 'Requires: mission statement, founding date, legal entity, leadership. No approved source exists for any of these yet.',
    },
    sections: [
      {
        heading: { ar: 'ما نبنيه', en: 'What we build' },
        body: {
          ar: 'محفظة المنتجات مسجّلة في سجل المحفظة الداخلي. تُعرض هنا بأسمائها وفئاتها فقط.',
          en: 'The product portfolio is held in the internal portfolio register. It appears here by name and category only.',
        },
      },
    ],
  },

  careers: {
    title: { ar: 'الوظائف', en: 'Careers' },
    lede: {
      ar: 'الشواغر المفتوحة تُنشر هنا.',
      en: 'Open positions are published here.',
    },
    pending: {
      ar: 'لا توجد شواغر معتمدة للنشر. إضافة وظيفة تتم عبر سجل المحتوى ولا تتطلب تغييراً في الكود.',
      en: 'No approved requisitions to publish. Adding a role is a content-registry entry, not a code change.',
    },
  },

  contact: {
    title: { ar: 'تواصل معنا', en: 'Contact' },
    lede: {
      ar: 'قنوات التواصل الرسمية.',
      en: 'Official contact channels.',
    },
    pending: {
      ar: 'لم تُعتمد بعد عناوين بريد أو أرقام هاتف أو عنوان مكتب رسمي. نشر أي منها قبل الاعتماد ينشئ قناة لا يملكها أحد.',
      en: 'No email addresses, phone numbers or office address have been approved. Publishing one before approval creates a channel nobody owns.',
    },
  },

  privacy: {
    title: { ar: 'إشعار الخصوصية', en: 'Privacy notice' },
    lede: {
      ar: 'مسودة — قيد المراجعة القانونية. تصف كيفية تعاملنا مع البيانات التي ترسلها عبر نموذج التواصل. ليست وثيقة قانونية معتمدة بعد.',
      en: 'Draft — pending legal review. It describes how we handle the information you submit through the contact form. It is not yet an approved legal document.',
    },
    pending: {
      ar: 'تحتاج هذه الصفحة إلى مراجعة واعتماد قانوني قبل أن تُعرض كإشعار خصوصية رسمي.',
      en: 'This page requires legal review and approval before it can be presented as a formal privacy notice.',
    },
    sections: [
      {
        heading: { ar: 'ما الذي نجمعه', en: 'What we collect' },
        body: {
          ar: 'الحقول التي تُدخلها في نموذج التواصل فقط: الاسم، الشركة، المدينة، وسيلة التواصل، نوع النشاط، المنتج محل الاهتمام، الإطار الزمني، وسيلة التواصل المفضّلة، ووصف التحدي إن أضفته. لا نجمع مستندات هوية أو بيانات دفع، ولا نخزّن عنوان بروتوكول الإنترنت الخاص بك.',
          en: 'Only the fields you enter in the contact form: name, company, city, contact detail, activity type, product of interest, timeframe, preferred contact method, and your challenge description if you add one. We do not collect identity documents or payment data, and we do not store your IP address.',
        },
      },
      {
        heading: { ar: 'لماذا نستخدمها', en: 'How we use it' },
        body: {
          ar: 'تُستخدم بياناتك للرد على استفسارك والتواصل معك بشأنه عبر الوسيلة التي اخترتها. لا نضيفك إلى أي قائمة تسويقية إلا إذا اخترت ذلك صراحةً عبر خانة منفصلة.',
          en: 'Your information is used to respond to your inquiry and to contact you about it through the channel you chose. We do not add you to any marketing list unless you explicitly opt in through a separate checkbox.',
        },
      },
      {
        heading: { ar: 'مدة الاحتفاظ', en: 'Retention' },
        body: {
          ar: 'سياسة الاحتفاظ المقترحة: أرشفة بعد اثني عشر شهرًا من آخر تحديث، وحذف بعد أربعة وعشرين شهرًا. هذه السياسة مقترحة وبانتظار اعتماد المالك.',
          en: 'Proposed retention: archive twelve months after the last update, delete after twenty-four months. This is a proposal, pending owner sign-off.',
        },
      },
    ],
  },

  partners: {
    title: { ar: 'برنامج الشركاء', en: 'Partner Program' },
    lede: {
      ar: 'إطار الشراكة — المستويات والالتزامات والمزايا.',
      en: 'The partnership framework — tiers, commitments, benefits.',
    },
    pending: {
      ar: 'يتطلب اعتماد نموذج الشراكة التجاري وشروطه القانونية.',
      en: 'Requires an approved commercial partnership model and its legal terms.',
    },
  },

  investors: {
    title: { ar: 'المستثمرون', en: 'Investors' },
    lede: {
      ar: 'المعلومات الموجّهة للمستثمرين.',
      en: 'Investor-facing information.',
    },
    pending: {
      ar: 'المحتوى المالي أو أي مؤشر أداء لا يُنشر دون اعتماد. هذه الصفحة تبقى هيكلاً حتى ذلك الحين.',
      en: 'Financial content and performance figures are not published without approval. This page stays structural until then.',
    },
  },

  press: {
    title: { ar: 'المركز الإعلامي', en: 'Press' },
    lede: {
      ar: 'التغطية الإعلامية والمواد الصحفية.',
      en: 'Media coverage and press materials.',
    },
    pending: {
      ar: 'لا توجد تغطية موثّقة، ولا حزمة هوية للتحميل — الهوية نفسها غير معتمدة.',
      en: 'No verified coverage, and no brand kit to download — the identity itself is unapproved.',
    },
  },

  support: {
    title: { ar: 'الدعم', en: 'Support' },
    lede: {
      ar: 'قنوات الدعم ومستويات الخدمة.',
      en: 'Support channels and service levels.',
    },
    pending: {
      ar: 'لم تُعتمد قنوات دعم ولا اتفاقية مستوى خدمة. نشر وعد استجابة دون التزام مقابل هو ادعاء تجاري.',
      en: 'No support channels or service-level agreement are approved. Publishing a response promise without a backing commitment is a commercial claim.',
    },
  },

  documentation: {
    title: { ar: 'التوثيق', en: 'Documentation' },
    lede: {
      ar: 'التوثيق التقني للمنتجات وللمنصة.',
      en: 'Technical documentation for the products and the platform.',
    },
    pending: {
      ar: 'توثيق المنتجات يبدأ عند توفّر مصدر تقني معتمد لكل منتج.',
      en: 'Product documentation begins once an approved technical source exists per product.',
    },
  },

  blog: {
    title: { ar: 'المدوّنة', en: 'Blog' },
    lede: {
      ar: 'كتابات من الفريق.',
      en: 'Writing from the team.',
    },
    pending: {
      ar: 'لا توجد مقالات منشورة. لن تُنشر مقالات بأسماء كتّاب غير حقيقيين.',
      en: 'No posts published. Posts will not be published under fabricated author names.',
    },
  },

  products: {
    title: { ar: 'المنتجات', en: 'Products' },
    lede: {
      ar: 'محفظة المنتجات كما يسجّلها سجل المحفظة الداخلي.',
      en: 'The product portfolio as recorded in the internal portfolio register.',
    },
    pending: {
      ar: 'لا يوجد منتج معتمد تجارياً. تُعرض الأسماء والفئات وحالة دورة الحياة كما هي مسجّلة.',
      en: 'No product is commercially claimed. Names, categories and lifecycle status appear exactly as registered.',
    },
  },

  solutions: {
    title: { ar: 'الحلول', en: 'Solutions' },
    lede: {
      ar: 'الحلول مرتّبة حسب المشكلة التي تعالجها.',
      en: 'Solutions organised by the problem they address.',
    },
    pending: {
      ar: 'صفحات الحلول مبنية ومسوّدة. نشرها يتطلب مصدراً معتمداً يربط منتجاً بنتيجة.',
      en: 'Solution pages are built and drafted. Publishing requires an approved source linking a product to an outcome.',
    },
  },

  industries: {
    title: { ar: 'القطاعات', en: 'Industries' },
    lede: {
      ar: 'القطاعات المستهدفة والسياق التنظيمي لكل منها.',
      en: 'Target sectors and the regulatory context of each.',
    },
    pending: {
      ar: 'القطاع المستهدف مسجّل كـ«غير محدد» لكل منتج. صفحات القطاعات جاهزة وتنتظر ذلك القرار.',
      en: 'Target sector is registered as unspecified for every product. These pages are ready and await that decision.',
    },
  },

  sitemap: {
    title: { ar: 'خريطة الموقع', en: 'Sitemap' },
    lede: {
      ar: 'كل صفحة في الموقع، مشتقّة من شجرة التنقّل نفسها.',
      en: 'Every page on the site, derived from the same navigation tree.',
    },
    pending: { ar: '', en: '' },
  },
} as const satisfies Record<string, StaticPageCopy>;
