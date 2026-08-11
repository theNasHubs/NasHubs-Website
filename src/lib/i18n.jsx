import React, { createContext, useContext, useEffect, useState } from "react";
import { dict } from "./translations";

const I18nContext = createContext({ lang: "vn", setLang: (_lang) => {}, toggle: () => {}, t: dict.vn });

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("nashubs-lang") || "vn");

  useEffect(() => {
    localStorage.setItem("nashubs-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggle = () => setLang((l) => (l === "vn" ? "en" : "vn"));

  return (
    <I18nContext.Provider value={{ lang, setLang, toggle, t: dict[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
