/**
 * Accessibility utilities for focus management and screen reader support
 */

/**
 * Trap focus within a container element
 * Used for modals, dialogs, and other focusable containers
 */
export function trapFocus(container: HTMLElement, previousActiveElement?: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  if (!firstElement) return;

  // Focus first element
  firstElement.focus();

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Restore focus to previous element
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('keydown', handleEscape);
    }
  };

  container.addEventListener('keydown', handleKeyDown);
  container.addEventListener('keydown', handleEscape);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
    container.removeEventListener('keydown', handleEscape);
    if (previousActiveElement) {
      previousActiveElement.focus();
    }
  };
}

/**
 * Announce message to screen readers
 * Uses a live region for dynamic content announcements
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Generate unique ID for accessibility attributes
 */
let idCounter = 0;
export function generateAccessibleId(prefix: string = 'accessible') {
  return `${prefix}-${++idCounter}`;
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Apply reduced motion class if preferred
 */
export function applyReducedMotion(element: HTMLElement) {
  if (prefersReducedMotion()) {
    element.classList.add('reduced-motion');
  }
}

/**
 * Get the previous active element before opening a modal/dialog
 */
export function savePreviousActiveElement(): HTMLElement | null {
  return document.activeElement as HTMLElement;
}

/**
 * Restore focus to the previous active element
 */
export function restoreFocus(previousElement: HTMLElement | null) {
  if (previousElement && document.contains(previousElement)) {
    previousElement.focus();
  }
}

/**
 * Create a live region for dynamic content
 */
export function createLiveRegion(id: string, priority: 'polite' | 'assertive' = 'polite'): HTMLElement {
  const region = document.createElement('div');
  region.id = id;
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', priority);
  region.setAttribute('aria-atomic', 'true');
  region.className = 'sr-only';
  document.body.appendChild(region);
  return region;
}

/**
 * Update live region content
 */
export function updateLiveRegion(regionId: string, message: string) {
  const region = document.getElementById(regionId);
  if (region) {
    region.textContent = message;
  }
}

/**
 * Remove live region
 */
export function removeLiveRegion(regionId: string) {
  const region = document.getElementById(regionId);
  if (region) {
    document.body.removeChild(region);
  }
}