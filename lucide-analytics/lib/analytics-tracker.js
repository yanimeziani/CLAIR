/**
 * LUCIDE Analytics Tracker - Advanced Heatmap & User Behavior Tracking
 * Comprehensive tracking system for click, scroll, and mouse movement heatmaps
 */

class LucideAnalyticsTracker {
  constructor(options = {}) {
    this.options = {
      endpoint: '/analytics/api/analytics',
      sessionDuration: 30 * 60 * 1000, // 30 minutes
      batchSize: 50,
      sendInterval: 10000, // 10 seconds
      heatmapEnabled: true,
      scrollTrackingEnabled: true,
      clickTrackingEnabled: true,
      mouseMoveTrackingEnabled: true,
      formTrackingEnabled: true,
      ...options
    };

    this.sessionId = this.generateSessionId();
    this.eventQueue = [];
    this.heatmapData = [];
    this.isInitialized = false;
    this.mouseTrackingThrottle = 100; // ms
    this.scrollTrackingThrottle = 250; // ms
    this.lastMouseEvent = 0;
    this.lastScrollEvent = 0;
    
    // User behavior tracking
    this.userBehavior = {
      totalClicks: 0,
      totalScrolls: 0,
      totalMouseMoves: 0,
      timeSpent: 0,
      pageViews: 0,
      formInteractions: 0,
      buttonClicks: 0,
      linkClicks: 0,
      rage_clicks: 0,
      dead_clicks: 0,
      attention_time: 0
    };

    this.startTime = Date.now();
    this.pageViewStart = Date.now();
    this.isVisible = true;
    this.attentionStartTime = Date.now();
    
    this.init();
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  init() {
    if (this.isInitialized) return;

    try {
      this.setupEventListeners();
      this.setupVisibilityTracking();
      this.setupPerformanceTracking();
      this.startSendingData();
      this.trackPageView();
      this.isInitialized = true;
      
      console.log('🔥 LUCIDE Analytics Tracker initialized with advanced heatmap features');
    } catch (error) {
      console.error('LUCIDE Analytics initialization failed:', error);
    }
  }

  setupEventListeners() {
    // Click tracking with enhanced data
    document.addEventListener('click', (e) => {
      if (!this.options.clickTrackingEnabled) return;
      
      const clickData = this.captureClickData(e);
      this.trackHeatmapEvent('click', clickData);
      this.userBehavior.totalClicks++;
      
      // Track specific element types
      if (e.target.tagName === 'BUTTON') {
        this.userBehavior.buttonClicks++;
      } else if (e.target.tagName === 'A') {
        this.userBehavior.linkClicks++;
      }
      
      // Detect rage clicks (multiple clicks in short time)
      this.detectRageClicks(clickData);
    });

    // Mouse movement tracking (throttled)
    document.addEventListener('mousemove', (e) => {
      if (!this.options.mouseMoveTrackingEnabled) return;
      
      const now = Date.now();
      if (now - this.lastMouseEvent < this.mouseTrackingThrottle) return;
      this.lastMouseEvent = now;
      
      const mouseData = this.captureMouseData(e);
      this.trackHeatmapEvent('mousemove', mouseData);
      this.userBehavior.totalMouseMoves++;
    });

    // Scroll tracking (throttled)
    document.addEventListener('scroll', (e) => {
      if (!this.options.scrollTrackingEnabled) return;
      
      const now = Date.now();
      if (now - this.lastScrollEvent < this.scrollTrackingThrottle) return;
      this.lastScrollEvent = now;
      
      const scrollData = this.captureScrollData();
      this.trackHeatmapEvent('scroll', scrollData);
      this.userBehavior.totalScrolls++;
    });

    // Form interaction tracking
    document.addEventListener('input', (e) => {
      if (!this.options.formTrackingEnabled) return;
      
      const formData = this.captureFormData(e);
      this.trackHeatmapEvent('form_input', formData);
      this.userBehavior.formInteractions++;
    });

    // Touch events for mobile
    document.addEventListener('touchstart', (e) => {
      const touchData = this.captureTouchData(e);
      this.trackHeatmapEvent('touch', touchData);
    });

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      const keyData = this.captureKeyData(e);
      this.trackHeatmapEvent('keyboard', keyData);
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.trackEvent('window_resize', {
        width: window.innerWidth,
        height: window.innerHeight,
        timestamp: Date.now()
      });
    });

    // Before page unload
    window.addEventListener('beforeunload', () => {
      this.trackPageLeave();
      this.sendDataImmediate();
    });
  }

  captureClickData(e) {
    const rect = e.target.getBoundingClientRect();
    const elementData = this.getElementData(e.target);
    
    return {
      x: e.clientX,
      y: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY,
      element: elementData,
      timestamp: Date.now(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      scroll: {
        x: window.scrollX,
        y: window.scrollY
      },
      intensity: this.calculateClickIntensity(elementData),
      button: e.button, // 0: left, 1: middle, 2: right
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey
    };
  }

  captureMouseData(e) {
    return {
      x: e.clientX,
      y: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY,
      timestamp: Date.now(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      scroll: {
        x: window.scrollX,
        y: window.scrollY
      },
      intensity: 0.3, // Lower intensity for mouse moves
      movement: {
        deltaX: e.movementX || 0,
        deltaY: e.movementY || 0
      }
    };
  }

  captureScrollData() {
    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    return {
      x: window.innerWidth / 2, // Center of viewport
      y: window.innerHeight / 2,
      pageX: window.scrollX + window.innerWidth / 2,
      pageY: window.scrollY + window.innerHeight / 2,
      timestamp: Date.now(),
      scroll: {
        x: window.scrollX,
        y: window.scrollY,
        percentage: Math.min(100, Math.max(0, scrollPercentage))
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      intensity: 0.5,
      direction: this.getScrollDirection()
    };
  }

  captureFormData(e) {
    const elementData = this.getElementData(e.target);
    
    return {
      x: e.target.offsetLeft + e.target.offsetWidth / 2,
      y: e.target.offsetTop + e.target.offsetHeight / 2,
      timestamp: Date.now(),
      element: elementData,
      formData: {
        type: e.target.type,
        name: e.target.name,
        id: e.target.id,
        value_length: e.target.value ? e.target.value.length : 0
      },
      intensity: 0.7
    };
  }

  captureTouchData(e) {
    const touch = e.touches[0];
    return {
      x: touch.clientX,
      y: touch.clientY,
      pageX: touch.pageX,
      pageY: touch.pageY,
      timestamp: Date.now(),
      touchCount: e.touches.length,
      intensity: 0.8
    };
  }

  captureKeyData(e) {
    return {
      key: e.key,
      code: e.code,
      timestamp: Date.now(),
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      activeElement: this.getElementData(document.activeElement)
    };
  }

  getElementData(element) {
    if (!element) return null;
    
    return {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      textContent: element.textContent ? element.textContent.substring(0, 100) : '',
      attributes: {
        href: element.href,
        src: element.src,
        alt: element.alt,
        title: element.title,
        type: element.type,
        name: element.name
      },
      position: {
        top: element.offsetTop,
        left: element.offsetLeft,
        width: element.offsetWidth,
        height: element.offsetHeight
      },
      xpath: this.getXPath(element),
      selector: this.getSelector(element)
    };
  }

  getXPath(element) {
    if (!element) return '';
    
    if (element.id) {
      return `//*[@id="${element.id}"]`;
    }
    
    let path = '';
    let current = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let siblings = current.parentNode ? current.parentNode.childNodes : [];
      
      for (let i = 0; i < siblings.length; i++) {
        let sibling = siblings[i];
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === current.tagName) {
          index++;
        }
        if (sibling === current) break;
      }
      
      path = `/${current.tagName.toLowerCase()}[${index}]${path}`;
      current = current.parentNode;
    }
    
    return path;
  }

  getSelector(element) {
    if (!element) return '';
    
    if (element.id) {
      return `#${element.id}`;
    }
    
    let selector = element.tagName.toLowerCase();
    
    if (element.className) {
      selector += '.' + element.className.split(' ').join('.');
    }
    
    return selector;
  }

  calculateClickIntensity(elementData) {
    if (!elementData) return 0.5;
    
    // Higher intensity for interactive elements
    const interactiveElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
    if (interactiveElements.includes(elementData.tagName)) {
      return 0.9;
    }
    
    // Medium intensity for clickable elements
    const clickableElements = ['DIV', 'SPAN', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
    if (clickableElements.includes(elementData.tagName)) {
      return 0.6;
    }
    
    return 0.4;
  }

  getScrollDirection() {
    const currentScroll = window.scrollY;
    const direction = currentScroll > (this.lastScrollPosition || 0) ? 'down' : 'up';
    this.lastScrollPosition = currentScroll;
    return direction;
  }

  detectRageClicks(clickData) {
    const now = Date.now();
    this.recentClicks = this.recentClicks || [];
    
    // Keep only clicks from last 2 seconds
    this.recentClicks = this.recentClicks.filter(click => now - click.timestamp < 2000);
    this.recentClicks.push(clickData);
    
    // Check for rage clicks (4+ clicks in same area within 2 seconds)
    if (this.recentClicks.length >= 4) {
      const sameAreaClicks = this.recentClicks.filter(click => 
        Math.abs(click.x - clickData.x) < 50 && 
        Math.abs(click.y - clickData.y) < 50
      );
      
      if (sameAreaClicks.length >= 4) {
        this.userBehavior.rage_clicks++;
        this.trackEvent('rage_click', {
          area: { x: clickData.x, y: clickData.y },
          count: sameAreaClicks.length,
          timestamp: now
        });
      }
    }
  }

  trackHeatmapEvent(type, data) {
    if (!this.options.heatmapEnabled) return;
    
    const heatmapPoint = {
      type,
      sessionId: this.sessionId,
      url: window.location.href,
      path: window.location.pathname,
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      ...data
    };
    
    this.heatmapData.push(heatmapPoint);
    this.eventQueue.push({
      type: 'heatmap',
      data: heatmapPoint
    });
  }

  trackEvent(type, data) {
    this.eventQueue.push({
      type,
      sessionId: this.sessionId,
      url: window.location.href,
      path: window.location.pathname,
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      data
    });
  }

  trackPageView() {
    this.userBehavior.pageViews++;
    this.trackEvent('page_view', {
      title: document.title,
      url: window.location.href,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      screen: {
        width: screen.width,
        height: screen.height
      },
      timestamp: Date.now()
    });
  }

  trackPageLeave() {
    const timeSpent = Date.now() - this.pageViewStart;
    this.userBehavior.timeSpent += timeSpent;
    
    this.trackEvent('page_leave', {
      timeSpent,
      totalBehavior: this.userBehavior,
      timestamp: Date.now()
    });
  }

  setupVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isVisible = false;
        this.userBehavior.attention_time += Date.now() - this.attentionStartTime;
        this.trackEvent('page_hidden', { timestamp: Date.now() });
      } else {
        this.isVisible = true;
        this.attentionStartTime = Date.now();
        this.trackEvent('page_visible', { timestamp: Date.now() });
      }
    });
  }

  setupPerformanceTracking() {
    // Track page load performance
    window.addEventListener('load', () => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        this.trackEvent('performance', {
          loadTime: timing.loadEventEnd - timing.navigationStart,
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          firstByte: timing.responseStart - timing.navigationStart,
          timestamp: Date.now()
        });
      }
    });
  }

  startSendingData() {
    setInterval(() => {
      this.sendBatchData();
    }, this.options.sendInterval);
  }

  sendBatchData() {
    if (this.eventQueue.length === 0) return;
    
    const batch = this.eventQueue.splice(0, this.options.batchSize);
    
    fetch(this.options.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: batch,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          referrer: document.referrer,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        }
      })
    }).catch(error => {
      console.error('Failed to send analytics data:', error);
      // Re-add events to queue for retry
      this.eventQueue.unshift(...batch);
    });
  }

  sendDataImmediate() {
    if (this.eventQueue.length === 0) return;
    
    const data = {
      events: this.eventQueue,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      final: true
    };
    
    // Use sendBeacon for immediate sending on page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.options.endpoint, JSON.stringify(data));
    } else {
      // Fallback for older browsers
      fetch(this.options.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(error => {
        console.error('Failed to send final analytics data:', error);
      });
    }
    
    this.eventQueue = [];
  }

  // Public API methods
  getHeatmapData() {
    return this.heatmapData;
  }

  getUserBehavior() {
    return {
      ...this.userBehavior,
      sessionDuration: Date.now() - this.startTime,
      currentAttentionTime: this.isVisible ? Date.now() - this.attentionStartTime : 0
    };
  }

  getSessionId() {
    return this.sessionId;
  }

  // Manual event tracking
  track(eventName, data = {}) {
    this.trackEvent(eventName, data);
  }

  // Manual heatmap point
  addHeatmapPoint(x, y, intensity = 0.5, type = 'manual') {
    this.trackHeatmapEvent(type, {
      x, y,
      pageX: x + window.scrollX,
      pageY: y + window.scrollY,
      intensity,
      timestamp: Date.now()
    });
  }
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  window.LucideAnalytics = window.LucideAnalytics || new LucideAnalyticsTracker();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LucideAnalyticsTracker;
}