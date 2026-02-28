import React, { useState, useEffect } from "react";
import {
  adminGetSiteContent,
  adminUpdateSiteContent,
} from "../../services/admin-service";
import { SiteContent } from "../../types";
import { Loader2, Save, AlertCircle, CheckCircle } from "lucide-react";

const PAGES = [
  { id: "about", name: "About Us" },
  { id: "contact", name: "Contact Us" },
  { id: "terms", name: "Terms & Conditions" },
  { id: "privacy", name: "Privacy Policy" },
  { id: "refund", name: "Refund Policy" },
];

export function AdminContentPage() {
  const [selectedPage, setSelectedPage] = useState(PAGES[0].id);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    fetchContent(selectedPage);
  }, [selectedPage]);

  const fetchContent = async (pageId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetSiteContent(pageId);
      if (data) {
        setContent(data);
        setTitle(data.title);
        setBody(data.content);
      } else {
        // Default content if not found
        const defaultTitle = PAGES.find((p) => p.id === pageId)?.name || "";
        setContent(null);
        setTitle(defaultTitle);
        setBody("");
      }
    } catch (err) {
      setError("Failed to load content");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await adminUpdateSiteContent(selectedPage, {
        id: selectedPage,
        title,
        content: body,
      });
      setSuccess("Content updated successfully");
      // Refresh content
      fetchContent(selectedPage);
    } catch (err) {
      setError("Failed to save content");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Website Content
          </h2>
          <p className="text-muted-foreground">
            Manage your static pages content.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? (
            // @ts-ignore
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            // @ts-ignore
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
          {/* @ts-ignore */}
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2">
          {/* @ts-ignore */}
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <nav className="flex flex-col">
            {PAGES.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPage(page.id)}
                className={`text-left px-4 py-3 text-sm font-medium transition-colors border-l-4 ${
                  selectedPage === page.id
                    ? "bg-secondary border-primary text-primary"
                    : "border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {page.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Editor */}
        <div className="md:col-span-3 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                  placeholder="Page Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Content (HTML/Markdown)
                </label>
                <div className="relative">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring min-h-[400px] font-mono text-sm bg-background text-foreground"
                    placeholder="<p>Enter your content here...</p>"
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                    Supports HTML tags
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
