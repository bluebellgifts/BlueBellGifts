# SEO Quick Start Guide for Bluebell Gifts

## 🚀 Quick Implementation Guide

This guide shows you how to implement SEO across your React components quickly.

---

## 1. Basic Page SEO

### Using SEOPage Component (Easiest)

```tsx
import { SEOPage } from "@/components/SEOPage";
import { DEFAULT_SEO_CONFIG } from "@/config/seo-config";

export function HomePage() {
  const seoConfig = DEFAULT_SEO_CONFIG.home;

  return (
    <SEOPage config={seoConfig} trackingPath="/" includeLocalBusiness={true}>
      {/* Your page content */}
      <h1>Welcome to Bluebell Gifts</h1>
    </SEOPage>
  );
}
```

### Using useSEO Hook (More Control)

```tsx
import { useSEO } from "@/hooks/useSEO";

export function CategoriesPage() {
  useSEO({
    title: "Gift Categories | Browse Our Collections",
    description: "Explore various gift categories...",
    keywords: ["categories", "gifts", "personalized"],
    canonical: "https://bluebellgifts.in/categories",
    ogType: "website",
  });

  return <div>Categories content</div>;
}
```

---

## 2. Product Page SEO

### Simple Product Page

```tsx
import { useProductSEO } from "@/hooks/useSEO";

export function ProductPage({ product }) {
  // Automatically handles all product SEO
  useProductSEO(product);

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <price>{product.sellingPrice}</price>
    </div>
  );
}
```

**Product Object Must Have:**

```typescript
{
  id: string;
  name: string; // Used in title
  slug: string; // Used in URL
  description: string; // Used in meta description
  image: string; // Used in OG Image
  category: string;
  sellingPrice: number;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}
```

---

## 3. Category Page SEO

```tsx
import { useCategorySEO } from "@/hooks/useSEO";

export function CategoryPage({ category, description }) {
  useCategorySEO(category, description);

  return (
    <div>
      <h1>{category} Gifts</h1>
      <p>{description}</p>
      {/* Products list */}
    </div>
  );
}
```

---

## 4. Breadcrumb Navigation with SEO

```tsx
import { useBreadcrumbSEO } from "@/hooks/useSEO";

export function BreadcrumbNav() {
  const breadcrumbs = [
    { name: "Home", url: "https://bluebellgifts.in" },
    { name: "Categories", url: "https://bluebellgifts.in/categories" },
    {
      name: "Photo Frames",
      url: "https://bluebellgifts.in/category/photo-frames",
    },
  ];

  // Automatically adds breadcrumb schema markup
  useBreadcrumbSEO(breadcrumbs);

  return (
    <nav aria-label="Breadcrumb">
      {breadcrumbs.map((item, idx) => (
        <span key={item.url}>
          <a href={item.url}>{item.name}</a>
          {idx < breadcrumbs.length - 1 && " / "}
        </span>
      ))}
    </nav>
  );
}
```

---

## 5. Product Reviews & Ratings

### Add Review Schema Markup

```tsx
import { updateMetaTags } from "@/utils/seo";

export function ProductPage({ product, reviews }) {
  // Add review schema
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.avgRating,
      reviewCount: reviews.length,
      bestRating: "5",
      worstRating: "1",
    },
    review: reviews.slice(0, 10).map((review) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author,
      },
      datePublished: review.date,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
      },
      reviewBody: review.text,
    })),
  };

  updateMetaTags({
    schema: reviewSchema,
  });

  return (
    <div>
      {/* Product details */}
      <div className="reviews">
        {reviews.map((review) => (
          <div key={review.id}>
            <h3>{review.author}</h3>
            <p>⭐ {review.rating}/5</p>
            <p>{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 6. Event Tracking

### Track User Interactions

```tsx
import {
  useEventTracking,
  useProductTracking,
  useCartTracking,
} from "@/hooks/useSEO";

export function ProductCard({ product }) {
  const trackEvent = useEventTracking();

  // Track when product is viewed
  useProductTracking(product);

  const handleAddToCart = () => {
    trackEvent("add_to_cart", {
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.sellingPrice,
          quantity: 1,
        },
      ],
    });
  };

  return (
    <div>
      <h3>{product.name}</h3>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
```

### Track Cart Views

```tsx
import { useCartTracking } from "@/hooks/useSEO";

export function CartPage({ items }) {
  // Automatically tracks cart view
  useCartTracking(items);

  return (
    <div>
      <h1>Shopping Cart</h1>
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Track Purchase

```tsx
import { usePurchaseTracking } from "@/hooks/useSEO";

export function OrderSuccessPage({ orderData }) {
  // Track the purchase conversion
  usePurchaseTracking(orderData, true);

  return (
    <div>
      <h1>Order Confirmed!</h1>
      <p>Order ID: {orderData.id}</p>
    </div>
  );
}
```

---

## 7. Image Optimization

### Add SEO-Friendly Images

```tsx
export function ProductImage({ product, alt }) {
  return (
    <img
      // Use descriptive filename
      src={`/images/products/${product.slug}-thumbnail.webp`}
      alt={alt || product.name}
      title={product.name}
      loading="lazy"
      decoding="async"
      width="400"
      height="400"
      srcSet={`
        /images/products/${product.slug}-thumbnail-400w.webp 400w,
        /images/products/${product.slug}-thumbnail-800w.webp 800w
      `}
      sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
    />
  );
}
```

---

## 8. Dynamic Meta Tags Example

### For Search Results or Filters

```tsx
import { updateMetaTags } from "@/utils/seo";

export function FilteredProductsPage({ filters, results }) {
  // Update meta tags dynamically
  updateMetaTags({
    title: `${filters.category} Gifts | Bluebell Gifts`,
    description: `Browse our ${filters.category} collection with ${results.length} items. Fast delivery, quality guaranteed.`,
    keywords: [
      filters.category,
      "personalized gifts",
      "premium collection",
      `buy online`,
    ],
    canonical: `https://bluebellgifts.in/category/${filters.category.toLowerCase()}`,
  });

  return (
    <div>
      <h1>{filters.category} Gifts</h1>
      {results.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## 9. FAQ Section with Schema

```tsx
import { DEFAULT_SEO_CONFIG } from "@/config/seo-config";
import { useSEO } from "@/hooks/useSEO";
import { generateFAQSchema } from "@/utils/seo";

export function FAQPage() {
  const faqs = [
    {
      question: "What is a personalized gift?",
      answer:
        "A personalized gift is a custom item made specifically for the recipient...",
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery typically takes 5-7 business days within India...",
    },
  ];

  useSEO({
    title: "FAQ | Bluebell Gifts",
    description: "Frequently asked questions about Bluebell Gifts...",
    schema: generateFAQSchema(faqs),
  });

  return (
    <div>
      <h1>Frequently Asked Questions</h1>
      {faqs.map((faq, idx) => (
        <div key={idx}>
          <h3>{faq.question}</h3>
          <p>{faq.answer}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 10. Checking SEO Implementation

### Verify in Browser

1. **View Page Source** (Ctrl+U or Cmd+U)
   - Check if title, meta description, keywords are present
   - Verify JSON-LD schema in `<script type="application/ld+json">`

2. **Inspect Elements** (F12)
   - Check meta tags in `<head>`
   - Verify canonical URL
   - Check og: tags for social sharing

3. **Test Tools**
   - [Rich Results Test](https://search.google.com/test/rich-results) - Schema markup
   - [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly) - Mobile SEO
   - [PageSpeed Insights](https://pagespeed.web.dev) - Performance
   - [Meta Tags Inspector](https://metatags.io) - Meta tags preview

---

## Configuration File Usage

### Access SEO Config

```tsx
import {
  getSiteConfig,
  getPageConfig,
  getPageUrl,
  getAnalyticsId,
  getSocialLinks,
} from "@/config/seo-config";

// Get site information
const siteConfig = getSiteConfig();
console.log(siteConfig.name); // "Bluebell Gifts"

// Get page-specific config
const homeConfig = getPageConfig("home");
console.log(homeConfig.title);

// Generate page URLs
const productUrl = getPageUrl("/product/photo-frame");

// Get analytics ID
const gaId = getAnalyticsId();

// Get social links
const social = getSocialLinks();
console.log(social.twitter.handle); // "@bluebellgifts"
```

---

## Common SEO Patterns

### Pattern 1: Simple Static Page

```tsx
export function AboutPage() {
  useSEO({
    title: "About Bluebell Gifts",
    description: "Learn about our company, mission, and values...",
    keywords: ["about us", "company", "mission"],
    canonical: "https://bluebellgifts.in/about",
  });

  return <div>About page content</div>;
}
```

### Pattern 2: Dynamic Category Page

```tsx
export function CategoryPage({ categoryId, categoryData }) {
  useCategorySEO(categoryData.name, categoryData.description);

  return (
    <div>
      <h1>{categoryData.name}</h1>
      {/* Category content */}
    </div>
  );
}
```

### Pattern 3: Product with Reviews

```tsx
export function ProductDetailPage({ productId, product, reviews }) {
  useProductSEO(product);
  useBreadcrumbSEO([
    { name: "Home", url: "..." },
    { name: "Products", url: "..." },
    { name: product.name, url: "..." },
  ]);

  return (
    <div>
      <h1>{product.name}</h1>
      <ReviewSection reviews={reviews} />
    </div>
  );
}
```

---

## Troubleshooting

### Meta Tags Not Appearing?

```tsx
// Make sure to import and use the hook
import { useSEO } from "@/hooks/useSEO";

// Call it at the top level of your component
export function MyPage() {
  useSEO({
    /* config */
  }); // This must be called
  return <div>Content</div>;
}
```

### Schema Not Showing in Rich Results Test?

1. Check JSON-LD is valid JSON
2. Ensure schema is at top level of page
3. Use [Rich Results Test](https://search.google.com/test/rich-results)
4. Check console for JavaScript errors

### Analytics Not Tracking?

```tsx
// Verify GA4 ID is set
console.log(window.gtag); // Should exist if GA4 is loaded

// Check in DevTools > Network tab for analytics requests
// Should see requests to https://www.google-analytics.com
```

---

## Next Steps

1. ✅ Implement SEO on all pages
2. ✅ Submit sitemaps to Google Search Console
3. ✅ Set up Google Analytics 4
4. ✅ Configure conversion tracking
5. ✅ Monitor rankings in GSC
6. ✅ Create blog content strategy
7. ✅ Build backlinks
8. ✅ Monitor Core Web Vitals

---

## Resources

- [Full SEO Documentation](./SEO_IMPLEMENTATION.md)
- [SEO Utils Reference](./src/app/utils/seo.ts)
- [SEO Config File](./src/app/config/seo-config.ts)
- [SEO Hooks](./src/app/hooks/useSEO.ts)

---

**Last Updated:** February 28, 2026
**For Questions:** support@bluebellgifts.in
