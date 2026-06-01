import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Search,
  Filter,
  RefreshCw,
  Send,
  User,
  ShieldCheck,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { Badge } from "../ui/badge";
import {
  subscribeToAllContactSubmissions,
  updateContactStatus,
  deleteContactSubmission,
  addContactMessage,
} from "../../services/firestore-service";
import { ContactSubmission } from "../../types";
import { toast } from "sonner";

export function AdminContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read" | "replied">(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null);
  const [replyText, setReplyText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedSubmission = submissions.find(
    (s) => s.id === selectedSubmissionId,
  );

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToAllContactSubmissions((data) => {
      setSubmissions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSubmission?.messages]);

  const handleStatusUpdate = async (
    id: string,
    newStatus: "unread" | "read" | "replied",
  ) => {
    try {
      await updateContactStatus(id, newStatus);
      toast.success(`Marked as ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedSubmissionId) return;

    const text = replyText;
    setReplyText("");

    try {
      await addContactMessage(selectedSubmissionId, text, "admin");
      toast.success("Reply sent");
    } catch (error) {
      toast.error("Failed to send reply");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this submission?")) {
      try {
        await deleteContactSubmission(id);
        if (selectedSubmissionId === id) setSelectedSubmissionId(null);
        toast.success("Submission deleted");
      } catch (error) {
        toast.error("Failed to delete submission");
      }
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchesFilter = filter === "all" || s.status === filter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading && submissions.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Contact Submissions
          </h2>
          <p className="text-slate-500">Manage inquiries from your customers</p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search name, email or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-slate-400 w-4 h-4" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-12 text-slate-500"
                      >
                        No submissions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubmissions.map((s) => (
                      <TableRow
                        key={s.id}
                        className={`cursor-pointer hover:bg-slate-50 ${selectedSubmissionId === s.id ? "bg-blue-50" : ""}`}
                      >
                        <TableCell
                          onClick={() => {
                            setSelectedSubmissionId(s.id);
                            if (s.status === "unread")
                              handleStatusUpdate(s.id, "read");
                          }}
                        >
                          <div className="font-medium text-slate-900">
                            {s.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {s.email}
                          </div>
                        </TableCell>
                        <TableCell
                          className="max-w-[200px] truncate font-medium"
                          onClick={() => {
                            setSelectedSubmissionId(s.id);
                            if (s.status === "unread")
                              handleStatusUpdate(s.id, "read");
                          }}
                        >
                          {s.subject}
                        </TableCell>
                        <TableCell
                          className="text-slate-500 text-sm"
                          onClick={() => {
                            setSelectedSubmissionId(s.id);
                            if (s.status === "unread")
                              handleStatusUpdate(s.id, "read");
                          }}
                        >
                          {s.createdAt instanceof Date
                            ? s.createdAt.toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell
                          onClick={() => {
                            setSelectedSubmissionId(s.id);
                            if (s.status === "unread")
                              handleStatusUpdate(s.id, "read");
                          }}
                        >
                          <Badge
                            variant={
                              s.status === "unread"
                                ? "error"
                                : s.status === "read"
                                  ? "warning"
                                  : "success"
                            }
                          >
                            {s.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div
                            className="flex justify-end gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSubmissionId(s.id);
                                if (s.status === "unread")
                                  handleStatusUpdate(s.id, "read");
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(s.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {selectedSubmission ? (
            <Card className="p-6 sticky top-6 max-h-[calc(100vh-120px)] flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedSubmission.subject}
                  </h3>
                  <p className="text-sm text-slate-500">
                    From: {selectedSubmission.name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmissionId(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin">
                {(selectedSubmission.messages || []).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] p-3 rounded-xl text-sm ${
                        msg.sender === "admin"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-1 mb-1 opacity-80 text-[10px] font-bold uppercase tracking-wider">
                        {msg.sender === "admin" ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {msg.sender === "admin" ? "You (Admin)" : "Customer"}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type a reply..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!replyText.trim()}
                    className="flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> Send
                  </Button>
                </form>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-[10px]"
                    onClick={() =>
                      handleStatusUpdate(selectedSubmission.id, "unread")
                    }
                  >
                    Mark Unread
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-[10px]"
                    onClick={() =>
                      (window.location.href = `mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`)
                    }
                  >
                    Email Tab
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 border-dashed border-2 text-center text-slate-400 flex flex-col items-center justify-center h-64 sticky top-6">
              <Mail className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a message to view details</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

const X = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
