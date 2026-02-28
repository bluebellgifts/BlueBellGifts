/**
 * SEO Component Helper
 * Reusable component for adding SEO to pages quickly
 */

import React, { ReactNode } from "react";
import { useSEO, usePageTracking, useLocalBusinessSEO } from "../hooks/useSEO";
import { SEOConfig } from "../utils/seo";

interface SEOPageProps {
  config: SEOConfig;
  trackingPath?: string;
  children: ReactNode;
  includeLocalBusiness?: boolean;
}

/**
 * SEOPage Component
 * Wraps a page with all necessary SEO setup
 *
 * Usage:
 * ```tsx
 * <SEOPage config={pageConfig} trackingPath="/products">
 *   <YourPageContent />
 * </SEOPage>
 * ```
 */
export function SEOPage({
  config,
  trackingPath,
  children,
  includeLocalBusiness = false,
}: SEOPageProps) {
  // Apply SEO meta tags
  useSEO(config);

  // Track page view
  if (trackingPath) {
    usePageTracking(config.title, trackingPath);
  }

  // Include local business info (for footer/organization pages)
  if (includeLocalBusiness) {
    useLocalBusinessSEO();
  }

  return <>{children}</>;
}

export default SEOPage;
