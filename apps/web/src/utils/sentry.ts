import * as Sentry from '@sentry/react';

export function initSentry() {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE || 'development',
      tracesSampleRate: import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE 
        ? parseFloat(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE) 
        : 0.1,
      beforeSend(event) {
        // Filter out sensitive data
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers?.['authorization'];
          delete event.request.headers?.['cookie'];
        }
        return event;
      },
      beforeBreadcrumb(breadcrumb) {
        // Filter out sensitive breadcrumbs
        if (breadcrumb.category === 'xhr' && breadcrumb.data) {
          delete breadcrumb.data.url;
        }
        return breadcrumb;
      },
    });
    console.log('Sentry error tracking enabled');
  } else {
    console.log('Sentry error tracking disabled (no VITE_SENTRY_DSN configured)');
  }
}