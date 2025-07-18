/**
 * CLAIR Analytics Tracker - Advanced Heatmap & User Behavior Tracking
 * Comprehensive tracking system for healthcare application user interactions
 */

class ClairAnalyticsTracker {
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
    return 'clair_session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
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
      
      console.log('🏥 CLAIR Analytics Tracker initialized for healthcare system');
    } catch (error) {
      console.error('CLAIR Analytics initialization failed:', error);
    }
  }

  setupEventListeners() {
    // Click tracking with enhanced data
    document.addEventListener('click', (e) => {
      if (!this.options.clickTrackingEnabled) return;
      
      const clickData = this.captureClickData(e);
      this.trackHeatmapEvent('click', clickData);
      this.userBehavior.totalClicks++;
      
      // Track specific healthcare UI elements
      if (e.target.tagName === 'BUTTON') {
        this.userBehavior.buttonClicks++;
        this.trackHealthcareAction('button_click', e.target);
      } else if (e.target.tagName === 'A') {
        this.userBehavior.linkClicks++;
        this.trackHealthcareAction('link_click', e.target);
      }
      
      // Track healthcare-specific elements
      this.trackHealthcareInteraction(e.target);
      
      // Detect rage clicks
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
      
      // Track healthcare form interactions
      this.trackHealthcareFormInteraction(e.target);
    });

    // Touch events for mobile healthcare workers
    document.addEventListener('touchstart', (e) => {
      const touchData = this.captureTouchData(e);
      this.trackHeatmapEvent('touch', touchData);
    });

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      const keyData = this.captureKeyData(e);
      this.trackHeatmapEvent('keyboard', keyData);
    });

    // Before page unload
    window.addEventListener('beforeunload', () => {
      this.trackPageLeave();
      this.sendDataImmediate();
    });
  }

  trackHealthcareInteraction(element) {
    // Track interactions with healthcare-specific elements
    const classList = element.classList;
    const dataAttributes = element.dataset;
    
    // Patient-related interactions
    if (classList.contains('patient-card') || element.closest('.patient-card')) {
      this.trackEvent('patient_interaction', {
        patientId: dataAttributes.patientId,
        interactionType: 'card_click',
        timestamp: Date.now()
      });
    }
    
    // Report-related interactions
    if (classList.contains('report-item') || element.closest('.report-item')) {
      this.trackEvent('report_interaction', {
        reportId: dataAttributes.reportId,
        interactionType: 'report_click',
        timestamp: Date.now()
      });
    }
    
    // Communication-related interactions
    if (classList.contains('communication-item') || element.closest('.communication-item')) {
      this.trackEvent('communication_interaction', {
        communicationId: dataAttributes.communicationId,
        isUrgent: dataAttributes.urgent === 'true',
        interactionType: 'communication_click',
        timestamp: Date.now()
      });
    }
    
    // Bristol Scale interactions
    if (classList.contains('bristol-scale') || element.closest('.bristol-scale')) {
      this.trackEvent('bristol_interaction', {
        scaleValue: dataAttributes.scaleValue,
        patientId: dataAttributes.patientId,
        interactionType: 'bristol_click',
        timestamp: Date.now()
      });
    }
  }

  trackHealthcareAction(action, element) {
    const context = this.getHealthcareContext(element);
    
    this.trackEvent('healthcare_action', {
      action,
      context,
      element: {
        tagName: element.tagName,
        className: element.className,
        id: element.id,
        textContent: element.textContent?.substring(0, 50)
      },
      timestamp: Date.now()
    });
  }

  trackHealthcareFormInteraction(element) {
    const formType = this.identifyFormType(element);
    
    this.trackEvent('healthcare_form_interaction', {
      formType,
      fieldName: element.name,
      fieldType: element.type,
      formId: element.form?.id,
      timestamp: Date.now()
    });
  }

  getHealthcareContext(element) {
    // Determine healthcare context based on URL and element
    const path = window.location.pathname;
    const context = {
      page: path,
      section: null,
      module: null
    };
    
    if (path.includes('/dashboard')) {
      context.module = 'dashboard';
    } else if (path.includes('/patients')) {
      context.module = 'patients';
    } else if (path.includes('/reports')) {
      context.module = 'reports';
    } else if (path.includes('/communications')) {
      context.module = 'communications';
    } else if (path.includes('/bristol')) {
      context.module = 'bristol';
    } else if (path.includes('/observations')) {
      context.module = 'observations';
    }
    
    // Determine section based on element context
    const sectionElement = element.closest('[data-section]');
    if (sectionElement) {
      context.section = sectionElement.dataset.section;
    }
    
    return context;
  }

  identifyFormType(element) {
    const form = element.form;
    if (!form) return 'unknown';
    
    const formId = form.id;
    const formClass = form.className;
    
    if (formId.includes('patient') || formClass.includes('patient')) {
      return 'patient_form';
    } else if (formId.includes('report') || formClass.includes('report')) {
      return 'report_form';
    } else if (formId.includes('communication') || formClass.includes('communication')) {
      return 'communication_form';
    } else if (formId.includes('bristol') || formClass.includes('bristol')) {
      return 'bristol_form';
    } else if (formId.includes('observation') || formClass.includes('observation')) {
      return 'observation_form';
    }
    
    return 'general_form';
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
      button: e.button,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      healthcareContext: this.getHealthcareContext(e.target)
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
      intensity: 0.3,
      movement: {
        deltaX: e.movementX || 0,
        deltaY: e.movementY || 0
      }
    };
  }

  captureScrollData() {
    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    return {
      x: window.innerWidth / 2,
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
        value_length: e.target.value ? e.target.value.length : 0,
        formType: this.identifyFormType(e.target)
      },
      intensity: 0.7,
      healthcareContext: this.getHealthcareContext(e.target)
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
        name: element.name,
        // Healthcare-specific attributes
        patientId: element.dataset.patientId,
        reportId: element.dataset.reportId,
        communicationId: element.dataset.communicationId,
        urgent: element.dataset.urgent
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
    
    // Higher intensity for healthcare interactive elements
    const healthcareElements = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
    if (healthcareElements.includes(elementData.tagName)) {
      return 0.9;
    }
    
    // Medium intensity for healthcare content elements
    const contentElements = ['DIV', 'SPAN', 'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
    if (contentElements.includes(elementData.tagName)) {
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
    
    this.recentClicks = this.recentClicks.filter(click => now - click.timestamp < 2000);
    this.recentClicks.push(clickData);
    
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
          timestamp: now,
          healthcareContext: clickData.healthcareContext
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
      timestamp: Date.now(),
      healthcareModule: this.getHealthcareContext(document.body).module
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
      console.error('Failed to send CLAIR analytics data:', error);
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
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.options.endpoint, JSON.stringify(data));
    } else {
      fetch(this.options.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(error => {
        console.error('Failed to send final CLAIR analytics data:', error);
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

  track(eventName, data = {}) {
    this.trackEvent(eventName, data);
  }

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

// Auto-initialize for CLAIR healthcare system
if (typeof window !== 'undefined') {
  window.ClairAnalytics = window.ClairAnalytics || new ClairAnalyticsTracker();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClairAnalyticsTracker;
}