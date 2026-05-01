"use client";
// src/app/(auth)/register/page.tsx

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Registration failed");
        return;
      }

      toast.success("Account created! Welcome to ProxyMarket.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthColors = ["", "#E8445A", "#F5A623", "#2DD4A0", "#2DD4A0"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-ember flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L14.5 6.5V11.5L9 16L3.5 11.5V6.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="9" cy="9" r="2.5" fill="white"/>
            </svg>
          </div>
          <span className="font-display font-700 text-chalk">Proxy<span className="text-ember">Market</span></span>
        </Link>

        <h1 className="font-display font-700 text-2xl text-chalk mb-1">Create your account</h1>
        <p className="text-dust text-sm mb-8">Get instant access to all proxy plans after signup.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dust mb-1.5">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dust mb-1.5">Username</label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_-]+"
              placeholder="yourname"
              className="input"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dust mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Min 8 characters"
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {form.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background: passwordStrength >= i
                          ? strengthColors[passwordStrength]
                          : "var(--line)",
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strengthColors[passwordStrength] }}>
                  {strengthLabels[passwordStrength]}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-dust mb-1.5">Confirm password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              placeholder="••••••••"
              className="input"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-ember w-full py-3 text-sm mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10"/>
                </svg>
                Creating account…
              </span>
            ) : "Create account"}
          </button>
        </form>

        <p className="text-center text-xs text-ghost mt-6 leading-relaxed">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-dust hover:text-chalk transition-colors">Terms</Link>
          {" "}and{" "}
          <Link href="/privacy" className="text-dust hover:text-chalk transition-colors">Privacy Policy</Link>.
        </p>

        <p className="text-center text-sm text-ghost mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-chalk hover:text-ember transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
