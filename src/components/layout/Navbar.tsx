"use client";
// src/components/layout/Navbar.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Products", href: "/products" },
  { label: "Docs", href: "/docs" },
  { label: "Status", href: "/status" },
];

export default function Navbar({ user }: { user?: { username: string } | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-ink/90 backdrop-blur-xl border-b border-line/60 shadow-[0_1px_0_rgba(47,47,58,0.5)]"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="relative w-8 h-8 rounded-lg bg-ember flex items-center justify-center shadow-ember-sm transition-shadow group-hover:shadow-ember-md">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path
                  d="M9 2L14.5 6.5V11.5L9 16L3.5 11.5V6.5L9 2Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="9" cy="9" r="2.5" fill="white" />
              </svg>
            </div>
            <span className="font-display font-700 text-[1.0625rem] tracking-tight text-chalk">
              Proxy<span className="text-ember">Market</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-2 rounded-lg text-[0.9rem] font-medium transition-all duration-200",
                  pathname === link.href
                    ? "text-chalk bg-surface"
                    : "text-dust hover:text-chalk hover:bg-surface/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA / Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface border border-line text-sm font-medium text-chalk hover:border-ghost/60 transition-all duration-200"
              >
                <span className="w-6 h-6 rounded-full bg-ember/20 flex items-center justify-center text-ember text-xs font-bold">
                  {user.username[0].toUpperCase()}
                </span>
                {user.username}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-sm font-medium text-dust hover:text-chalk transition-colors duration-200"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="btn btn-ember text-sm px-4 py-2"
                >
                  Get started
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-surface transition-colors"
            aria-label="Toggle menu"
          >
            <span className={cn("w-5 h-0.5 bg-chalk rounded transition-transform duration-200", menuOpen && "rotate-45 translate-y-2")} />
            <span className={cn("w-5 h-0.5 bg-chalk rounded transition-opacity duration-200", menuOpen && "opacity-0")} />
            <span className={cn("w-5 h-0.5 bg-chalk rounded transition-transform duration-200", menuOpen && "-rotate-45 -translate-y-2")} />
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden transition-all duration-300",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="absolute inset-0 bg-void/80 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={cn(
            "absolute top-16 inset-x-4 bg-ink border border-line rounded-2xl p-4 transition-all duration-300 shadow-2xl",
            menuOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          )}
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 rounded-xl text-sm font-medium text-dust hover:text-chalk hover:bg-surface transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-line" />
            {user ? (
              <Link
                href="/dashboard"
                className="px-4 py-3 rounded-xl text-sm font-medium text-chalk bg-surface border border-line text-center"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-4 py-3 rounded-xl text-sm font-medium text-dust hover:text-chalk hover:bg-surface transition-all text-center">
                  Sign in
                </Link>
                <Link href="/register" className="btn btn-ember w-full text-sm mt-1">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
