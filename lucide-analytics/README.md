# Healthcare Analytics System

A comprehensive web analytics solution with heatmap visualization and live visitor intelligence, specifically designed for healthcare systems.

## Features

- 🔥 **Real-time Heatmap**: Visual representation of user interactions
- 👥 **Live Visitor Tracking**: Monitor active users in real-time
- 📊 **Web Analytics**: Track clicks, scrolls, page views, and sessions
- 🏥 **Healthcare Optimized**: Compliant with healthcare data standards
- 🚀 **Easy Integration**: Simple script tag integration

## Quick Start

### For CLAIR Healthcare System

1. **Install dependencies**:
```bash
npm install
```

2. **Run the development server**:
```bash
npm run dev
```

3. **Integrate into your healthcare system**:
```html
<!-- Add this to your CLAIR system's HTML head -->
<script src="http://localhost:3000/lib/analytics-tracker.js"></script>
```

## Integration Options

### Option 1: Script Tag (Recommended)
```html
<script src="/lib/analytics-tracker.js"></script>
```

### Option 2: Manual Initialization
```javascript
// Disable auto-init
window.HEALTHCARE_ANALYTICS_DISABLE_AUTO_INIT = true;

// Custom configuration
const analytics = new HealthcareAnalytics({
  apiEndpoint: '/api/analytics',
  enableHeatmap: true,
  enableLiveVisitors: true,
  trackClicks: true,
  trackScrolls: true
});
```

### Option 3: Module Import
```javascript
import HealthcareAnalytics from './lib/analytics-tracker.js';

const analytics = new HealthcareAnalytics({
  // your config
});
```

## API Reference

### Core Methods

```javascript
// Track custom events
analytics.track('button_click', { section: 'header' });

// Identify users
analytics.identify('user123', { role: 'doctor' });

// Track page views
analytics.page('Patient Dashboard', { department: 'cardiology' });

// Get current analytics data
const data = analytics.getAnalyticsData();

// Get heatmap data
const heatmap = analytics.getHeatmapData();
```

### Configuration Options

```javascript
const config = {
  apiEndpoint: '/api/analytics',        // Analytics API endpoint
  socketUrl: window.location.origin,    // WebSocket URL for real-time
  sessionTimeout: 30 * 60 * 1000,      // Session timeout (30 minutes)
  heatmapRadius: 25,                    // Heatmap point radius
  trackClicks: true,                    // Enable click tracking
  trackScrolls: true,                   // Enable scroll tracking
  trackHovers: true,                    // Enable hover tracking
  trackPageViews: true,                 // Enable page view tracking
  enableHeatmap: true,                  // Enable heatmap visualization
  enableLiveVisitors: true,             // Enable live visitor tracking
  enableRealTimeUpdates: true           // Enable real-time updates
};
```

## Dashboard Features

- **Real-time Analytics**: Live visitor count and activity monitoring
- **Heatmap Visualization**: Toggle-able heatmap overlay showing user interaction patterns
- **Session Management**: Track user sessions with detailed event logging
- **Healthcare Compliance**: Privacy-focused data collection and storage

## API Endpoints

- `POST /api/analytics` - Submit analytics events
- `GET /api/analytics` - Retrieve aggregated analytics data
- `GET /api/analytics?type=heatmap` - Get heatmap data
- `GET /api/analytics?sessionId=xxx` - Get specific session data

## Data Types

### Analytics Event
```typescript
interface AnalyticsEvent {
  id: string;
  type: 'click' | 'scroll' | 'hover' | 'pageview' | 'session';
  timestamp: number;
  x?: number;
  y?: number;
  element?: string;
  url: string;
  userAgent: string;
  sessionId: string;
  userId?: string;
}
```

### Heatmap Point
```typescript
interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  timestamp: number;
}
```

### Live Visitor
```typescript
interface LiveVisitor {
  id: string;
  sessionId: string;
  currentPage: string;
  lastActive: number;
  x: number;
  y: number;
  userAgent: string;
  location?: {
    country: string;
    city: string;
  };
}
```

## Security & Privacy

- No personal health information (PHI) is collected
- Data is anonymized and session-based
- Configurable data retention policies
- GDPR and HIPAA considerations built-in

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

## Deployment

1. Build the project: `npm run build`
2. Deploy the built files to your server
3. Ensure your healthcare system can access the analytics script
4. Configure your API endpoints and database connections

## Support

For healthcare system integration support, please refer to the CLAIR system documentation or contact your system administrator.

## License

This project is designed specifically for healthcare systems and should be used in compliance with relevant healthcare data regulations.