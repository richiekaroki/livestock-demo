import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", label: "EN" },
  { code: "sw", label: "SW" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-0.5 text-xs font-medium">
      {languages.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
            i18n.language === code
              ? "text-accent font-bold"
              : "text-text-tertiary hover:text-text-primary"
          }`}
          aria-label={`Switch to ${label}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
