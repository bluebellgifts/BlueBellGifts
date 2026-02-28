import React, { useEffect, useState } from "react";
import { getSiteContent } from "../../services/firestore-service";
import { SiteContent } from "../../types";
import { Loader2, AlertCircle, Clock, ChevronRight } from "lucide-react";

interface StaticPageProps {
  pageId: string;
}

export default function StaticPage({ pageId }: StaticPageProps) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      setLoading(true);
      setError(null);
      try {
        const data = await getSiteContent(pageId);
        if (data) {
          setContent(data);
        } else {
          setError("This page hasn't been set up yet.");
        }
      } catch (err) {
        console.error("Error loading static page:", err);
        setError("Unable to load page content.");
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [pageId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-500 font-medium">Preparing content...</p>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="max-w-2xl mx-auto my-20 p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Content Unavailable</h2>
        <p className="text-gray-600">{error || "The requested page was not found."}</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="mt-6 text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
        >
          Return Home <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Dynamic Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-blue-600 text-sm font-bold uppercase tracking-widest mb-4">
            <div className="w-8 h-1 bg-blue-600"></div>
            Last Updated: {content.lastUpdated ? new Date(content.lastUpdated).toLocaleDateString() : 'Recently'}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
            {content.title}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-16 px-4">
        {content.sections && content.sections.length > 0 ? (
          <div className="space-y-16">
            {content.sections.map((section, idx) => (
              <section key={section.id} className="group">
                <div className="flex items-start gap-4 md:gap-8">
                  <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 text-gray-300 font-black text-xl group-hover:bg-blue-50 group-hover:text-blue-200 transition-colors shrink-0 mt-1">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="space-y-4 flex-1">
                    {section.heading && (
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="md:hidden w-8 h-1 bg-blue-600 rounded-full"></span>
                        {section.heading}
                      </h2>
                    )}
                    <div className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {section.text}
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="prose prose-lg max-w-none text-gray-600 whitespace-pre-wrap">
            {content.content}
          </div>
        )}
      </div>
      
      {/* Footer Decoration */}
      <div className="max-w-4xl mx-auto pb-20 px-4">
        <div className="p-8 rounded-3xl bg-gray-900 text-white relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-xl font-bold">Have questions about this {content.title}?</h3>
              <p className="text-gray-400">Our team is here to help you understand our policies.</p>
            </div>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: '/contact' }))}
              className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              Contact Support
            </button>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600 rounded-full opacity-10 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
