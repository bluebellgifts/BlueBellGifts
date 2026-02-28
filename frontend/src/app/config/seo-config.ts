/**
 * Bluebell Gifts - SEO Configuration
 * Complete SEO setup for maximum search engine visibility
 */

export const SEO_CONFIG = {
  // Site Information
  site: {
    name: "Bluebell Gifts",
    domain: "https://bluebellgifts.in",
    description: "Premium personalized gifts and custom decor online",
    language: "en-IN",
    country: "IN",
    countryName: "India",
    region: "TN",
    regionName: "Tamil Nadu",
    timezone: "Asia/Kolkata",
    type: "ecommerce",
  },

  // Contact Information for Schema
  contact: {
    email: "support@bluebellgifts.in",
    phone: "+91-XXXXXXXXXX",
    alternatePhone: "+91-XXXXXXXXXX",
    address: {
      streetAddress: "Your Address",
      city: "Your City",
      state: "Tamil Nadu",
      postalCode: "XXXXX",
      country: "India",
    },
  },

  // Social Media
  social: {
    twitter: {
      handle: "@bluebellgifts",
      id: "XXXXXX",
    },
    facebook: {
      url: "https://www.facebook.com/bluebellgifts",
      appId: "XXXXXX",
    },
    instagram: {
      url: "https://www.instagram.com/bluebellgifts",
      username: "bluebellgifts",
    },
    linkedin: {
      url: "https://www.linkedin.com/company/bluebellgifts",
    },
    youtube: {
      url: "https://www.youtube.com/bluebellgifts",
    },
  },

  // Keywords Strategy
  keywords: {
    primary: [
      "personalized gifts",
      "custom photo frames",
      "personalized decor",
      "gift shop online",
      "unique gifts",
    ],
    secondary: [
      "buy personalized gifts online",
      "custom gift ideas",
      "photo frame gifts",
      "personalized gift shop",
      "best gift ideas",
      "premium gift delivery",
      "personalized home decor",
      "custom photo gift",
      "gift wrapping service",
      "same day gift delivery",
    ],
    longtail: [
      "personalized gifts for parents",
      "personalized gifts for friends",
      "personalized gifts for wedding",
      "personalized gifts for baby",
      "personalized gifts for anniversary",
      "personalized gifts for birthday",
      "best personalized gift shop in india",
      "personalized photo frame online",
      "custom gift ideas for loved ones",
      "unique personalized gift ideas",
    ],
    categories: [
      "personalized photo frames",
      "custom wall decor",
      "personalized mugs",
      "custom photo gifts",
      "personalized photo blocks",
      "custom canvas prints",
      "personalized calendars",
      "custom cushions",
      "personalized t-shirts",
      "custom photo books",
    ],
  },

  // Analytics & Tracking
  analytics: {
    googleAnalyticsId: "G-XXXXXXXXXX",
    googleTagManagerId: "GTM-XXXXXX",
    googleSearchConsoleId: "https://search.google.com/search-console",
    bingWebmasterTools: "https://www.bing.com/webmasters",
  },

  // SEO Settings
  settings: {
    enableSitemap: true,
    sitemapUrl: "https://bluebellgifts.in/sitemap-index.xml",
    enableRobotsTxt: true,
    enableSchemaMarkup: true,
    enableAmpPages: false,
    defaultChangeFreq: "weekly",
    defaultPriority: 0.7,
    imageMaxWidth: 1200,
    imageMaxHeight: 630,
    videoMaxWidth: 1920,
    videoMaxHeight: 1080,
  },

  // Structured Data
  schema: {
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Bluebell Gifts",
      url: "https://bluebellgifts.in",
      logo: "https://bluebellgifts.in/logo.png",
    },
    website: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      url: "https://bluebellgifts.in",
      name: "Bluebell Gifts",
    },
  },

  // Pages Configuration
  pages: {
    home: {
      title: "Premium Personalized Gifts | Bluebell Gifts",
      description:
        "Shop premium personalized gifts, custom photo frames & unique decor at Bluebell Gifts. Fast delivery, quality guaranteed. Perfect for all occasions.",
      keywords: [
        "personalized gifts",
        "custom photo frames",
        "gift shop",
        "unique gifts",
        "online gifts",
        "premium gifts",
      ],
      priority: 1.0,
      changefreq: "daily",
    },
    categories: {
      title: "Gift Categories | Browse Our Collections",
      description:
        "Explore various gift categories including personalized frames, custom decor, mugs, and more at Bluebell Gifts.",
      keywords: ["gift categories", "gift types", "personalized", "custom"],
      priority: 0.9,
      changefreq: "weekly",
    },
    products: {
      title: "All Products | Premium Gifts Collection",
      description:
        "Browse our complete collection of personalized gifts and custom decor items. High-quality products with fast delivery.",
      keywords: ["gifts", "products", "personalized", "custom decor"],
      priority: 0.9,
      changefreq: "daily",
    },
    contact: {
      title: "Contact Bluebell Gifts | Get in Touch",
      description:
        "Contact us for inquiries, feedback, or customer support. We're here to help with your gift needs.",
      keywords: ["contact us", "customer support", "inquiries"],
      priority: 0.7,
      changefreq: "monthly",
    },
    about: {
      title: "About Bluebell Gifts | Our Story",
      description:
        "Learn about Bluebell Gifts, our mission, values, and commitment to providing premium personalized gifts.",
      keywords: ["about us", "our story", "mission", "values"],
      priority: 0.6,
      changefreq: "monthly",
    },
  },

  // Performance
  performance: {
    enableLazyLoading: true,
    enableImageOptimization: true,
    enableCaching: true,
    cacheExpiration: 3600, // seconds
    minImageSize: 320,
    maxImageSize: 1920,
  },

  // Mobile SEO
  mobile: {
    enableMobileOptimization: true,
    mobileTitle: "Bluebell Gifts | Personalized Gifts Online",
    enableAMP: false,
    enableMobileMenu: true,
  },

  // Localization
  localization: {
    supportedLanguages: ["en", "ta"],
    defaultLanguage: "en",
    supportedCountries: ["IN"],
    defaultCountry: "IN",
    enableHreflang: true,
  },

  // Security & Trust
  security: {
    enableSSL: true,
    enableSecureCheckout: true,
    enablePrivacyPolicy: true,
    enableTermsOfService: true,
    enableCookieConsent: true,
    enableSecurityHeaders: true,
  },

  // Conversion Optimization
  conversion: {
    enableGoogleAnalytics: true,
    enableGoogleConversionTracking: true,
    enableHotjar: true,
    enableIntercom: true,
    enableChatbot: true,
  },

  // Rich Results & Features
  richResults: {
    enableRichSnippets: true,
    enableFAQSchema: true,
    enableProductSchema: true,
    enableBreadcrumbSchema: true,
    enableVideoSchema: true,
    enableLocalBusinessSchema: true,
    enableReviewSchema: true,
  },

  // URLs Configuration
  urls: {
    productPattern: "/product/:slug",
    categoryPattern: "/category/:slug",
    blogPattern: "/blog/:slug",
    staticPattern: "/:page",
    trailingSlash: false,
    lowercase: true,
  },

  // API Endpoints (for sitemap generation)
  api: {
    productsEndpoint: "/api/products",
    categoriesEndpoint: "/api/categories",
    staticPagesEndpoint: "/api/pages",
  },

  // Robots Directives
  robots: {
    allowAll: true,
    blockPaths: ["/admin", "/api", "/cart", "/checkout", "/account"],
    allowGoogleBot: true,
    allowBingBot: true,
  },

  // OG Image Defaults
  ogImage: {
    width: 1200,
    height: 630,
    type: "image/png",
    url: "https://bluebellgifts.in/og-image.png",
  },

  // Twitter Card Defaults
  twitterCard: {
    cardType: "summary_large_image",
    site: "@bluebellgifts",
    creator: "@bluebellgifts",
  },
};

// Export specific config getters
export const getSiteUrl = () => SEO_CONFIG.site.domain;
export const getSiteDomain = () => new URL(SEO_CONFIG.site.domain).hostname;
export const getSocialLinks = () => SEO_CONFIG.social;
export const getAnalyticsId = () => SEO_CONFIG.analytics.googleAnalyticsId;
export const getContactEmail = () => SEO_CONFIG.contact.email;
export const getPageConfig = (pageName: string) => {
  return (
    SEO_CONFIG.pages[pageName as keyof typeof SEO_CONFIG.pages] ||
    SEO_CONFIG.pages.home
  );
};
