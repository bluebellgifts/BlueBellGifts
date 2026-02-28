import React, { useState } from "react";
import { Lock, Mail, Shield, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { auth, firestore } from "../../services/firebase-config";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

interface AdminLoginPageProps {
  onLogin: () => void;
}

export function AdminLoginPage({ onLogin }: AdminLoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Real Firebase Sign In
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        );

        // Verify if user is admin in Firestore
        const userDoc = await getDoc(
          doc(firestore, "users", userCredential.user.uid),
        );
        if (userDoc.exists() && userDoc.data().role === "admin") {
          onLogin();
        } else {
          // If not admin, sign out and show error
          await auth.signOut();
          setError("Access denied. You do not have admin privileges.");
        }
      } else {
        // Real Firebase Sign Up
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        );

        // Create user doc with admin role in Firestore
        await setDoc(doc(firestore, "users", userCredential.user.uid), {
          id: userCredential.user.uid,
          name: formData.name,
          email: formData.email,
          role: "admin",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        onLogin();
      }
    } catch (err: any) {
      console.error("Admin Auth Error:", err);
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email already in use");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters");
      } else {
        setError(err.message || "An error occurred during authentication");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white/10 backdrop-blur-xl inline-block p-4 rounded-3xl mb-6 border border-white/20 shadow-2xl">
            <Shield size={48} className="text-blue-400" />
          </div>
          <h2 className="text-4xl font-black text-white mb-3 tracking-tight">
            {isLogin ? "Bluebell Admin" : "Create Admin"}
          </h2>
          <p className="text-slate-400 font-medium">
            {isLogin
              ? "Manage gifts, inventory & billing"
              : "Register a new administrative account"}
          </p>
        </div>

        <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
          <CardContent className="py-10 px-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-200 text-sm animate-in shake duration-500">
                <AlertCircle size={20} className="flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <Input
                    label="Full Name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your name"
                    required
                    className="bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>
              )}

              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="admin@bluebell.com"
                  required
                  className="bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  required
                  className="bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>

              {!isLogin && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <Input
                    label="Confirm Password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    required
                    className="bg-white/10 border-white/10 text-white placeholder:text-slate-500"
                  />
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl font-bold shadow-xl shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-95"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <Lock size={20} className="mr-2" />
                )}
                {isLogin ? "Login to Dashboard" : "Create Account"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                {isLogin
                  ? "Don't have an account? Create one"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-8 font-medium">
          Protected by AES-256 Military Grade Encryption
        </p>
      </div>
    </div>
  );
}
