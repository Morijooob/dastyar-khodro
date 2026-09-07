import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ir.dastyarkhodro.app',
  appName: 'دستیار خودرو',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  }
};

export default config;
