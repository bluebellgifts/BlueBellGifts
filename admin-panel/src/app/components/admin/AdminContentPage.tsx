import React, { useState, useEffect } from "react";
import {
  adminGetSiteContent,
  adminUpdateSiteContent,
  adminGetSiteSettings,
  adminUpdateSiteSettings,
} from "../../services/admin-service";
import { SiteContent, SiteSettings } from "../../types";
import {
  Loader2,
  Save,
  AlertCircle,
  CheckCircle,
  Globe,
  FileText,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

const PAGES = [
  { id: "about", name: "About Us" },
  { id: "contact_page", name: "Contact Page Text" },
  { id: "terms", name: "Terms & Conditions" },
  { id: "privacy", name: "Privacy Policy" },
  { id: "refund", name: "Refund Policy" },
  { id: "return", name: "Return Policy" },
  { id: "cancellation", name: "Cancellation Policy" },
  { id: "shipping", name: "Shipping Policy" },
];

export function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<"pages" | "settings">("pages");
  const [selectedPage, setSelectedPage] = useState(PAGES[0].id);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Page Content states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Site Settings states
  const [settings, setSettings] = useState<SiteSettings>({
    id: "general",
    siteName: "BlueBell Gifts",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    currency: "?",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
    },
  });

  useEffect(() => {
    if (activeTab === "pages") {
      fetchContent(selectedPage);
    } else {
      fetchSettings();
    }
  }, [selectedPage, activeTab]);

  const fetchContent = async (pageId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetSiteContent(pageId);
      if (data) {
        setTitle(data.title);
        setContent(data.content || "");
      } else {
        const defaultTitle = PAGES.find((p) => p.id === pageId)?.name || "";
        setTitle(defaultTitle);
        setContent("");
      }
    } catch (err) {
      setError("Failed to load content");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetSiteSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      setError("Failed to load settings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    // Removed: Section management no longer needed
  };

  const removeSection = (id: string) => {
    // Removed: Section management no longer needed
  };

  const updateSection = (
    id: string,
    field: "heading" | "text",
    value: string,
  ) => {
    // Removed: Section management no longer needed
  };

  const handleSaveContent = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await adminUpdateSiteContent(selectedPage, {
        id: selectedPage,
        title,
        content,
        lastUpdated: new Date(),
      });
      setSuccess("Page content updated successfully");
    } catch (err) {
      setError("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await adminUpdateSiteSettings(settings);
      setSuccess("Site settings updated successfully");
    } catch (err) {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex justify-end">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("pages")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "pages"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={16} />
              Static Pages
            </div>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "settings"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Globe size={16} />
              Site Settings
            </div>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-3">
          <CheckCircle size={20} />
          <p>{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4 px-2">
              {activeTab === "pages" ? "Select Page" : "Settings Sections"}
            </h3>
            <div className="space-y-1">
              {activeTab === "pages" ? (
                <>
                  {PAGES.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => setSelectedPage(page.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedPage === page.id
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {page.name}
                    </button>
                  ))}
                </>
              ) : (
                <button className="w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-blue-50 text-blue-700">
                  General Details
                </button>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-200">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : activeTab === "pages" ? (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Editing: {PAGES.find((p) => p.id === selectedPage)?.name}
                </h3>
                <p className="text-sm text-gray-500">
                  Edit page content as plain text.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-semibold text-gray-900"
                  >
                    Page Title
                  </Label>
                  <Input
                    id="title"
                    className="text-lg"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter page title"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="content"
                    className="text-sm font-semibold text-gray-900"
                  >
                    Page Content
                  </Label>
                  <textarea
                    id="content"
                    className="w-full min-h-[400px] p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y text-sm bg-white font-mono"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your page content here. You can use basic formatting like line breaks and spacing."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Plain text only. Your formatting will be preserved.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button
                  onClick={handleSaveContent}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md px-8"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Changes
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 space-y-8">
              {/* Site Settings implementation remains similar but follows the cleaner UI */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Globe className="text-blue-600" size={20} />
                  <h3 className="font-bold text-gray-900">
                    General Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Site Name</Label>
                    <Input
                      value={settings.siteName}
                      onChange={(e) =>
                        setSettings({ ...settings, siteName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency Symbol</Label>
                    <Input
                      value={settings.currency}
                      onChange={(e) =>
                        setSettings({ ...settings, currency: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Mail className="text-blue-600" size={20} />
                  <h3 className="font-bold text-gray-900">
                    Contact & Business Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input
                      value={settings.contactEmail}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contactEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input
                      value={settings.contactPhone}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contactPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Business Address</Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 rounded-lg border border-gray-200 outline-none text-sm"
                      value={settings.contactAddress}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          contactAddress: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Instagram className="text-blue-600" size={20} />
                  <h3 className="font-bold text-gray-900">
                    Social Media Links
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Instagram URL</Label>
                    <Input
                      value={settings.socialLinks?.instagram || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: {
                            ...settings.socialLinks,
                            instagram: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Facebook URL</Label>
                    <Input
                      value={settings.socialLinks?.facebook || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          socialLinks: {
                            ...settings.socialLinks,
                            facebook: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save Site Settings
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
