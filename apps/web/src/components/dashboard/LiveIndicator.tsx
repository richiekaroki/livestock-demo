import { useTranslation } from "react-i18next";

interface LiveIndicatorProps {
  connected: boolean;
}

export default function LiveIndicator({ connected }: LiveIndicatorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`w-2 h-2 rounded-full ${
          connected ? "bg-success animate-pulse" : "bg-text-tertiary"
        }`}
      />
      <span className="text-text-secondary">
        {connected ? "Live" : t("common.offline")}
      </span>
    </div>
  );
}
