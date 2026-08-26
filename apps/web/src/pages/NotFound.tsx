// src/pages/NotFound.tsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-text-primary mb-4">
          {t("not_found.title")}
        </h1>
        <p className="text-sm sm:text-base text-text-secondary mb-8 max-w-md mx-auto">
          {t("not_found.desc")}
        </p>
        <Link to="/" className="btn btn-primary w-full sm:w-auto">
          {t("not_found.back_home")}
        </Link>
      </div>
    </div>
  );
}
