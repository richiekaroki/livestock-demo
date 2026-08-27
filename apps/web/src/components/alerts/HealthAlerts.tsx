// src/components/alerts/HealthAlerts.tsx

import React, { useMemo, useState } from 'react';
import type { Livestock } from "@wam-mfugo/shared";
import { useDelayedUnmount } from '../../hooks/useDelayedUnmount';

interface HealthAlertsProps {
  data: Livestock[];
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  count: number;
  animals?: Livestock[];
  timestamp: string;
}

const AnimatedAlert = React.memo(function AnimatedAlert({
  alert,
  onDismiss,
  onRestore,
  isDismissed,
  index,
}: {
  alert: Alert;
  onDismiss: (id: string) => void;
  onRestore: (id: string) => void;
  isDismissed: boolean;
  index: number;
}) {
  const [isDismissing, setIsDismissing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [reported, setReported] = useState(false);
  const { shouldRender, isAnimating } = useDelayedUnmount(!isDismissing, 200);

  const prefersReducedMotion = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleDismiss = () => {
    setIsDismissing(true);
    setTimeout(() => onDismiss(alert.id), 200);
  };

  const handleReportKALRO = () => {
    if (showConfirm) {
      setReported(true);
      setShowConfirm(false);
      setTimeout(() => setReported(false), 4000);
    } else {
      setShowConfirm(true);
    }
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return {
          container: 'bg-error/5 border-error/20',
          icon: 'text-error',
          title: 'text-error',
          message: 'text-error',
        };
      case 'warning':
        return {
          container: 'bg-warning/5 border-warning/20',
          icon: 'text-warning',
          title: 'text-warning',
          message: 'text-warning',
        };
      case 'info':
        return {
          container: 'bg-info/5 border-info/20',
          icon: 'text-info',
          title: 'text-info',
          message: 'text-info',
        };
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
      case 'info':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
    }
  };

  if (!shouldRender) return null;

  const styles = getAlertStyles(alert.type);

  return (
    <div
      className={`card p-4 border ${styles.container} ${
        isAnimating ? 'animate-fade-out' : 'animate-slide-up'
      }`}
      style={prefersReducedMotion ? undefined : { animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          {getAlertIcon(alert.type)}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-bold ${styles.title} mb-1 line-clamp-2`}>
            {alert.title}
          </h3>
          <p className={`text-sm ${styles.message} line-clamp-3`}>
            {alert.message}
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            {alert.type === 'critical' && !isDismissed && (
              <>
                {reported ? (
                  <span className="text-xs px-3 py-1.5 bg-success/10 text-success rounded-lg font-medium">
                    Reported to KALRO
                  </span>
                ) : (
                  <button
                    onClick={handleReportKALRO}
                    className={`text-xs px-3 py-1.5 min-h-[44px] rounded-lg transition-colors cursor-pointer font-medium ${
                      showConfirm
                        ? "bg-warning text-white hover:bg-warning/90"
                        : "bg-error text-white hover:bg-error/90"
                    }`}
                  >
                    {showConfirm ? "Confirm Report" : "Report to KALRO"}
                  </button>
                )}
                {showConfirm && !reported && (
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="text-xs px-3 py-1.5 min-h-[44px] bg-bg-secondary text-text-secondary rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer font-medium border border-border"
                  >
                    Cancel
                  </button>
                )}
              </>
            )}
            {isDismissed ? (
              <button
                onClick={() => onRestore(alert.id)}
                className="text-xs px-3 py-1.5 min-h-[44px] bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors cursor-pointer font-medium"
              >
                Restore
              </button>
            ) : (
              <button
                onClick={handleDismiss}
                className="text-xs px-3 py-1.5 min-h-[44px] bg-bg-secondary text-text-secondary rounded-lg hover:bg-bg-tertiary transition-colors cursor-pointer font-medium border border-border"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-2.5 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-bg-secondary"
          aria-label="Dismiss alert"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="mt-3 pt-3 border-t border-current/10">
        <div className="text-xs text-text-tertiary font-mono">
          {new Date(alert.timestamp).toLocaleString('en-KE')}
        </div>
      </div>
    </div>
  );
});

const DISMISSED_KEY = "livestock-dismissed-alerts";

function loadDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<string>) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
  } catch {
    // silently fail
  }
}

export default React.memo(function HealthAlerts({ data }: HealthAlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(loadDismissed);
  const [showDismissed, setShowDismissed] = useState(false);

  const { alerts, totalAlertCount } = useMemo(() => {
    const sickAnimals: Livestock[] = [];
    const treatmentAnimals: Livestock[] = [];
    const recoveredAnimals: Livestock[] = [];
    const countySickMap: Record<string, number> = {};

    for (const animal of data) {
      switch (animal.health) {
        case 'Sick':
          sickAnimals.push(animal);
          countySickMap[animal.county] = (countySickMap[animal.county] || 0) + 1;
          break;
        case 'Under Treatment':
          treatmentAnimals.push(animal);
          break;
        case 'Recovered':
          recoveredAnimals.push(animal);
          break;
      }
    }

    const generatedAlerts: Alert[] = [];

    if (sickAnimals.length > 0) {
      generatedAlerts.push({
        id: 'sick-animals',
        type: 'critical',
        title: `${sickAnimals.length} Sick ${sickAnimals.length === 1 ? 'Animal' : 'Animals'} Require Immediate Attention`,
        message: 'These animals need urgent veterinary care to prevent disease spread.',
        count: sickAnimals.length,
        animals: sickAnimals,
        timestamp: new Date().toISOString(),
      });
    }

    if (treatmentAnimals.length > 0) {
      generatedAlerts.push({
        id: 'under-treatment',
        type: 'warning',
        title: `${treatmentAnimals.length} ${treatmentAnimals.length === 1 ? 'Animal' : 'Animals'} Under Treatment`,
        message: 'Monitor these animals closely and ensure treatment protocols are followed.',
        count: treatmentAnimals.length,
        animals: treatmentAnimals,
        timestamp: new Date().toISOString(),
      });
    }

    for (const [county, count] of Object.entries(countySickMap)) {
      if (count >= 3) {
        generatedAlerts.push({
          id: `outbreak-${county}`,
          type: 'critical',
          title: `Potential Disease Outbreak in ${county}`,
          message: `${count} sick animals detected. Consider KALRO disease outbreak reporting.`,
          count,
          timestamp: new Date().toISOString(),
        });
      }
    }

    if (recoveredAnimals.length > 0) {
      generatedAlerts.push({
        id: 'recovered-animals',
        type: 'info',
        title: `${recoveredAnimals.length} ${recoveredAnimals.length === 1 ? 'Animal Has' : 'Animals Have'} Recovered`,
        message: 'Continue monitoring for relapse. Update KALRO records as needed.',
        count: recoveredAnimals.length,
        animals: recoveredAnimals,
        timestamp: new Date().toISOString(),
      });
    }

    const activeAlerts = showDismissed
      ? generatedAlerts
      : generatedAlerts.filter(alert => !dismissedAlerts.has(alert.id));

    return { alerts: activeAlerts, totalAlertCount: generatedAlerts.length };
  }, [data, dismissedAlerts, showDismissed]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => {
      const next = new Set([...prev, alertId]);
      saveDismissed(next);
      return next;
    });
  };

  const restoreAlert = (alertId: string) => {
    setDismissedAlerts(prev => {
      const next = new Set(prev);
      next.delete(alertId);
      saveDismissed(next);
      return next;
    });
  };

  const dismissedCount = totalAlertCount - alerts.length;

  if (alerts.length === 0 && !showDismissed) {
    return (
      <div className="space-y-3">
        <div className="card p-4 bg-success/5 border-success/20 animate-fade-in">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <div className="font-semibold text-success">
                All Systems Normal
              </div>
              <div className="text-sm text-success/80">
                No critical health alerts at this time
              </div>
            </div>
          </div>
        </div>
        {dismissedCount > 0 && (
          <button
            onClick={() => setShowDismissed(true)}
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer font-medium min-h-[44px] flex items-center"
          >
            Show {dismissedCount} dismissed {dismissedCount === 1 ? 'alert' : 'alerts'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {dismissedCount > 0 && (
        <button
          onClick={() => setShowDismissed(!showDismissed)}
          className="text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer font-medium min-h-[44px] flex items-center"
        >
          {showDismissed ? 'Hide dismissed' : `Show ${dismissedCount} dismissed ${dismissedCount === 1 ? 'alert' : 'alerts'}`}
        </button>
      )}
      {alerts.map((alert, index) => (
        <AnimatedAlert
          key={alert.id}
          alert={alert}
          onDismiss={dismissAlert}
          onRestore={restoreAlert}
          isDismissed={dismissedAlerts.has(alert.id)}
          index={index}
        />
      ))}
    </div>
  );
}
);
