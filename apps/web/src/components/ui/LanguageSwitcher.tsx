import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "EN" },
  { code: "sw", label: "SW" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1 text-xs font-medium">
      {languages.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={`px-3 py-2 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${
            i18n.language === code
              ? "text-accent font-bold bg-accent/10"
              : "text-text-tertiary hover:text-text-primary hover:bg-bg-secondary"
          }`}
          aria-label={`Switch to ${label}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
