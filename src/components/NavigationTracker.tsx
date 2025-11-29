import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics, EventType } from '@/lib/analytics';

export function NavigationTracker() {
  const location = useLocation();
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.track(EventType.NAV_MODULE, {
      path: location.pathname,
      search: location.search
    });
    analytics.trackPageView();
  }, [location]);

  return null;
}

