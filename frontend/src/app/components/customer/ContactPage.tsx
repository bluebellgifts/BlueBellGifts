import React, { useEffect, useState, useRef } from "react";
import {
  getSiteContent,
  getSiteSettings,
  submitContactForm,
  subscribeToContactSubmission,
  addContactMessage,
} from "../../services/firestore-service";
import { SiteContent, SiteSettings, ContactSubmission } from "../../types";
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  User,
  ShieldCheck,
} from "lucide-react";

export function ContactPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(() => {
    return localStorage.getItem("last_contact_id");
  });
  const [activeSubmission, setActiveSubmission] =
    useState<ContactSubmission | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [contentData, settingsData] = await Promise.all([
          getSiteContent("contact_page"),
          getSiteSettings(),
        ]);
        setContent(contentData);
        setSettings(settingsData);
      } catch (error) {
        console.error("Error loading contact page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!submissionId) return;

    const unsubscribe = subscribeToContactSubmission(
      submissionId,
      (submission) => {
        setActiveSubmission(submission);
      },
    );

    return () => unsubscribe();
  }, [submissionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSubmission?.messages]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const id = await submitContactForm({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });
      setSubmissionId(id);
      localStorage.setItem("last_contact_id", id);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert("Failed to send message. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !submissionId) return;

    const text = newMessage;
    setNewMessage("");

    try {
      await addContactMessage(submissionId, text, "customer");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-slate-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const title = content?.title || "Contact Us";
  const customContent = content?.content || "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-4 md:pt-6 pb-12 md:pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 md:mb-4">
            {title}
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
            We'd love to hear from you. Send us a message or visit our store.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 h-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Get in Touch
            </h2>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Our Location
                  </h3>
                  <p className="text-slate-600 whitespace-pre-line">
                    {settings?.contactAddress ||
                      "123 Gift Street, Mumbai, Maharashtra 400001"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Phone Number
                  </h3>
                  <p className="text-slate-600">
                    {settings?.contactPhone || "+91 98765 43210"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">
                    Email Address
                  </h3>
                  <p className="text-slate-600">
                    {settings?.contactEmail || "support@bluebellgifts.in"}
                  </p>
                </div>
              </div>

              {/* Social Links */}
              {settings?.socialLinks && (
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-4">
                    Follow Us
                  </h3>
                  <div className="flex gap-4">
                    {settings.socialLinks.instagram && (
                      <a
                        href={settings.socialLinks.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-50 p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                          />
                        </svg>
                      </a>
                    )}
                    {settings.socialLinks.facebook && (
                      <a
                        href={settings.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-50 p-2 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Content injection if exists */}
            {customContent && (
              <div
                className="mt-8 pt-8 border-t border-slate-100 prose prose-blue max-w-none text-slate-600"
                dangerouslySetInnerHTML={{ __html: customContent }}
              />
            )}
          </div>

          {/* Contact Form or Chat */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100 flex flex-col h-full min-h-[500px]">
            {activeSubmission ? (
              <>
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Support Chat
                    </h2>
                    <p className="text-sm text-slate-500">
                      Subject: {activeSubmission.subject}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSubmissionId(null);
                      localStorage.removeItem("last_contact_id");
                      setActiveSubmission(null);
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    New Inquiry
                  </button>
                </div>

                <div
                  className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-thin scrollbar-thumb-slate-200"
                  style={{ maxHeight: "400px" }}
                >
                  {(activeSubmission.messages || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                          msg.sender === "customer"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-1 mb-1 opacity-80 text-[10px] font-bold uppercase tracking-wider">
                          {msg.sender === "customer" ? (
                            <User className="w-3 h-3" />
                          ) : (
                            <ShieldCheck className="w-3 h-3" />
                          )}
                          {msg.sender === "customer" ? "You" : "Support Team"}
                        </div>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="mt-auto flex gap-2"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Send Message
                </h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    disabled={submitting}
                    className="w-full bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
