/**
 * Tests for Session Types
 *
 * This file tests the TypeScript types and interfaces defined in session.types.ts
 * to ensure they work correctly and provide proper type safety.
 */

import {
  UserSession,
  DeviceInfo,
  DeviceType,
  OperatingSystem,
  OSName,
  OSPlatform,
  OSArchitecture,
  BrowserInfo,
  BrowserName,
  BrowserEngine,
  LocationInfo,
  LocationAccuracy,
  SessionConfig,
  SessionTerminationReason,
  SessionAnalytics,
  SessionEvent,
  SessionEventType,
  SessionPerformanceMetrics,
  SessionSecurityEvent,
  SessionSecurityEventType,
  SecuritySeverity,
  SessionActivity,
  SessionId,
  DeviceId,
  UserId,
  SESSION_CONSTANTS
} from './session.types';

describe('DeviceType Enum', () => {
  it('should have correct enum values', () => {
    expect(DeviceType.DESKTOP).toBe('desktop');
    expect(DeviceType.LAPTOP).toBe('laptop');
    expect(DeviceType.TABLET).toBe('tablet');
    expect(DeviceType.MOBILE).toBe('mobile');
    expect(DeviceType.SMART_TV).toBe('smart_tv');
    expect(DeviceType.WEARABLE).toBe('wearable');
    expect(DeviceType.GAMING_CONSOLE).toBe('gaming_console');
    expect(DeviceType.OTHER).toBe('other');
  });
});

describe('OSName Enum', () => {
  it('should have correct enum values', () => {
    expect(OSName.WINDOWS).toBe('windows');
    expect(OSName.MACOS).toBe('macos');
    expect(OSName.LINUX).toBe('linux');
    expect(OSName.ANDROID).toBe('android');
    expect(OSName.IOS).toBe('ios');
    expect(OSName.CHROMEOS).toBe('chromeos');
    expect(OSName.OTHER).toBe('other');
  });
});

describe('OSPlatform Enum', () => {
  it('should have correct enum values', () => {
    expect(OSPlatform.WINDOWS).toBe('windows');
    expect(OSPlatform.DARWIN).toBe('darwin');
    expect(OSPlatform.LINUX).toBe('linux');
    expect(OSPlatform.ANDROID).toBe('android');
    expect(OSPlatform.IOS).toBe('ios');
    expect(OSPlatform.OTHER).toBe('other');
  });
});

describe('OSArchitecture Enum', () => {
  it('should have correct enum values', () => {
    expect(OSArchitecture.X86).toBe('x86');
    expect(OSArchitecture.X64).toBe('x64');
    expect(OSArchitecture.ARM).toBe('arm');
    expect(OSArchitecture.ARM64).toBe('arm64');
    expect(OSArchitecture.OTHER).toBe('other');
  });
});

describe('BrowserName Enum', () => {
  it('should have correct enum values', () => {
    expect(BrowserName.CHROME).toBe('chrome');
    expect(BrowserName.FIREFOX).toBe('firefox');
    expect(BrowserName.SAFARI).toBe('safari');
    expect(BrowserName.EDGE).toBe('edge');
    expect(BrowserName.OPERA).toBe('opera');
    expect(BrowserName.BRAVE).toBe('brave');
    expect(BrowserName.VIVALDI).toBe('vivaldi');
    expect(BrowserName.INTERNET_EXPLORER).toBe('internet_explorer');
    expect(BrowserName.OTHER).toBe('other');
  });
});

describe('BrowserEngine Enum', () => {
  it('should have correct enum values', () => {
    expect(BrowserEngine.WEBKIT).toBe('webkit');
    expect(BrowserEngine.GECKO).toBe('gecko');
    expect(BrowserEngine.BLINK).toBe('blink');
    expect(BrowserEngine.EDGE_HTML).toBe('edge_html');
    expect(BrowserEngine.OTHER).toBe('other');
  });
});

describe('LocationAccuracy Enum', () => {
  it('should have correct enum values', () => {
    expect(LocationAccuracy.EXACT).toBe('exact');
    expect(LocationAccuracy.CITY).toBe('city');
    expect(LocationAccuracy.REGION).toBe('region');
    expect(LocationAccuracy.COUNTRY).toBe('country');
    expect(LocationAccuracy.UNKNOWN).toBe('unknown');
  });
});

describe('SessionTerminationReason Enum', () => {
  it('should have correct enum values', () => {
    expect(SessionTerminationReason.USER_LOGOUT).toBe('user_logout');
    expect(SessionTerminationReason.ADMIN_TERMINATION).toBe('admin_termination');
    expect(SessionTerminationReason.SECURITY_VIOLATION).toBe('security_violation');
    expect(SessionTerminationReason.SESSION_EXPIRED).toBe('session_expired');
    expect(SessionTerminationReason.DEVICE_CHANGE).toBe('device_change');
    expect(SessionTerminationReason.LOCATION_CHANGE).toBe('location_change');
    expect(SessionTerminationReason.SUSPICIOUS_ACTIVITY).toBe('suspicious_activity');
    expect(SessionTerminationReason.PASSWORD_CHANGE).toBe('password_change');
    expect(SessionTerminationReason.ACCOUNT_DEACTIVATED).toBe('account_deactivated');
    expect(SessionTerminationReason.SYSTEM_MAINTENANCE).toBe('system_maintenance');
  });
});

describe('SessionEventType Enum', () => {
  it('should have correct enum values', () => {
    expect(SessionEventType.PAGE_VIEW).toBe('page_view');
    expect(SessionEventType.BUTTON_CLICK).toBe('button_click');
    expect(SessionEventType.FORM_SUBMIT).toBe('form_submit');
    expect(SessionEventType.API_CALL).toBe('api_call');
    expect(SessionEventType.FILE_DOWNLOAD).toBe('file_download');
    expect(SessionEventType.FILE_UPLOAD).toBe('file_upload');
    expect(SessionEventType.SEARCH).toBe('search');
    expect(SessionEventType.NAVIGATION).toBe('navigation');
    expect(SessionEventType.ERROR).toBe('error');
    expect(SessionEventType.CUSTOM).toBe('custom');
  });
});

describe('SessionSecurityEventType Enum', () => {
  it('should have correct enum values', () => {
    expect(SessionSecurityEventType.UNUSUAL_LOCATION).toBe('unusual_location');
    expect(SessionSecurityEventType.UNUSUAL_DEVICE).toBe('unusual_device');
    expect(SessionSecurityEventType.UNUSUAL_TIME).toBe('unusual_time');
    expect(SessionSecurityEventType.MULTIPLE_FAILED_ATTEMPTS).toBe('multiple_failed_attempts');
    expect(SessionSecurityEventType.SUSPICIOUS_IP).toBe('suspicious_ip');
    expect(SessionSecurityEventType.VPN_USAGE).toBe('vpn_usage');
    expect(SessionSecurityEventType.TOR_USAGE).toBe('tor_usage');
    expect(SessionSecurityEventType.AUTOMATED_ACTIVITY).toBe('automated_activity');
    expect(SessionSecurityEventType.SESSION_HIJACKING_ATTEMPT).toBe('session_hijacking_attempt');
    expect(SessionSecurityEventType.BRUTE_FORCE_ATTACK).toBe('brute_force_attack');
  });
});

describe('SecuritySeverity Enum', () => {
  it('should have correct enum values', () => {
    expect(SecuritySeverity.LOW).toBe('low');
    expect(SecuritySeverity.MEDIUM).toBe('medium');
    expect(SecuritySeverity.HIGH).toBe('high');
    expect(SecuritySeverity.CRITICAL).toBe('critical');
  });
});

describe('OperatingSystem Interface', () => {
  it('should create a valid OperatingSystem object', () => {
    const os: OperatingSystem = {
      name: OSName.MACOS,
      version: '14.0',
      platform: OSPlatform.DARWIN,
      architecture: OSArchitecture.ARM64
    };

    expect(os.name).toBe(OSName.MACOS);
    expect(os.version).toBe('14.0');
    expect(os.platform).toBe(OSPlatform.DARWIN);
    expect(os.architecture).toBe(OSArchitecture.ARM64);
  });
});

describe('BrowserInfo Interface', () => {
  it('should create a valid BrowserInfo object', () => {
    const browser: BrowserInfo = {
      name: BrowserName.CHROME,
      version: '120.0.0.0',
      engine: BrowserEngine.BLINK,
      isMobile: false,
      isBot: false,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    };

    expect(browser.name).toBe(BrowserName.CHROME);
    expect(browser.version).toBe('120.0.0.0');
    expect(browser.engine).toBe(BrowserEngine.BLINK);
    expect(browser.isMobile).toBe(false);
    expect(browser.isBot).toBe(false);
  });
});

describe('DeviceInfo Interface', () => {
  it('should create a valid DeviceInfo object', () => {
    const device: DeviceInfo = {
      id: 'device-1',
      type: DeviceType.LAPTOP,
      os: {
        name: OSName.MACOS,
        version: '14.0',
        platform: OSPlatform.DARWIN,
        architecture: OSArchitecture.ARM64
      },
      browser: {
        name: BrowserName.CHROME,
        version: '120.0.0.0',
        engine: BrowserEngine.BLINK,
        isMobile: false,
        isBot: false,
        userAgent: 'Mozilla/5.0...'
      },
      hardwareId: 'ABC123',
      fingerprint: 'fp123',
      isTrusted: true,
      trustScore: 85,
      firstSeenAt: new Date(),
      lastSeenAt: new Date()
    };

    expect(device.id).toBe('device-1');
    expect(device.type).toBe(DeviceType.LAPTOP);
    expect(device.os.name).toBe(OSName.MACOS);
    expect(device.browser.name).toBe(BrowserName.CHROME);
    expect(device.isTrusted).toBe(true);
    expect(device.trustScore).toBe(85);
  });

  it('should handle optional properties', () => {
    const device: DeviceInfo = {
      id: 'device-1',
      type: DeviceType.MOBILE,
      os: {
        name: OSName.ANDROID,
        version: '13.0',
        platform: OSPlatform.ANDROID,
        architecture: OSArchitecture.ARM64
      },
      browser: {
        name: BrowserName.CHROME,
        version: '120.0.0.0',
        engine: BrowserEngine.BLINK,
        isMobile: true,
        isBot: false,
        userAgent: 'Mozilla/5.0...'
      },
      isTrusted: false,
      trustScore: 50,
      firstSeenAt: new Date(),
      lastSeenAt: new Date()
    };

    expect(device.hardwareId).toBeUndefined();
    expect(device.fingerprint).toBeUndefined();
  });
});

describe('LocationInfo Interface', () => {
  it('should create a valid LocationInfo object', () => {
    const location: LocationInfo = {
      country: 'United States',
      countryCode: 'US',
      region: 'California',
      regionCode: 'CA',
      city: 'San Francisco',
      postalCode: '94105',
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: 'America/Los_Angeles',
      isp: 'Comcast',
      organization: 'Comcast Corporation',
      accuracy: LocationAccuracy.EXACT
    };

    expect(location.country).toBe('United States');
    expect(location.countryCode).toBe('US');
    expect(location.city).toBe('San Francisco');
    expect(location.latitude).toBe(37.7749);
    expect(location.longitude).toBe(-122.4194);
    expect(location.accuracy).toBe(LocationAccuracy.EXACT);
  });

  it('should handle optional properties', () => {
    const location: LocationInfo = {
      country: 'Unknown',
      countryCode: 'XX',
      region: 'Unknown',
      regionCode: 'XX',
      city: 'Unknown',
      timezone: 'UTC',
      accuracy: LocationAccuracy.UNKNOWN
    };

    expect(location.postalCode).toBeUndefined();
    expect(location.latitude).toBeUndefined();
    expect(location.longitude).toBeUndefined();
    expect(location.isp).toBeUndefined();
    expect(location.organization).toBeUndefined();
  });
});

describe('UserSession Interface', () => {
  it('should create a valid UserSession object', () => {
    const session: UserSession = {
      id: 'session-1',
      userId: 'user-1',
      tokenHash: 'hash123',
      refreshTokenHash: 'refreshHash123',
      deviceInfo: {
        id: 'device-1',
        type: DeviceType.DESKTOP,
        os: {
          name: OSName.WINDOWS,
          version: '11.0',
          platform: OSPlatform.WINDOWS,
          architecture: OSArchitecture.X64
        },
        browser: {
          name: BrowserName.CHROME,
          version: '120.0.0.0',
          engine: BrowserEngine.BLINK,
          isMobile: false,
          isBot: false,
          userAgent: 'Mozilla/5.0...'
        },
        isTrusted: true,
        trustScore: 90,
        firstSeenAt: new Date(),
        lastSeenAt: new Date()
      },
      location: {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        regionCode: 'CA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        accuracy: LocationAccuracy.CITY
      },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      isActive: true,
      isCurrentSession: true,
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
      terminationReason: SessionTerminationReason.USER_LOGOUT
    };

    expect(session.id).toBe('session-1');
    expect(session.userId).toBe('user-1');
    expect(session.isActive).toBe(true);
    expect(session.isCurrentSession).toBe(true);
    expect(session.terminationReason).toBe(SessionTerminationReason.USER_LOGOUT);
  });

  it('should handle optional properties', () => {
    const session: UserSession = {
      id: 'session-1',
      userId: 'user-1',
      tokenHash: 'hash123',
      deviceInfo: {
        id: 'device-1',
        type: DeviceType.MOBILE,
        os: {
          name: OSName.ANDROID,
          version: '13.0',
          platform: OSPlatform.ANDROID,
          architecture: OSArchitecture.ARM64
        },
        browser: {
          name: BrowserName.CHROME,
          version: '120.0.0.0',
          engine: BrowserEngine.BLINK,
          isMobile: true,
          isBot: false,
          userAgent: 'Mozilla/5.0...'
        },
        isTrusted: false,
        trustScore: 60,
        firstSeenAt: new Date(),
        lastSeenAt: new Date()
      },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      isActive: true,
      isCurrentSession: false,
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date()
    };

    expect(session.refreshTokenHash).toBeUndefined();
    expect(session.location).toBeUndefined();
    expect(session.terminatedAt).toBeUndefined();
    expect(session.terminationReason).toBeUndefined();
  });
});

describe('SessionConfig Interface', () => {
  it('should create a valid SessionConfig object', () => {
    const config: SessionConfig = {
      maxSessionsPerUser: 5,
      sessionTimeout: 1440, // 24 hours in minutes
      refreshTokenTimeout: 30, // 30 days
      deviceTrackingEnabled: true,
      locationTrackingEnabled: true,
      suspiciousActivityDetection: true,
      autoTerminateInactiveSessions: true,
      inactiveSessionTimeout: 480 // 8 hours
    };

    expect(config.maxSessionsPerUser).toBe(5);
    expect(config.sessionTimeout).toBe(1440);
    expect(config.refreshTokenTimeout).toBe(30);
    expect(config.deviceTrackingEnabled).toBe(true);
    expect(config.locationTrackingEnabled).toBe(true);
    expect(config.suspiciousActivityDetection).toBe(true);
    expect(config.autoTerminateInactiveSessions).toBe(true);
    expect(config.inactiveSessionTimeout).toBe(480);
  });
});

describe('SessionEvent Interface', () => {
  it('should create a valid SessionEvent object', () => {
    const event: SessionEvent = {
      id: 'event-1',
      type: SessionEventType.PAGE_VIEW,
      timestamp: new Date(),
      data: { page: '/dashboard', duration: 5000 },
      page: '/dashboard',
      action: 'view'
    };

    expect(event.id).toBe('event-1');
    expect(event.type).toBe(SessionEventType.PAGE_VIEW);
    expect(event.timestamp).toBeInstanceOf(Date);
    expect(event.data?.page).toBe('/dashboard');
    expect(event.page).toBe('/dashboard');
    expect(event.action).toBe('view');
  });

  it('should handle optional properties', () => {
    const event: SessionEvent = {
      id: 'event-1',
      type: SessionEventType.BUTTON_CLICK,
      timestamp: new Date()
    };

    expect(event.data).toBeUndefined();
    expect(event.page).toBeUndefined();
    expect(event.action).toBeUndefined();
  });
});

describe('SessionPerformanceMetrics Interface', () => {
  it('should create a valid SessionPerformanceMetrics object', () => {
    const metrics: SessionPerformanceMetrics = {
      averageResponseTime: 250,
      totalRequests: 100,
      failedRequests: 2,
      bandwidthUsed: 1024000, // 1MB
      memoryUsage: 52428800, // 50MB
      cpuUsage: 15.5
    };

    expect(metrics.averageResponseTime).toBe(250);
    expect(metrics.totalRequests).toBe(100);
    expect(metrics.failedRequests).toBe(2);
    expect(metrics.bandwidthUsed).toBe(1024000);
    expect(metrics.memoryUsage).toBe(52428800);
    expect(metrics.cpuUsage).toBe(15.5);
  });

  it('should handle optional properties', () => {
    const metrics: SessionPerformanceMetrics = {
      averageResponseTime: 300,
      totalRequests: 50,
      failedRequests: 0,
      bandwidthUsed: 512000
    };

    expect(metrics.memoryUsage).toBeUndefined();
    expect(metrics.cpuUsage).toBeUndefined();
  });
});

describe('SessionAnalytics Interface', () => {
  it('should create a valid SessionAnalytics object', () => {
    const events: SessionEvent[] = [
      {
        id: 'event-1',
        type: SessionEventType.PAGE_VIEW,
        timestamp: new Date()
      }
    ];

    const securityEvents: SessionSecurityEvent[] = [
      {
        id: 'sec-event-1',
        type: SessionSecurityEventType.UNUSUAL_LOCATION,
        severity: SecuritySeverity.LOW,
        timestamp: new Date(),
        description: 'Login from unusual location',
        resolved: true,
        resolvedAt: new Date(),
        resolution: 'User confirmed legitimate login'
      }
    ];

    const analytics: SessionAnalytics = {
      sessionId: 'session-1',
      userId: 'user-1',
      duration: 3600, // 1 hour in seconds
      pageViews: 25,
      actionsPerformed: 50,
      events,
      performanceMetrics: {
        averageResponseTime: 200,
        totalRequests: 75,
        failedRequests: 1,
        bandwidthUsed: 2048000
      },
      securityEvents,
      createdAt: new Date()
    };

    expect(analytics.sessionId).toBe('session-1');
    expect(analytics.userId).toBe('user-1');
    expect(analytics.duration).toBe(3600);
    expect(analytics.pageViews).toBe(25);
    expect(analytics.actionsPerformed).toBe(50);
    expect(analytics.events).toEqual(events);
    expect(analytics.securityEvents).toEqual(securityEvents);
  });
});

describe('SessionSecurityEvent Interface', () => {
  it('should create a valid SessionSecurityEvent object', () => {
    const securityEvent: SessionSecurityEvent = {
      id: 'sec-event-1',
      type: SessionSecurityEventType.SUSPICIOUS_IP,
      severity: SecuritySeverity.HIGH,
      timestamp: new Date(),
      description: 'Login from suspicious IP address',
      details: { ipAddress: '192.168.1.100', country: 'Unknown' },
      resolved: false
    };

    expect(securityEvent.id).toBe('sec-event-1');
    expect(securityEvent.type).toBe(SessionSecurityEventType.SUSPICIOUS_IP);
    expect(securityEvent.severity).toBe(SecuritySeverity.HIGH);
    expect(securityEvent.timestamp).toBeInstanceOf(Date);
    expect(securityEvent.description).toBe('Login from suspicious IP address');
    expect(securityEvent.resolved).toBe(false);
  });

  it('should handle optional properties', () => {
    const securityEvent: SessionSecurityEvent = {
      id: 'sec-event-1',
      type: SessionSecurityEventType.VPN_USAGE,
      severity: SecuritySeverity.MEDIUM,
      timestamp: new Date(),
      description: 'VPN usage detected',
      resolved: true,
      resolvedAt: new Date(),
      resolution: 'Approved VPN usage'
    };

    expect(securityEvent.details).toBeUndefined();
  });
});

describe('SessionActivity Interface', () => {
  it('should create a valid SessionActivity object', () => {
    const activity: SessionActivity = {
      type: SessionEventType.API_CALL,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      location: {
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        regionCode: 'CA',
        city: 'San Francisco',
        timezone: 'America/Los_Angeles',
        accuracy: LocationAccuracy.CITY
      },
      timestamp: new Date(),
      data: { endpoint: '/api/users', method: 'GET' }
    };

    expect(activity.type).toBe(SessionEventType.API_CALL);
    expect(activity.ipAddress).toBe('192.168.1.1');
    expect(activity.userAgent).toBe('Mozilla/5.0...');
    expect(activity.location?.country).toBe('United States');
    expect(activity.timestamp).toBeInstanceOf(Date);
    expect(activity.data?.endpoint).toBe('/api/users');
  });

  it('should handle optional properties', () => {
    const activity: SessionActivity = {
      type: SessionEventType.PAGE_VIEW,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      timestamp: new Date()
    };

    expect(activity.location).toBeUndefined();
    expect(activity.data).toBeUndefined();
  });
});

describe('SESSION_CONSTANTS', () => {
  it('should have correct constant values', () => {
    expect(SESSION_CONSTANTS.DEFAULT_SESSION_TIMEOUT).toBe(1440);
    expect(SESSION_CONSTANTS.DEFAULT_REFRESH_TOKEN_TIMEOUT).toBe(30);
    expect(SESSION_CONSTANTS.MAX_SESSIONS_PER_USER).toBe(10);
    expect(SESSION_CONSTANTS.DEVICE_TRUST_THRESHOLD).toBe(70);
    expect(SESSION_CONSTANTS.SECURITY_CHECK_INTERVAL).toBe(300000);
    expect(SESSION_CONSTANTS.ANALYTICS_RETENTION_DAYS).toBe(90);
    expect(SESSION_CONSTANTS.ALERT_RETENTION_DAYS).toBe(30);
    expect(SESSION_CONSTANTS.CLEANUP_INTERVAL).toBe(3600000);
  });
});

// Type aliases
describe('Type Aliases', () => {
  it('should work with SessionId', () => {
    const id: SessionId = 'session-1';
    expect(id).toBe('session-1');
  });

  it('should work with DeviceId', () => {
    const id: DeviceId = 'device-1';
    expect(id).toBe('device-1');
  });

  it('should work with UserId', () => {
    const id: UserId = 'user-1';
    expect(id).toBe('user-1');
  });
});

// Type guards for runtime type checking
describe('Type Guards', () => {
  it('should identify DeviceType correctly', () => {
    const isDeviceType = (value: string): value is DeviceType => {
      return Object.values(DeviceType).includes(value as DeviceType);
    };

    expect(isDeviceType('desktop')).toBe(true);
    expect(isDeviceType('invalid')).toBe(false);
  });

  it('should identify OSName correctly', () => {
    const isOSName = (value: string): value is OSName => {
      return Object.values(OSName).includes(value as OSName);
    };

    expect(isOSName('windows')).toBe(true);
    expect(isOSName('invalid')).toBe(false);
  });

  it('should identify BrowserName correctly', () => {
    const isBrowserName = (value: string): value is BrowserName => {
      return Object.values(BrowserName).includes(value as BrowserName);
    };

    expect(isBrowserName('chrome')).toBe(true);
    expect(isBrowserName('invalid')).toBe(false);
  });

  it('should identify SessionEventType correctly', () => {
    const isSessionEventType = (value: string): value is SessionEventType => {
      return Object.values(SessionEventType).includes(value as SessionEventType);
    };

    expect(isSessionEventType('page_view')).toBe(true);
    expect(isSessionEventType('invalid')).toBe(false);
  });

  it('should identify SecuritySeverity correctly', () => {
    const isSecuritySeverity = (value: string): value is SecuritySeverity => {
      return Object.values(SecuritySeverity).includes(value as SecuritySeverity);
    };

    expect(isSecuritySeverity('high')).toBe(true);
    expect(isSecuritySeverity('invalid')).toBe(false);
  });
});