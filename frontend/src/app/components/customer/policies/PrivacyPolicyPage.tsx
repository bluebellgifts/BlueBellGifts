import React, { useEffect, useState } from "react";
import { Shield, Loader2 } from "lucide-react";
import { getSiteContent } from "../../../services/firestore-service";
import { SiteContent } from "../../../types";

export function PrivacyPolicyPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await getSiteContent("privacy");
        setContent(data);
      } catch (error) {
        console.error("Error fetching privacy policy:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6 pb-16">
        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <div className="p-4 bg-blue-100 rounded-2xl">
            <Shield size={32} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
              {content?.title || "Privacy Policy"}
            </h1>
            <p className="text-sm md:text-base text-slate-600 mt-2">
              Last updated:{" "}
              {content?.lastUpdated
                ? new Date(
                    content.lastUpdated.seconds * 1000,
                  ).toLocaleDateString()
                : new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-lg">
          {content?.content ? (
            <div
              className="prose prose-blue max-w-none text-slate-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
          ) : (
            <p className="text-slate-500 italic">Content coming soon...</p>
          )}
        </div>
      </div>
    </div>
  );
}
