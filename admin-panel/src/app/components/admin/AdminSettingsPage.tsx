import React, { useState, useEffect } from "react";
import {
  adminGetSiteSettings,
  adminUpdateSiteSettings,
} from "../../services/admin-service";
import { SiteSettings } from "../../types";
import {
  Loader2,
  Save,
  AlertCircle,
  CheckCircle,
  Globe,
  Phone,
  MapPin,
  Mail,
  DollarSign,
} from "lucide-react";

export function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [siteName, setSiteName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactAddress, setContactAddress] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetSiteSettings();
      if (data) {
        setSettings(data);
        setSiteName(data.siteName || "My Gift Shop");
        setContactEmail(data.contactEmail || "");
        setContactPhone(data.contactPhone || "");
        setContactAddress(data.contactAddress || "");
        setCurrency(data.currency || "USD");
        setSocialLinks({
          facebook: data.socialLinks?.facebook || "",
          instagram: data.socialLinks?.instagram || "",
          twitter: data.socialLinks?.twitter || "",
          linkedin: data.socialLinks?.linkedin || "",
        });
      }
    } catch (err) {
      setError("Failed to load settings");
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
      await adminUpdateSiteSettings({
        siteName,
        contactEmail,
        contactPhone,
        contactAddress,
        currency,
        socialLinks,
      });
      setSuccess("Settings updated successfully");
      fetchSettings();
    } catch (err) {
      setError("Failed to save settings");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Site Settings</h2>
          <p className="text-muted-foreground">
            Manage global settings for your store.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Info */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            General Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Site Name
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              placeholder=""
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Currency
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
              </span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground appearance-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Contact Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Contact Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                placeholder=""
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Contact Phone
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                placeholder=""
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Physical Address
            </label>
            <textarea
              value={contactAddress}
              onChange={(e) => setContactAddress(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground min-h-[80px]"
              placeholder=""
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4 md:col-span-2">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Social Media Links
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Facebook
              </label>
              <input
                type="url"
                value={socialLinks.facebook || ""}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, facebook: e.target.value })
                }
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Instagram
              </label>
              <input
                type="url"
                value={socialLinks.instagram || ""}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, instagram: e.target.value })
                }
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Twitter (X)
              </label>
              <input
                type="url"
                value={socialLinks.twitter || ""}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, twitter: e.target.value })
                }
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                placeholder=""
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                LinkedIn
              </label>
              <input
                type="url"
                value={socialLinks.linkedin || ""}
                onChange={(e) =>
                  setSocialLinks({ ...socialLinks, linkedin: e.target.value })
                }
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                placeholder=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
