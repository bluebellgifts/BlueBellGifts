/**
 * useSEO Hook
 * Custom hook for managing SEO on individual pages/components
 */

// Declare gtag and dataLayer on window object for GA4 and GTM
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

import { useEffect } from "react";
import {
  updateMetaTags,
  SEOConfig,
  generateProductSchema,
  generateBreadcrumbSchema,
  generateLocalBusinessSchema,
  preparePageForSEO,
  getPageUrl,
} from "../utils/seo";

export function useSEO(config: SEOConfig): void {
  useEffect(() => {
    preparePageForSEO(config);
  }, [config]);
}

/**
 * Hook for product page SEO
 */
export function useProductSEO(product: any): void {
  const config: SEOConfig = {
    title: product.name,
    description: product.description.substring(0, 160),
    keywords: [
      product.name.toLowerCase(),
      product.category,
      "personalized gift",
      "buy online",
    ],
    canonical: getPageUrl(`/product/${product.slug}`),
    ogImage: product.image || undefined,
    ogType: "product",
    schema: generateProductSchema(product),
    publishedDate: product.createdAt,
    modifiedDate: product.updatedAt,
  };

  useSEO(config);
}

/**
 * Hook for category page SEO
 */
export function useCategorySEO(category: string, description: string): void {
  const slug = category.toLowerCase().replace(/\s+/g, "-");
  const config: SEOConfig = {
    title: `${category} Gifts | Premium Collection`,
    description:
      description || `Shop our premium collection of ${category} gifts`,
    keywords: [category, "personalized gifts", "custom decor", "buy online"],
    canonical: getPageUrl(`/category/${slug}`),
    ogType: "website",
  };

  useSEO(config);
}

/**
 * Hook for listing pages with breadcrumbs
 */
export function useBreadcrumbSEO(
  breadcrumbs: Array<{ name: string; url: string }>,
): void {
  useEffect(() => {
    const schema = generateBreadcrumbSchema(breadcrumbs);
    const scriptElement = document.createElement("script");
    scriptElement.type = "application/ld+json";
    scriptElement.textContent = JSON.stringify(schema);
    document.head.appendChild(scriptElement);

    return () => {
      document.head.removeChild(scriptElement);
    };
  }, [breadcrumbs]);
}

/**
 * Hook for local business information
 */
export function useLocalBusinessSEO(): void {
  useEffect(() => {
    const schema = generateLocalBusinessSchema();
    const scriptElement = document.createElement("script");
    scriptElement.type = "application/ld+json";
    scriptElement.textContent = JSON.stringify(schema);
    document.head.appendChild(scriptElement);

    return () => {
      document.head.removeChild(scriptElement);
    };
  }, []);
}

/**
 * Hook for tracking page views with GTM/GA
 */
export function usePageTracking(pageTitle: string, pagePath: string): void {
  useEffect(() => {
    // Google Analytics tracking
    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_path: pagePath,
        page_title: pageTitle,
      });
    }

    // Google Tag Manager
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "pageview",
        pageTitle: pageTitle,
        pagePath: pagePath,
      });
    }
  }, [pageTitle, pagePath]);
}

/**
 * Hook for tracking events with GTM/GA
 */
export function useEventTracking(): (
  eventName: string,
  eventData?: any,
) => void {
  return (eventName: string, eventData?: any) => {
    if (window.gtag) {
      window.gtag("event", eventName, eventData);
    }

    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...eventData,
      });
    }
  };
}

/**
 * Hook for conversion tracking
 */
export function useConversionTracking(): void {
  useEffect(() => {
    // Track page view for conversion funnel
    if (window.gtag) {
      window.gtag("event", "view_item", {
        items: [
          {
            item_name: document.title,
            item_category: "conversion",
          },
        ],
      });
    }
  }, []);
}

/**
 * Hook for ecommerce product tracking
 */
export function useProductTracking(product: any): void {
  const trackProductEvent = useEventTracking();

  useEffect(() => {
    // Track product view
    trackProductEvent("view_item", {
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.sellingPrice,
          currency: "INR",
          item_brand: "Bluebell Gifts",
        },
      ],
    });
  }, [product.id, trackProductEvent]);

  return;
}

/**
 * Hook for cart tracking
 */
export function useCartTracking(cartItems: any[]): void {
  const trackCartEvent = useEventTracking();

  useEffect(() => {
    if (cartItems.length > 0) {
      trackCartEvent("view_cart", {
        items: cartItems.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.sellingPrice,
          quantity: item.quantity,
          currency: "INR",
        })),
        value: cartItems.reduce(
          (sum, item) => sum + item.sellingPrice * item.quantity,
          0,
        ),
        currency: "INR",
      });
    }
  }, [cartItems, trackCartEvent]);

  return;
}

/**
 * Hook for purchase tracking
 */
export function usePurchaseTracking(
  orderData: any,
  shouldTrack: boolean = true,
): void {
  const trackPurchaseEvent = useEventTracking();

  useEffect(() => {
    if (shouldTrack && orderData) {
      trackPurchaseEvent("purchase", {
        transaction_id: orderData.id,
        affiliation: "Bluebell Gifts",
        value: orderData.total,
        tax: orderData.tax || 0,
        shipping: orderData.shipping || 0,
        currency: "INR",
        items:
          orderData.items?.map((item: any) => ({
            item_id: item.id,
            item_name: item.name,
            item_category: item.category,
            price: item.price,
            quantity: item.quantity,
            currency: "INR",
          })) || [],
      });
    }
  }, [orderData, shouldTrack, trackPurchaseEvent]);

  return;
}
