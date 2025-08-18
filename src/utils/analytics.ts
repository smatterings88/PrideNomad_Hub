// Analytics and tracking utilities

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// Track user interactions
export function trackEvent({ action, category, label, value }: AnalyticsEvent): void {
  // Google Analytics 4 tracking
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }

  // Console logging for development
  if (import.meta.env.DEV) {
    console.log('Analytics Event:', { action, category, label, value });
  }
}

// Track page views
export function trackPageView(path: string, title?: string): void {
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: path,
      page_title: title
    });
  }

  if (import.meta.env.DEV) {
    console.log('Page View:', { path, title });
  }
}

// Track business interactions
export function trackBusinessInteraction(businessId: string, action: string): void {
  trackEvent({
    action,
    category: 'Business',
    label: businessId
  });
}

// Track search events
export function trackSearch(searchTerm: string, location?: string, resultCount?: number): void {
  trackEvent({
    action: 'search',
    category: 'Search',
    label: `${searchTerm}${location ? ` in ${location}` : ''}`,
    value: resultCount
  });
}

// Track user engagement
export function trackUserEngagement(action: string, details?: string): void {
  trackEvent({
    action,
    category: 'User Engagement',
    label: details
  });
}