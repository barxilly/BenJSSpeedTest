// Alternative speed test implementation for browser (using public test files)
export class FastSpeedTest {
  private isRunning = false;
  private results = {
    download: 0,
    upload: 0,
    latency: 0,
    jitter: 0
  };

  constructor() {}

  async runTest() {
    this.isRunning = true;
    
    try {
      // Alternative speed test using public test files
      const downloadSpeed = await this.testDownloadSpeed();
      this.results.download = downloadSpeed;
      
      // Test latency to a reliable server
      const latency = await this.testLatency();
      this.results.latency = latency;
      
      // Simple upload test using a small POST request
      const uploadSpeed = await this.testUploadSpeed();
      this.results.upload = uploadSpeed;
      
      // Calculate jitter from multiple ping tests
      const jitter = await this.testJitter();
      this.results.jitter = jitter;
      
    } catch (error) {
      console.error('Alternative speed test failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
    
    return this.results;
  }

  private async testDownloadSpeed(): Promise<number> {
    try {
      // Use Fast.com API to get test URLs (Netflix CDN with CORS enabled)
      const apiResponse = await fetch('https://api.fast.com/netflix/speedtest/v2?https=true&token=YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm&urlCount=5');
      
      if (!apiResponse.ok) {
        throw new Error(`Fast.com API error: ${apiResponse.status}`);
      }
      
      const apiData = await apiResponse.json();
      const testUrls = apiData.map((item: any) => item.url);
      
      if (!testUrls.length) {
        throw new Error('No test URLs received from Fast.com');
      }
      
      // Download from multiple URLs to get better speed measurement
      const downloadPromises = testUrls.slice(0, 3).map(async (url: string) => {
        const startTime = Date.now();
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.arrayBuffer();
        const endTime = Date.now();
        
        const duration = (endTime - startTime) / 1000; // seconds
        const bytes = data.byteLength;
        return (bytes * 8) / duration; // bits per second
      });
      
      const speeds = await Promise.all(downloadPromises);
      // Return the average speed
      return speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
      
    } catch (error) {
      console.error('Fast.com download speed test failed:', error);
      
      // Fallback to alternative CDN if Fast.com fails
      try {
        console.log('Falling back to alternative speed test...');
        const testUrl = 'https://proof.ovh.net/files/10Mb.dat';
        const startTime = Date.now();
        const response = await fetch(testUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.arrayBuffer();
        const endTime = Date.now();
        
        const duration = (endTime - startTime) / 1000; // seconds
        const bytes = data.byteLength;
        const bitsPerSecond = (bytes * 8) / duration;
        
        return bitsPerSecond;
      } catch (fallbackError) {
        console.error('Fallback speed test also failed:', fallbackError);
        throw error;
      }
    }
  }

  private async testUploadSpeed(): Promise<number> {
    try {
      // Create test data for upload (1MB)
      const testData = new ArrayBuffer(1024 * 1024); // 1MB
      const testBlob = new Blob([testData]);
      
      // Use httpbin.org for upload testing (it accepts POST requests with CORS)
      const startTime = Date.now();
      const response = await fetch('https://httpbin.org/post', {
        method: 'POST',
        body: testBlob,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      await response.json(); // Wait for response to complete
      const endTime = Date.now();
      
      const duration = (endTime - startTime) / 1000; // seconds
      const bytes = testData.byteLength;
      const bitsPerSecond = (bytes * 8) / duration;
      
      return bitsPerSecond;
    } catch (error) {
      console.error('Upload speed test failed:', error);
      // If upload fails, return 0 (some networks block uploads)
      return 0;
    }
  }

  private async testLatency(): Promise<number> {
    try {
      const startTime = Date.now();
      // Try to use Fast.com API endpoint for latency test (smaller response)
      const response = await fetch('https://api.fast.com/netflix/speedtest/v2?https=true&token=YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm&urlCount=1', { 
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const endTime = Date.now();
      return endTime - startTime;
    } catch (error) {
      console.error('Fast.com latency test failed, using fallback:', error);
      
      // Fallback to httpbin.org
      try {
        const startTime = Date.now();
        const response = await fetch('https://httpbin.org/get', { 
          method: 'GET',
          cache: 'no-cache'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const endTime = Date.now();
        return endTime - startTime;
      } catch (fallbackError) {
        console.error('Fallback latency test failed:', fallbackError);
        throw error;
      }
    }
  }

  private async testJitter(): Promise<number> {
    try {
      const pingTimes: number[] = [];
      
      // Perform 5 ping tests
      for (let i = 0; i < 5; i++) {
        try {
          const startTime = Date.now();
          await fetch('https://httpbin.org/get', { 
            method: 'GET',
            cache: 'no-cache'
          });
          const endTime = Date.now();
          pingTimes.push(endTime - startTime);
        } catch (error) {
          console.warn(`Ping test ${i + 1} failed:`, error);
        }
      }
      
      if (pingTimes.length < 2) {
        return 0; // Can't calculate jitter with less than 2 measurements
      }
      
      // Calculate jitter as standard deviation of ping times
      const mean = pingTimes.reduce((sum, time) => sum + time, 0) / pingTimes.length;
      const variance = pingTimes.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / pingTimes.length;
      const jitter = Math.sqrt(variance);
      
      return jitter;
    } catch (error) {
      console.error('Jitter test failed:', error);
      return 0;
    }
  }

  getResults() {
    return this.results;
  }

  isTestRunning() {
    return this.isRunning;
  }
}
