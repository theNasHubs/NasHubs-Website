import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import LegalModal from "@/components/nashubs/LegalModal";

export default function AppNav() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, setLang, t } = useI18n();
  const [legalOpen, setLegalOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 mt-4">
        <div className="spatial-nav flex items-center justify-between rounded-2xl border border-border bg-surface-2/70 backdrop-blur-xl px-5 py-3 shadow-[0_8px_30px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <Link to="/#overview" className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/20">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="6" rx="2" />
                <rect x="3" y="14" width="18" height="6" rx="2" />
                <circle cx="7" cy="7" r="0.6" fill="currentColor" />
                <circle cx="7" cy="17" r="0.6" fill="currentColor" />
              </svg>
            </span>
            <span className="text-[17px] font-bold tracking-tight font-heading">NasHubs</span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-ink-muted xl:gap-8">
            <a href="#demo" className="hover:text-emerald-500 transition-colors">Demo</a>
            <a href="#agent" className="hover:text-emerald-500 transition-colors">NasHubs-Agent</a>
            <a href="#architecture" className="hover:text-emerald-500 transition-colors">{lang === "vn" ? "Kiến trúc" : "Architecture"}</a>
            <a href="#gallery" className="hover:text-emerald-500 transition-colors">{t.nav.features}</a>
            <a href="#security" className="hover:text-emerald-500 transition-colors">{t.nav.security}</a>
            <a href="#community" className="hover:text-emerald-500 transition-colors">{t.nav.community}</a>
            <button type="button" onClick={() => setLegalOpen(true)} className="hover:text-emerald-500 transition-colors">
              {lang === "en" ? "Privacy" : "Riêng tư"}
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full bg-surface/80 border border-border p-0.5 text-xs font-semibold">
              <button
                onClick={() => setLang("vn")}
                aria-pressed={lang === "vn"}
                className={`px-2.5 py-1 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-emerald-500 ${
                  lang === "vn" ? "bg-emerald-500 text-[#03140e]" : "text-ink-muted hover:text-ink"
                }`}
              >
                VN
              </button>
              <button
                onClick={() => setLang("en")}
                aria-pressed={lang === "en"}
                className={`px-2.5 py-1 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-emerald-500 ${
                  lang === "en" ? "bg-emerald-500 text-[#03140e]" : "text-ink-muted hover:text-ink"
                }`}
              >
                EN
              </button>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="grid place-items-center w-9 h-9 rounded-full bg-surface/80 border border-border text-ink-muted hover:text-emerald-500 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <a href="#download" className="group hidden items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#03140e] transition-colors hover:bg-emerald-400 sm:inline-flex">
              {t.nav.getapp}
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <LegalModal open={legalOpen} onClose={() => setLegalOpen(false)} />
    </header>
  );
}
