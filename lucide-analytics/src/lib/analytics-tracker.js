/**
 * Healthcare Analytics Tracker
 * Lightweight analytics script for healthcare systems
 * Features: Heatmap tracking, Live visitor intelligence, Web analytics
 */

(function(window, document) {
  'use strict';

  // Configuration
  const CONFIG = {
    apiEndpoint: '/api/analytics',
    socketUrl: window.location.origin,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    heatmapRadius: 25,
    trackClicks: true,
    trackScrolls: true,
    trackHovers: true,
    trackPageViews: true,
    enableHeatmap: true,
    enableLiveVisitors: true,
    enableRealTimeUpdates: true
  };

  // Analytics core class
  class HealthcareAnalytics {
    constructor(config = {}) {
      this.config = { ...CONFIG, ...config };
      this.sessionId = this.generateSessionId();
      this.userId = this.getUserId();
      this.events = [];
      this.heatmapPoints = [];
      this.isActive = true;
      this.lastActivity = Date.now();
      
      this.init();
    }

    init() {
      this.setupEventListeners();
      this.startSession();
      this.setupHeartbeat();
      if (this.config.enableRealTimeUpdates) {
        this.initWebSocket();
      }
      this.trackPageView();
    }

    generateSessionId() {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getUserId() {
      let userId = localStorage.getItem('healthcare_analytics_user_id');
      if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('healthcare_analytics_user_id', userId);
      }
      return userId;
    }

    setupEventListeners() {
      // Click tracking
      if (this.config.trackClicks) {
        document.addEventListener('click', (e) => {
          this.trackEvent('click', {
            x: e.clientX,
            y: e.clientY,
            element: this.getElementInfo(e.target)
          });
        });
      }

      // Scroll tracking
      if (this.config.trackScrolls) {
        let scrollTimer;
        document.addEventListener('scroll', () => {
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(() => {
            this.trackEvent('scroll', {
              scrollY: window.scrollY,
              scrollX: window.scrollX
            });
          }, 100);
        });
      }

      // Hover tracking for heatmap
      if (this.config.trackHovers && this.config.enableHeatmap) {
        let hoverTimer;
        document.addEventListener('mousemove', (e) => {
          clearTimeout(hoverTimer);
          hoverTimer = setTimeout(() => {
            this.addHeatmapPoint(e.clientX, e.clientY);
          }, 500);
        });
      }

      // Page visibility
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.isActive = false;
        } else {
          this.isActive = true;
          this.lastActivity = Date.now();
        }
      });

      // Beforeunload
      window.addEventListener('beforeunload', () => {
        this.endSession();
      });
    }

    trackEvent(type, data = {}) {
      const event = {
        id: this.generateEventId(),
        type,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...data
      };

      this.events.push(event);
      this.lastActivity = Date.now();
      
      // Send event immediately for real-time features
      if (this.config.enableRealTimeUpdates) {
        this.sendEvent(event);
      }
    }

    addHeatmapPoint(x, y, intensity = 1) {
      const point = {
        x,
        y,
        intensity,
        timestamp: Date.now()
      };
      
      this.heatmapPoints.push(point);
      
      // Update live visitor position
      if (this.config.enableLiveVisitors) {
        this.updateLiveVisitorPosition(x, y);
      }
    }

    updateLiveVisitorPosition(x, y) {
      if (this.socket && this.socket.connected) {
        this.socket.emit('visitor-position', {
          sessionId: this.sessionId,
          x,
          y,
          timestamp: Date.now()
        });
      }
    }

    trackPageView() {
      this.trackEvent('pageview', {
        title: document.title,
        referrer: document.referrer
      });
    }

    startSession() {
      this.trackEvent('session', {
        type: 'start',
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        screen: {
          width: screen.width,
          height: screen.height
        }
      });
    }

    endSession() {
      this.trackEvent('session', {
        type: 'end',
        duration: Date.now() - this.lastActivity
      });
      
      // Send remaining events
      if (this.events.length > 0) {
        this.sendBatch();
      }
    }

    setupHeartbeat() {
      setInterval(() => {
        if (this.isActive && Date.now() - this.lastActivity < this.config.sessionTimeout) {
          this.trackEvent('heartbeat');
        }
      }, 30000); // 30 seconds
    }

    initWebSocket() {
      if (typeof io !== 'undefined') {
        this.socket = io(this.config.socketUrl);
        
        this.socket.on('connect', () => {
          console.log('Analytics WebSocket connected');
        });

        this.socket.on('disconnect', () => {
          console.log('Analytics WebSocket disconnected');
        });
      }
    }

    sendEvent(event) {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.config.apiEndpoint, JSON.stringify(event));
      } else {
        fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
          keepalive: true
        }).catch(err => console.warn('Analytics send failed:', err));
      }
    }

    sendBatch() {
      if (this.events.length === 0) return;
      
      const batch = {
        sessionId: this.sessionId,
        events: this.events.splice(0, 100), // Send max 100 events at once
        heatmapPoints: this.heatmapPoints.splice(0, 200) // Send max 200 heatmap points
      };

      this.sendEvent(batch);
    }

    getElementInfo(element) {
      return {
        tagName: element.tagName,
        className: element.className,
        id: element.id,
        textContent: element.textContent?.substring(0, 100) || '',
        href: element.href || null
      };
    }

    generateEventId() {
      return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Public API methods
    setConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
    }

    getHeatmapData() {
      return this.heatmapPoints;
    }

    getAnalyticsData() {
      return {
        sessionId: this.sessionId,
        userId: this.userId,
        events: this.events,
        heatmapPoints: this.heatmapPoints
      };
    }

    // Manual tracking methods
    track(eventName, properties = {}) {
      this.trackEvent('custom', {
        eventName,
        properties
      });
    }

    identify(userId, traits = {}) {
      this.userId = userId;
      localStorage.setItem('healthcare_analytics_user_id', userId);
      this.trackEvent('identify', {
        userId,
        traits
      });
    }

    page(name, properties = {}) {
      this.trackEvent('page', {
        name,
        properties
      });
    }
  }

  // Initialize analytics
  window.HealthcareAnalytics = HealthcareAnalytics;
  
  // Auto-initialize if not disabled
  if (!window.HEALTHCARE_ANALYTICS_DISABLE_AUTO_INIT) {
    window.healthcareAnalytics = new HealthcareAnalytics();
  }

  // Export for module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealthcareAnalytics;
  }

})(window, document);