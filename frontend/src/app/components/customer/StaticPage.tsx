import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getSiteContent } from "../../services/firestore-service";
import { SiteContent } from "../../types";

interface StaticPageProps {
  pageId: string;
  defaultTitle?: string;
  defaultContent?: string;
}

export function StaticPage({ pageId, defaultTitle, defaultContent }: StaticPageProps) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      if (!pageId) return;
      setLoading(true);
      try {
        const data = await getSiteContent(pageId);
        setContent(data);
      } catch (error) {
        console.error(`Error fetching page ${pageId}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [pageId]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const displayTitle = content?.title || defaultTitle || "Page Not Found";
  const displayContent = content?.content || defaultContent || "";

  if (!content && !defaultContent) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-600">The page you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 border-b pb-4">
          {displayTitle}
        </h1>
        <div 
          className="prose prose-blue max-w-none text-slate-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
      </div>
    </div>
  );
}
