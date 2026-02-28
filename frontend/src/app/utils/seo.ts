/**
 * SEO Utilities for Bluebell Gifts
 * Comprehensive SEO configurations and helpers
 */

// Declare gtag and dataLayer on window object for GA4 and GTM
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  robots?: string;
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  schema?: any;
}

const SITE_CONFIG = {
  name: "Bluebell Gifts",
  domain: "https://bluebellgifts.in",
  description: "Premium personalized gifts and custom decor online",
  keywords: [
    "personalized gifts",
    "custom photo frames",
    "gift shop",
    "online gifts",
    "unique gifts",
    "personalized decor",
    "gift ideas",
    "premium gifts",
  ],
  social: {
    twitter: "@bluebellgifts",
    facebook: "bluebellgifts",
    instagram: "bluebellgifts",
  },
  contact: {
    email: "support@bluebellgifts.in",
    phone: "+91-XXXXXXXXXX",
  },
};

/**
 * Update document head with SEO meta tags
 */
export function updateMetaTags(config: SEOConfig): void {
  // Title
  if (config.title) {
    document.title = `${config.title} | ${SITE_CONFIG.name}`;
  }

  // Meta Description
  updateMetaTag("description", config.description);
  updateMetaTag("og:description", config.description);
  updateMetaTag("twitter:description", config.description);

  // Keywords
  if (config.keywords && config.keywords.length > 0) {
    updateMetaTag("keywords", config.keywords.join(", "));
  }

  // Canonical
  if (config.canonical) {
    updateLinkTag("canonical", config.canonical);
  }

  // OG Tags
  if (config.ogImage) {
    updateMetaTag("og:image", config.ogImage);
    updateMetaTag("twitter:image", config.ogImage);
  }

  if (config.ogType) {
    updateMetaTag("og:type", config.ogType);
  }

  // Twitter
  if (config.twitterCard) {
    updateMetaTag("twitter:card", config.twitterCard);
  }

  // Robots
  if (config.robots) {
    updateMetaTag("robots", config.robots);
  }

  // Author
  if (config.author) {
    updateMetaTag("author", config.author);
  }

  // Published/Modified Date
  if (config.publishedDate) {
    updateMetaTag("article:published_time", config.publishedDate);
  }

  if (config.modifiedDate) {
    updateMetaTag("article:modified_time", config.modifiedDate);
  }

  // JSON-LD Schema
  if (config.schema) {
    updateJsonLd(config.schema);
  }
}

/**
 * Update or create a meta tag
 */
function updateMetaTag(name: string, content: string): void {
  let element = document.querySelector(
    `meta[name="${name}"], meta[property="${name}"]`,
  );

  if (!element) {
    element = document.createElement("meta");
    if (name.includes(":")) {
      element.setAttribute("property", name);
    } else {
      element.setAttribute("name", name);
    }
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

/**
 * Update or create a link tag
 */
function updateLinkTag(rel: string, href: string): void {
  let element = document.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }

  element.setAttribute("href", href);
}

/**
 * Update or create JSON-LD schema
 */
function updateJsonLd(schema: any): void {
  let element = document.querySelector("script[type='application/ld+json']");

  if (!element) {
    element = document.createElement("script");
    element.setAttribute("type", "application/ld+json");
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(schema);
}

/**
 * Get site configuration
 */
export function getSiteConfig() {
  return SITE_CONFIG;
}

/**
 * Generate a page URL
 */
export function getPageUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_CONFIG.domain}${cleanPath}`;
}

/**
 * Generate Product Schema
 */
export function generateProductSchema(product: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    url: `${SITE_CONFIG.domain}/product/${product.slug}`,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: SITE_CONFIG.name,
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_CONFIG.domain}/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.sellingPrice,
      availability: product.stock > 0 ? "InStock" : "OutOfStock",
      seller: {
        "@type": "Organization",
        name: SITE_CONFIG.name,
      },
    },
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating.value,
          reviewCount: product.rating.count,
        }
      : undefined,
  };
}

/**
 * Generate BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate LocalBusiness Schema
 */
export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.domain,
    logo: `${SITE_CONFIG.domain}/logo.png`,
    image: `${SITE_CONFIG.domain}/og-image.png`,
    email: SITE_CONFIG.contact.email,
    telephone: SITE_CONFIG.contact.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tamil Nadu",
      addressRegion: "TN",
      addressCountry: "IN",
    },
    areaServed: {
      "@type": "GeoShape",
      addressCountry: "IN",
    },
    sameAs: [
      `https://www.facebook.com/${SITE_CONFIG.social.facebook}`,
      `https://www.instagram.com/${SITE_CONFIG.social.instagram}`,
      `https://www.twitter.com/${SITE_CONFIG.social.twitter.replace("@", "")}`,
    ],
  };
}

/**
 * Generate FAQ Schema
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Default SEO config for pages
 */
export const DEFAULT_SEO_CONFIG: Record<string, SEOConfig> = {
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
      "personalized decor",
    ],
    ogImage: "https://bluebellgifts.in/og-image.png",
    ogType: "website",
    twitterCard: "summary_large_image",
    robots:
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  },
  categories: {
    title: "Gift Categories | Browse By Type",
    description:
      "Explore our wide range of gift categories including personalized frames, custom decor, and unique gift ideas for every occasion.",
    keywords: [
      "gift categories",
      "gift types",
      "personalized gifts",
      "custom decor",
    ],
    ogType: "website",
  },
  products: {
    title: "All Products | Premium Gifts Collection",
    description:
      "Discover our complete collection of premium personalized gifts. Browse thousands of unique gift ideas with fast delivery.",
    keywords: [
      "all gifts",
      "product collection",
      "premium gifts",
      "unique gifts",
    ],
    ogType: "website",
  },
  contact: {
    title: "Contact Us | Bluebell Gifts",
    description:
      "Get in touch with Bluebell Gifts. Customer support, inquiries, and feedback. We're here to help!",
    keywords: ["contact", "customer support", "inquiries"],
    ogType: "website",
  },
  cart: {
    title: "Shopping Cart | Bluebell Gifts",
    description: "Review your items and proceed to checkout",
    robots: "noindex, follow",
  },
  checkout: {
    title: "Checkout | Bluebell Gifts",
    description: "Secure checkout for your personalized gifts",
    robots: "noindex, follow",
  },
};

/**
 * Generate performance-optimized image URL with srcset
 */
export function generateImageSrcSet(baseUrl: string): string {
  // This can be used with image CDN services like Cloudinary, Imgix, etc.
  // For now, returning the base URL
  return baseUrl;
}

/**
 * Prepare page for SEO crawling
 */
export function preparePageForSEO(pageConfig: SEOConfig): void {
  updateMetaTags(pageConfig);

  // Scroll to top for better user experience
  window.scrollTo(0, 0);

  // Trigger any analytics
  if (window.gtag) {
    window.gtag("event", "page_view", {
      page_path: window.location.pathname,
      page_title: document.title,
    });
  }
}
