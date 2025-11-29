/**
 * Production-ready Analytics Tracker for PWA/TSD
 * 
 * Features:
 * - Offline-first with localStorage buffering
 * - Batch sending with sendBeacon/fetch keepalive
 * - Anonymous UUID-based tracking
 * - Zero external dependencies
 * - Performance tracking
 * - Error tracking
 * - Network-aware sending
 */

import { db } from '@/services/db';

// ==================== TYPES ====================

export interface AnalyticsEvent {
  /** Event name (e.g., 'screen_view', 'scan.success', 'error') */
  event: string;
  /** Event properties */
  properties?: Record<string, any>;
  /** Timestamp (ISO 8601) */
  timestamp: string;
  /** Anonymous user ID (UUIDv4) */
  userId: string;
  /** Session ID */
  sessionId: string;
  /** App context */
  context: EventContext;
}

export interface EventContext {
  /** App version from manifest */
  appVersion: string;
  /** Device model/info from user-agent */
  device: string;
  /** Browser name and version */
  browser: string;
  /** Screen resolution */
  screen: string;
  /** Online/offline status */
  networkStatus: 'online' | 'offline';
  /** Connection type (if available) */
  connectionType?: string;
  /** Current page URL */
  url: string;
  /** Referrer URL */
  referrer: string;
  /** Interface type: standard or custom */
  interfaceType: 'standard' | 'custom';
  /** Custom interface configuration ID/name (if custom) */
  interfaceConfigId?: string;
  /** Custom interface version (if custom) */
  interfaceConfigVersion?: string;
}

export interface AnalyticsConfig {
  /** API endpoint for sending events */
  endpoint: string;
  /** Batch size (number of events before auto-send) */
  batchSize?: number;
  /** Max time to wait before sending batch (ms) */
  flushInterval?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Enable performance tracking */
  trackPerformance?: boolean;
  /** Enable error tracking */
  trackErrors?: boolean;
  /** Custom app version (overrides manifest) */
  appVersion?: string;
}

// ==================== UUID GENERATOR ====================

/**
 * Generate UUIDv4 without external dependencies
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ==================== ANALYTICS CLASS ====================

class Analytics {
  private config: Required<AnalyticsConfig>;
  private userId: string;
  private sessionId: string;
  private buffer: AnalyticsEvent[] = [];
  private flushTimer: number | null = null;
  private isInitialized = false;
  private context: EventContext;
  private timers: Map<string, number> = new Map();

  // LocalStorage keys
  private readonly STORAGE_KEYS = {
    USER_ID: 'analytics_user_id',
    SESSION_ID: 'analytics_session_id',
    BUFFER: 'analytics_buffer',
    LAST_SEND: 'analytics_last_send',
  };

  constructor() {
    // Default config (will be overridden in init)
    this.config = {
      endpoint: import.meta.env.VITE_SUPABASE_ANALYTICS_URL || '/track', // Use env var or default
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      debug: false,
      trackPerformance: true,
      trackErrors: true,
      appVersion: '1.0.0',
    };

    this.userId = this.getOrCreateUserId();
    this.sessionId = this.getOrCreateSessionId();
    this.context = this.buildContext();
  }

  /**
   * Initialize analytics tracker
   */
  public init(config: AnalyticsConfig): void {
    if (this.isInitialized) {
      this.log('Already initialized');
      return;
    }

    this.config = { ...this.config, ...config };
    
    // Get app version from manifest if not provided
    if (!config.appVersion) {
      this.loadManifestVersion();
    }

    // Load buffered events from localStorage
    this.loadBuffer();

    // Setup listeners
    this.setupListeners();

    // Start flush timer
    this.startFlushTimer();

    // Send buffered events if online
    if (navigator.onLine) {
      this.flush();
    }

    this.isInitialized = true;
    this.log('Analytics initialized', this.config);
  }

  /**
   * Start a timer for a specific operation/session
   * @param id Unique identifier for the timer (e.g., document ID)
   */
  public startTimer(id: string): void {
    this.timers.set(id, performance.now());
    this.log(`Timer started: ${id}`);
  }

  /**
   * Stop a timer and track the duration
   * @param id Timer identifier
   * @param eventName Event name to track (e.g., 'document.complete')
   * @param properties Additional properties
   */
  public stopTimer(id: string, eventName: string, properties?: Record<string, any>): number | null {
    const startTime = this.timers.get(id);
    if (!startTime) {
      this.log(`Timer not found: ${id}`);
      return null;
    }

    const duration = Math.round(performance.now() - startTime);
    this.timers.delete(id);

    this.track(eventName, {
      ...properties,
      duration_ms: duration,
      timer_id: id
    });

    return duration;
  }

  /**
   * Track a generic metric value
   */
  public trackMetric(name: string, value: number, unit?: string, context?: Record<string, any>): void {
    this.track('metric', {
      name,
      value,
      unit,
      ...context
    });
  }

  /**
   * Track a custom event
   */
  public track(event: string, properties?: Record<string, any>): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized. Call analytics.init() first.');
      return;
    }

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      context: this.updateContext(),
    };

    this.addToBuffer(analyticsEvent);
    this.saveToLocalDB(analyticsEvent);
    this.log('Event tracked:', event, properties);
  }

  /**
   * Save event to local IndexedDB for statistics
   */
  private async saveToLocalDB(event: AnalyticsEvent): Promise<void> {
    try {
      // Map AnalyticsEvent to ActivityEvent structure expected by DB
      // We use @ts-ignore because we are adapting generic analytics to specific DB schema
      // @ts-ignore
      await db.activityEvents.add({
        id: generateUUID(),
        eventType: event.event,
        timestamp: new Date(event.timestamp).getTime(),
        createdAt: Date.now(),
        status: 'pending', 
        retryCount: 0,
        userId: event.userId, // Indexed field
        payload: {
          ...event.properties,
          userId: event.userId,
          sessionId: event.sessionId,
          context: event.context
        }
      });
    } catch (error) {
      // Silent fail for stats to not interrupt main flow
      if (this.config.debug) console.error('Failed to save stats locally:', error);
    }
  }

  /**
   * Track page view / screen view
   */
  public trackPageView(screenName?: string): void {
    this.track('screen_view', {
      screen: screenName || this.getScreenName(),
      url: window.location.href,
      path: window.location.pathname,
    });
  }

  /**
   * Track scan attempt
   */
  public trackScanAttempt(method: 'keyboard' | 'camera' | 'manual'): void {
    this.track('scan.attempt', { method });
  }

  /**
   * Track successful scan
   */
  public trackScanSuccess(barcode: string, method: 'keyboard' | 'camera' | 'manual', duration?: number): void {
    this.track('scan.success', {
      barcode_length: barcode.length,
      method,
      duration_ms: duration,
    });
  }

  /**
   * Track failed scan
   */
  public trackScanFail(error: string, method: 'keyboard' | 'camera' | 'manual'): void {
    this.track('scan.fail', {
      error,
      method,
    });
  }

  /**
   * Track manual input
   */
  public trackManualInput(inputType: string): void {
    this.track('manual_input', { input_type: inputType });
  }

  /**
   * Track confirmation
   */
  public trackConfirm(action: string, context?: Record<string, any>): void {
    this.track('confirm', { action, ...context });
  }

  /**
   * Track cancellation
   */
  public trackCancel(action: string, context?: Record<string, any>): void {
    this.track('cancel', { action, ...context });
  }

  /**
   * Track custom interface button click
   */
  public trackCustomButtonClick(buttonConfig: {
    label: string;
    action: string;
    params?: any;
    position?: { row: number; col: number };
    color?: string;
  }): void {
    this.track('custom_interface.button_click', {
      button_label: buttonConfig.label,
      button_action: buttonConfig.action,
      button_params: buttonConfig.params,
      button_position: buttonConfig.position,
      button_color: buttonConfig.color,
    });
  }

  /**
   * Track custom interface loaded
   */
  public trackCustomInterfaceLoaded(schemaInfo: {
    id: string;
    version: string;
    buttonsCount: number;
    source: 'qr' | 'localStorage' | 'file';
  }): void {
    this.track('custom_interface.loaded', {
      schema_id: schemaInfo.id,
      schema_version: schemaInfo.version,
      buttons_count: schemaInfo.buttonsCount,
      load_source: schemaInfo.source,
    });
  }

  /**
   * Track custom interface QR scan
   */
  public trackCustomInterfaceQRScan(success: boolean, error?: string): void {
    this.track('custom_interface.qr_scan', {
      success,
      error,
    });
  }

  /**
   * Track error
   */
  public trackError(error: Error | string, context?: Record<string, any>): void {
    const errorData = typeof error === 'string' 
      ? { message: error }
      : {
          message: error.message,
          stack: error.stack,
          name: error.name,
        };

    this.track('error', { ...errorData, ...context });
  }

  /**
   * Track performance timing
   */
  public trackTiming(category: string, variable: string, time: number, label?: string): void {
    this.track('timing', {
      category,
      variable,
      time_ms: time,
      label,
    });
  }

  /**
   * Track screen load time
   */
  public trackScreenLoadTime(screenName: string, startTime: number): void {
    const loadTime = performance.now() - startTime;
    this.track('screen.load_time', {
      screen: screenName,
      load_time_ms: Math.round(loadTime),
    });
  }

  /**
   * Manually flush buffer (send all events)
   */
  public flush(): void {
    if (this.buffer.length === 0) {
      this.log('Nothing to flush');
      return;
    }

    if (!navigator.onLine) {
      this.log('Offline, will flush when back online');
      return;
    }

    this.sendBatch(this.buffer);
  }

  /**
   * Clear all analytics data (for testing/debugging)
   */
  public clear(): void {
    this.buffer = [];
    localStorage.removeItem(this.STORAGE_KEYS.BUFFER);
    this.log('Analytics data cleared');
  }

  // ==================== PRIVATE METHODS ====================

  private getOrCreateUserId(): string {
    let userId = localStorage.getItem(this.STORAGE_KEYS.USER_ID);
    if (!userId) {
      userId = generateUUID();
      localStorage.setItem(this.STORAGE_KEYS.USER_ID, userId);
    }
    return userId;
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem(this.STORAGE_KEYS.SESSION_ID);
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem(this.STORAGE_KEYS.SESSION_ID, sessionId);
    }
    return sessionId;
  }

  private buildContext(): EventContext {
    const interfaceInfo = this.detectInterface();
    
    return {
      appVersion: this.config.appVersion,
      device: this.getDeviceInfo(),
      browser: this.getBrowserInfo(),
      screen: `${window.screen.width}x${window.screen.height}`,
      networkStatus: navigator.onLine ? 'online' : 'offline',
      connectionType: this.getConnectionType(),
      url: window.location.href,
      referrer: document.referrer,
      interfaceType: interfaceInfo.type,
      interfaceConfigId: interfaceInfo.configId,
      interfaceConfigVersion: interfaceInfo.version,
    };
  }

  private updateContext(): EventContext {
    this.context.networkStatus = navigator.onLine ? 'online' : 'offline';
    this.context.url = window.location.href;
    this.context.connectionType = this.getConnectionType();
    
    // Update interface info (might have changed)
    const interfaceInfo = this.detectInterface();
    this.context.interfaceType = interfaceInfo.type;
    this.context.interfaceConfigId = interfaceInfo.configId;
    this.context.interfaceConfigVersion = interfaceInfo.version;
    
    return this.context;
  }

  private getDeviceInfo(): string {
    const ua = navigator.userAgent;
    
    // Try to extract device model
    const androidMatch = ua.match(/Android.*;\s*([^)]+)\)/);
    if (androidMatch) {
      return androidMatch[1].trim();
    }

    const iosMatch = ua.match(/(iPhone|iPad|iPod)/);
    if (iosMatch) {
      return iosMatch[1];
    }

    // Fallback
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone/i.test(ua)) return 'iPhone';
    if (/iPad/i.test(ua)) return 'iPad';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac/i.test(ua)) return 'Mac';
    if (/Linux/i.test(ua)) return 'Linux';

    return 'Unknown';
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    
    if (ua.includes('Chrome/')) {
      const version = ua.match(/Chrome\/([\d.]+)/)?.[1];
      return `Chrome ${version}`;
    }
    if (ua.includes('Firefox/')) {
      const version = ua.match(/Firefox\/([\d.]+)/)?.[1];
      return `Firefox ${version}`;
    }
    if (ua.includes('Safari/') && !ua.includes('Chrome')) {
      const version = ua.match(/Version\/([\d.]+)/)?.[1];
      return `Safari ${version}`;
    }

    return 'Unknown';
  }

  private getConnectionType(): string | undefined {
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return conn?.effectiveType || conn?.type;
  }

  /**
   * Detect current interface type and configuration
   */
  private detectInterface(): { type: 'standard' | 'custom'; configId?: string; version?: string } {
    try {
      // Check for custom interface schemas in localStorage
      const activeSchema = localStorage.getItem('ui-schema-active');
      const defaultSchema = localStorage.getItem('ui-schema-default');
      
      if (activeSchema || defaultSchema) {
        try {
          const schema = JSON.parse(activeSchema || defaultSchema || '{}');
          return {
            type: 'custom',
            configId: schema.id || schema.name || 'unknown',
            version: schema.version || '1.0.0',
          };
        } catch {
          // Invalid JSON, treat as standard
        }
      }
      
      // Check if on custom interface route
      if (window.location.pathname === '/custom-interface') {
        return {
          type: 'custom',
          configId: 'unknown',
        };
      }
      
      // Default: standard interface
      return {
        type: 'standard',
      };
    } catch (error) {
      console.error('Failed to detect interface:', error);
      return {
        type: 'standard',
      };
    }
  }

  private getScreenName(): string {
    return document.title || window.location.pathname;
  }

  private async loadManifestVersion(): Promise<void> {
    try {
      const response = await fetch('/manifest.json');
      const manifest = await response.json();
      if (manifest.version) {
        this.config.appVersion = manifest.version;
        this.context.appVersion = manifest.version;
      }
    } catch (error) {
      this.log('Could not load manifest version:', error);
    }
  }

  private loadBuffer(): void {
    try {
      const buffered = localStorage.getItem(this.STORAGE_KEYS.BUFFER);
      if (buffered) {
        this.buffer = JSON.parse(buffered);
        this.log(`Loaded ${this.buffer.length} buffered events`);
      }
    } catch (error) {
      this.log('Error loading buffer:', error);
      localStorage.removeItem(this.STORAGE_KEYS.BUFFER);
    }
  }

  private saveBuffer(): void {
    try {
      localStorage.setItem(this.STORAGE_KEYS.BUFFER, JSON.stringify(this.buffer));
    } catch (error) {
      this.log('Error saving buffer:', error);
      // If localStorage is full, try to send immediately
      if (navigator.onLine) {
        this.sendBatch(this.buffer);
      }
    }
  }

  private addToBuffer(event: AnalyticsEvent): void {
    this.buffer.push(event);
    this.saveBuffer();

    // Auto-flush if batch size reached
    if (this.buffer.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private setupListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.log('Back online, flushing buffer');
      this.flush();
    });

    window.addEventListener('offline', () => {
      this.log('Gone offline');
    });

    // Page unload - send remaining events
    window.addEventListener('beforeunload', () => {
      this.flush();
    });

    // Visibility change - flush when tab becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush();
      }
    });

    // Track navigation (SPA support)
    window.addEventListener('popstate', () => {
      this.trackPageView();
    });

    // Error tracking
    if (this.config.trackErrors) {
      window.addEventListener('error', (event) => {
        this.trackError(event.error || event.message);
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.trackError(`Unhandled Promise Rejection: ${event.reason}`);
      });
    }

    // Performance tracking
    if (this.config.trackPerformance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (perfData) {
            this.track('page.performance', {
              dns_time: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
              connect_time: Math.round(perfData.connectEnd - perfData.connectStart),
              response_time: Math.round(perfData.responseEnd - perfData.requestStart),
              dom_load_time: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
              total_load_time: Math.round(perfData.loadEventEnd - perfData.fetchStart),
            });
          }
        }, 0);
      });
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = window.setInterval(() => {
      if (this.buffer.length > 0 && navigator.onLine) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  private async sendBatch(events: AnalyticsEvent[]): Promise<void> {
    if (events.length === 0) return;

    const payload = JSON.stringify({ events });
    const endpoint = this.config.endpoint;

    this.log(`Sending ${events.length} events to ${endpoint}`);

    // Try sendBeacon first (preferred for reliability)
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon(endpoint, blob);
      
      if (sent) {
        this.onSendSuccess(events);
        return;
      } else {
        this.log('sendBeacon failed, falling back to fetch');
      }
    }

    // Fallback to fetch with keepalive
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
        keepalive: true, // Ensures request completes even if page is unloading
      });

      if (response.ok) {
        this.onSendSuccess(events);
      } else {
        this.log('Server error:', response.status, response.statusText);
        // Keep events in buffer for retry
      }
    } catch (error) {
      this.log('Send error:', error);
      // Keep events in buffer for retry
    }
  }

  private onSendSuccess(sentEvents: AnalyticsEvent[]): void {
    // Remove sent events from buffer
    this.buffer = this.buffer.filter(e => !sentEvents.includes(e));
    this.saveBuffer();
    
    // Update last send time
    localStorage.setItem(this.STORAGE_KEYS.LAST_SEND, new Date().toISOString());
    
    this.log(`Successfully sent ${sentEvents.length} events`);
  }

  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[Analytics]', ...args);
    }
  }
}

// ==================== SINGLETON EXPORT ====================

const analytics = new Analytics();

export default analytics;

// Named exports for convenience
export const {
  init,
  track,
  trackPageView,
  trackScanAttempt,
  trackScanSuccess,
  trackScanFail,
  trackManualInput,
  trackConfirm,
  trackCancel,
  trackCustomButtonClick,
  trackCustomInterfaceLoaded,
  trackCustomInterfaceQRScan,
  trackError,
  trackTiming,
  trackScreenLoadTime,
  flush,
  clear,
} = {
  init: analytics.init.bind(analytics),
  track: analytics.track.bind(analytics),
  trackPageView: analytics.trackPageView.bind(analytics),
  trackScanAttempt: analytics.trackScanAttempt.bind(analytics),
  trackScanSuccess: analytics.trackScanSuccess.bind(analytics),
  trackScanFail: analytics.trackScanFail.bind(analytics),
  trackManualInput: analytics.trackManualInput.bind(analytics),
  trackConfirm: analytics.trackConfirm.bind(analytics),
  trackCancel: analytics.trackCancel.bind(analytics),
  trackCustomButtonClick: analytics.trackCustomButtonClick.bind(analytics),
  trackCustomInterfaceLoaded: analytics.trackCustomInterfaceLoaded.bind(analytics),
  trackCustomInterfaceQRScan: analytics.trackCustomInterfaceQRScan.bind(analytics),
  trackError: analytics.trackError.bind(analytics),
  trackTiming: analytics.trackTiming.bind(analytics),
  trackScreenLoadTime: analytics.trackScreenLoadTime.bind(analytics),
  startTimer: analytics.startTimer.bind(analytics),
  stopTimer: analytics.stopTimer.bind(analytics),
  trackMetric: analytics.trackMetric.bind(analytics),
  flush: analytics.flush.bind(analytics),
  clear: analytics.clear.bind(analytics),
};


