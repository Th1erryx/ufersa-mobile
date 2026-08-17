import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'br.edu.ufersa.mobile',
  appName: 'UFERSA Mobile',
  webDir: 'dist',
  server: {
    // HTTPS no WebView: necessário para PWA/Storage moderno funcionar no APK.
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#1d6a43',
      showSpinner: false,
    },
  },
}

export default config