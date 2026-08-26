import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const sections = [
  {
    titleKey: "more.section_analytics",
    items: [
      { labelKey: "nav.vaccinations", path: "/vaccinations", color: "text-accent" },
      { labelKey: "nav.weight", path: "/weight", color: "text-accent-gold" },
      { labelKey: "nav.mortality", path: "/mortality", color: "text-error" },
      { labelKey: "nav.county", path: "/county-comparison", color: "text-info" },
    ],
  },
  {
    titleKey: "more.section_operations",
    items: [
      { labelKey: "nav.outbreaks", path: "/outbreaks", color: "text-warning" },
      { labelKey: "nav.simulator", path: "/simulator", color: "text-success" },
      { labelKey: "nav.kalro_report", path: "/kalro-report", color: "text-accent-gold" },
      { labelKey: "nav.import", path: "/import", color: "text-text-secondary" },
    ],
  },
];

const iconMap: Record<string, JSX.Element> = {
  "/vaccinations": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 21h10" /><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h4" /><path d="M12 9v6" />
    </svg>
  ),
  "/weight": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" /><path d="M6.5 8a2 2 0 0 0-1.905 1.46L2.1 18.23A2 2 0 0 0 4 21h16a2 2 0 0 0 1.9-2.77l-2.5-8.77A2 2 0 0 0 17.5 8z" />
    </svg>
  ),
  "/mortality": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><line x1="9" y1="12" x2="15" y2="12" />
    </svg>
  ),
  "/county-comparison": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  "/outbreaks": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  "/simulator": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
    </svg>
  ),
  "/kalro-report": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  "/import": (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
};

export default function More() {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      <h1 className="text-lg font-bold text-text-primary mb-6">{t("nav.more")}</h1>

      {sections.map((section) => (
        <div key={section.titleKey} className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">
            {t(section.titleKey)}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {section.items.map(({ labelKey, path, color }) => (
              <Link
                key={path}
                to={path}
                className="flex items-center gap-3 p-4 min-h-[56px] rounded-xl bg-bg-secondary border border-border hover:border-accent/30 hover:shadow-sm active:scale-[0.98] transition-colors group"
              >
                <span className={`${color} group-hover:scale-110 transition-transform`}>
                  {iconMap[path]}
                </span>
                <span className="text-sm font-medium text-text-primary leading-tight">{t(labelKey)}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
