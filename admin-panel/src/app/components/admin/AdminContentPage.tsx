import React, { useState, useEffect } from "react";
import {
  adminGetSiteContent,
  adminUpdateSiteContent,
  adminGetSiteSettings,
  adminUpdateSiteSettings,
} from "../../services/admin-service";
import { SiteContent, SiteSettings } from "../../types";
import { 
  Loader2, Save, AlertCircle, CheckCircle, Globe, FileText, 
  Mail, Phone, MapPin, Instagram, Facebook, Twitter, Linkedin,
  Plus, Trash2, AlignLeft, Type
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
  const [sections, setSections] = useState<Array<{ id: string; heading: string; text: string }>>([]);

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
    }
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
        setSections(data.sections || []);
      } else {
        const defaultTitle = PAGES.find((p) => p.id === pageId)?.name || "";
        setTitle(defaultTitle);
        setSections([{ id: "sec_1", heading: "Introduction", text: "" }]);
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
    setSections([...sections, { id: "sec_" + Date.now(), heading: "", text: "" }]);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const updateSection = (id: string, field: 'heading' | 'text', value: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSaveContent = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await adminUpdateSiteContent(selectedPage, {
        id: selectedPage,
        title,
        sections,
        content: "", // Deprecating legacy string field
        lastUpdated: new Date()
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Frontend Management</h2>
          <p className="text-sm text-gray-500">Manage your website content and business details.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("pages")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "pages" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
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
              activeTab === "settings" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
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
                PAGES.map((page) => (
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
                ))
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
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900">Editing: {PAGES.find(p => p.id === selectedPage)?.name}</h3>
                  <p className="text-sm text-gray-500">Divide your content into logical sections.</p>
                </div>
                <Button onClick={addSection} variant="outline" className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Plus size={16} />
                  Add Section
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 pb-4 border-b border-gray-100">
                  <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-gray-400">Main Title</Label>
                  <Input
                    id="title"
                    className="text-lg font-semibold"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter page title"
                  />
                </div>

                <div className="space-y-6 mt-6">
                  {sections.map((section, index) => (
                    <div key={section.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-4 relative group">
                      <button 
                        onClick={() => removeSection(section.id)}
                        className="absolute right-4 top-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">{index + 1}</div>
                        Section {index + 1}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500 flex items-center gap-1">
                          <Type size={12} /> Section Heading
                        </Label>
                        <Input 
                          value={section.heading}
                          onChange={(e) => updateSection(section.id, 'heading', e.target.value)}
                          placeholder="e.g. Introduction, Our Mission, etc."
                          className="bg-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500 flex items-center gap-1">
                          <AlignLeft size={12} /> Section Text
                        </Label>
                        <textarea
                          className="w-full min-h-[120px] p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-y text-sm bg-white"
                          value={section.text}
                          onChange={(e) => updateSection(section.id, 'text', e.target.value)}
                          placeholder="Enter section content here..."
                        />
                      </div>
                    </div>
                  ))}

                  {sections.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                      <FileText className="mx-auto text-gray-300 mb-2" size={32} />
                      <p className="text-gray-400 text-sm">No sections added yet.</p>
                      <Button onClick={addSection} variant="link" className="text-blue-600 font-bold mt-2">Create First Section</Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button 
                  onClick={handleSaveContent} 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md px-8"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                  Save All Changes
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 space-y-8">
              {/* Site Settings implementation remains similar but follows the cleaner UI */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Globe className="text-blue-600" size={20} />
                  <h3 className="font-bold text-gray-900">General Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Site Name</Label>
                    <Input 
                      value={settings.siteName} 
                      onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency Symbol</Label>
                    <Input 
                      value={settings.currency} 
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Mail className="text-blue-600" size={20} />
                  <h3 className="font-bold text-gray-900">Contact & Business Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Support Email</Label>
                    <Input 
                      value={settings.contactEmail} 
                      onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input 
                      value={settings.contactPhone} 
                      onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Business Address</Label>
                    <textarea
                      className="w-full min-h-[100px] p-3 rounded-lg border border-gray-200 outline-none text-sm"
                      value={settings.contactAddress}
                      onChange={(e) => setSettings({...settings, contactAddress: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Instagram className="text-blue-600" size={20} />
                  <h3 className="font-bold text-gray-900">Social Media Links</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Instagram URL</Label>
                    <Input 
                      value={settings.socialLinks?.instagram || ""} 
                      onChange={(e) => setSettings({...settings, socialLinks: {...settings.socialLinks, instagram: e.target.value}})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Facebook URL</Label>
                    <Input 
                      value={settings.socialLinks?.facebook || ""} 
                      onChange={(e) => setSettings({...settings, socialLinks: {...settings.socialLinks, facebook: e.target.value}})}
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
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
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
