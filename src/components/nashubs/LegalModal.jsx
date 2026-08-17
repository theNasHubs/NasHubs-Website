import { useEffect } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LegalContent } from "@/pages/Legal";

/**
 * Large centered popup that shows the privacy policy + security commitment.
 * Opened from the nav. Has its own internal scroll, so the app's global
 * body-scroll lock doesn't prevent reading the full content.
 */
export default function LegalModal({ open, onClose }) {
  const { lang } = useI18n();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-surface text-ink shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <span className="text-sm font-bold uppercase tracking-[.14em] text-emerald-500">
            {lang === "en" ? "Legal" : "Pháp lý"}
          </span>
          <button
            onClick={onClose}
            aria-label={lang === "en" ? "Close" : "Đóng"}
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-ink-muted transition-colors hover:text-emerald-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-6">
          <LegalContent lang={lang} />
        </div>
      </div>
    </div>
  );
}
