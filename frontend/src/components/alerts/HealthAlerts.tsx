// src/components/alerts/HealthAlerts.tsx

import { useEffect, useState } from 'react';
import type { Livestock } from '../../types';

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

/**
 * Health Alerts System
 * 
 * Real-time monitoring and alerts for livestock health issues.
 * Proactive notifications for critical conditions.
 * 
 * Features:
 * - Critical health alerts (sick animals)
 * - Disease outbreak detection
 * - Treatment monitoring
 * - Recovery tracking
 * 
 * Interview Talking Points:
 * - "Proactive health monitoring prevents disease spread"
 * - "Real-time alerts for veterinarians"
 * - "Helps farmers respond quickly to health issues"
 * - "Supports KALRO disease outbreak reporting"
 */
export default function HealthAlerts({ data }: HealthAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const generatedAlerts: Alert[] = [];

    // Critical Alert: Sick Animals
    const sickAnimals = data.filter(a => a.health === 'Sick');
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

    // Warning Alert: Animals Under Treatment
    const treatmentAnimals = data.filter(a => a.health === 'Under Treatment');
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

    // Outbreak Detection: Multiple sick animals in same county
    const countyHealthMap = data.reduce((acc, animal) => {
      if (animal.health === 'Sick') {
        acc[animal.county] = (acc[animal.county] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    Object.entries(countyHealthMap).forEach(([county, count]) => {
      if (count >= 3) { // Threshold for potential outbreak
        generatedAlerts.push({
          id: `outbreak-${county}`,
          type: 'critical',
          title: `⚠️ Potential Disease Outbreak in ${county}`,
          message: `${count} sick animals detected. Consider KALRO disease outbreak reporting.`,
          count,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Info Alert: Recently Recovered Animals
    const recoveredAnimals = data.filter(a => a.health === 'Recovered');
    if (recoveredAnimals.length > 0) {
      generatedAlerts.push({
        id: 'recovered-animals',
        type: 'info',
        title: `✅ ${recoveredAnimals.length} ${recoveredAnimals.length === 1 ? 'Animal Has' : 'Animals Have'} Recovered`,
        message: 'Continue monitoring for relapse. Update KALRO records as needed.',
        count: recoveredAnimals.length,
        animals: recoveredAnimals,
        timestamp: new Date().toISOString(),
      });
    }

    // Filter out dismissed alerts
    const activeAlerts = generatedAlerts.filter(
      alert => !dismissedAlerts.has(alert.id)
    );

    setAlerts(activeAlerts);
  }, [data, dismissedAlerts]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return {
          container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          title: 'text-red-800 dark:text-red-300',
          message: 'text-red-700 dark:text-red-400',
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
          title: 'text-yellow-800 dark:text-yellow-300',
          message: 'text-yellow-700 dark:text-yellow-400',
        };
      case 'info':
        return {
          container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          title: 'text-blue-800 dark:text-blue-300',
          message: 'text-blue-700 dark:text-blue-400',
        };
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return (
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="card p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-center gap-3">
          <svg className="h-6 w-6 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="font-semibold text-green-800 dark:text-green-300">
              ✅ All Systems Normal
            </div>
            <div className="text-sm text-green-700 dark:text-green-400">
              No critical health alerts at this time
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const styles = getAlertStyles(alert.type);

        return (
          <div
            key={alert.id}
            className={`card p-4 border ${styles.container} animate-fadeIn`}
          >
            <div className="flex items-start gap-3">
              {/* Alert Icon */}
              <div className={`flex-shrink-0 ${styles.icon}`}>
                {getAlertIcon(alert.type)}
              </div>

              {/* Alert Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold ${styles.title} mb-1`}>
                  {alert.title}
                </h3>
                <p className={`text-sm ${styles.message}`}>
                  {alert.message}
                </p>

                {/* Animal List (if provided) */}
                {alert.animals && alert.animals.length > 0 && (
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        // In production: Navigate to filtered view or open modal
                        console.log('View animals:', alert.animals);
                      }}
                      className="text-sm underline hover:no-underline"
                    >
                      View {alert.animals.length} affected {alert.animals.length === 1 ? 'animal' : 'animals'} →
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-3">
                  {alert.type === 'critical' && (
                    <button className="text-xs px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                      Report to KALRO
                    </button>
                  )}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-xs px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Dismiss Button (X) */}
              <button
                onClick={() => dismissAlert(alert.id)}
                className="flex-shrink-0 text-text-tertiary hover:text-text-primary transition-colors"
                aria-label="Dismiss alert"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Timestamp */}
            <div className="mt-2 pt-2 border-t border-current/20">
              <div className="text-xs text-text-tertiary">
                {new Date(alert.timestamp).toLocaleString('en-KE')}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}