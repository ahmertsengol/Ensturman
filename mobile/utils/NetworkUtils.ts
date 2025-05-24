import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface NetworkConfig {
  backendHost: string;
  apiUrl: string;
  isLocal: boolean;
}

/**
 * Network configuration utility for dynamic backend host discovery
 */
export class NetworkUtils {
  private static readonly BACKEND_PORT = 3001;
  private static readonly CACHE_KEY = 'backend_host';
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get optimal backend host configuration
   */
  static async getNetworkConfig(): Promise<NetworkConfig> {
    try {
      // Try to get cached host first
      const cachedConfig = await this.getCachedConfig();
      if (cachedConfig) {
        return cachedConfig;
      }

      // Discover and test backend hosts
      const discoveredHost = await this.discoverBackendHost();
      
      if (discoveredHost) {
        const config: NetworkConfig = {
          backendHost: discoveredHost,
          apiUrl: `${discoveredHost}/api`,
          isLocal: this.isLocalHost(discoveredHost)
        };

        // Cache the working configuration
        await this.cacheConfig(config);
        return config;
      }

      // Fallback to default configuration
      return this.getDefaultConfig();

    } catch (error) {
      console.warn('Network discovery failed, using default config:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Discover backend host by testing multiple IP addresses
   */
  private static async discoverBackendHost(): Promise<string | null> {
    const candidateIPs = await this.getCandidateIPs();
    
    console.log('🔍 Testing backend connectivity on IPs:', candidateIPs);

    // Test each candidate IP
    for (const ip of candidateIPs) {
      const host = `http://${ip}:${this.BACKEND_PORT}`;
      
      try {
        const isReachable = await this.testBackendConnection(host);
        if (isReachable) {
          console.log('✅ Backend found at:', host);
          return host;
        }
      } catch (error) {
        console.log(`❌ Backend not reachable at ${host}`);
      }
    }

    return null;
  }

  /**
   * Get candidate IP addresses to test
   */
  private static async getCandidateIPs(): Promise<string[]> {
    const candidates = [
      // Current hardcoded IP
      '192.168.1.2',
      
      // Common local network ranges
      '192.168.1.1', '192.168.1.10', '192.168.1.100',
      '192.168.0.1', '192.168.0.10', '192.168.0.100',
      
      // Mobile hotspot ranges
      '172.20.10.2', '172.20.10.1',
      
      // Other common ranges
      '10.0.0.1', '10.0.0.2', '10.0.1.1',
      
      // Development fallbacks
      'localhost', '127.0.0.1'
    ];

    // Remove duplicates and return
    return [...new Set(candidates)];
  }

  /**
   * Test if backend is reachable at given host
   */
  private static async testBackendConnection(host: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(`${host}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data.status === 'ok';
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cached network configuration
   */
  private static async getCachedConfig(): Promise<NetworkConfig | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const { config, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > this.CACHE_DURATION;

      if (isExpired) {
        await AsyncStorage.removeItem(this.CACHE_KEY);
        return null;
      }

      // Verify cached config is still working
      const isStillWorking = await this.testBackendConnection(config.backendHost);
      if (!isStillWorking) {
        await AsyncStorage.removeItem(this.CACHE_KEY);
        return null;
      }

      console.log('📱 Using cached backend host:', config.backendHost);
      return config;
    } catch (error) {
      console.warn('Failed to get cached config:', error);
      return null;
    }
  }

  /**
   * Cache working network configuration
   */
  private static async cacheConfig(config: NetworkConfig): Promise<void> {
    try {
      const cacheData = {
        config,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 Cached backend configuration:', config.backendHost);
    } catch (error) {
      console.warn('Failed to cache config:', error);
    }
  }

  /**
   * Get default fallback configuration
   */
  private static getDefaultConfig(): NetworkConfig {
    const defaultHost = 'http://192.168.1.2:3001'; // Current default
    
    return {
      backendHost: defaultHost,
      apiUrl: `${defaultHost}/api`,
      isLocal: true
    };
  }

  /**
   * Check if host is localhost/local network
   */
  private static isLocalHost(host: string): boolean {
    return host.includes('localhost') || 
           host.includes('127.0.0.1') || 
           host.includes('192.168.') || 
           host.includes('10.0.') || 
           host.includes('172.20.');
  }

  /**
   * Force refresh network configuration
   */
  static async refreshNetworkConfig(): Promise<NetworkConfig> {
    await AsyncStorage.removeItem(this.CACHE_KEY);
    return await this.getNetworkConfig();
  }

  /**
   * Get current cached configuration without testing
   */
  static async getCurrentConfig(): Promise<NetworkConfig | null> {
    return await this.getCachedConfig();
  }
}

export default NetworkUtils; 