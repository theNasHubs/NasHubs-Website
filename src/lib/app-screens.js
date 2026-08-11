const SCREEN_MODULES = /** @type {Record<string, string>} */ (import.meta.glob("/assets/app-screens/**/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
}));

const FALLBACKS = {
  "07-miniapps/miniapps.jpg": "05-files/miniapps.jpg",
};

export function getAppScreen(theme, relativePath) {
  const selectedTheme = theme === "dark" ? "dark" : "light";
  const direct = SCREEN_MODULES[`/assets/app-screens/${selectedTheme}/${relativePath}`];
  if (direct) return direct;

  const fallbackPath = FALLBACKS[relativePath] || relativePath;
  return SCREEN_MODULES[`/assets/app-screens/${selectedTheme}/${fallbackPath}`]
    || SCREEN_MODULES[`/assets/app-screens/light/${fallbackPath}`]
    || SCREEN_MODULES[`/assets/app-screens/dark/${fallbackPath}`]
    || "";
}
