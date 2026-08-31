import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Configuración de Capacitor para EcoAprende
 *
 * La app tiene backend (base de datos + API), por eso el APK carga
 * la aplicación desde el servidor Next.js en lugar de archivos estáticos.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  IMPORTANTE - Segun donde pruebes la app, cambia server.url:   │
 * │                                                                 │
 * │  EMULADOR de Android Studio:                                    │
 * │    url: 'http://10.0.2.2:3000'   (10.0.2.2 = localhost de tu PC)│
 * │                                                                 │
 * │  CELULAR REAL conectado por USB:                                │
 * │    1. En terminal: adb reverse tcp:3000 tcp:3000                │
 * │    2. url: 'http://localhost:3000'                              │
 * │                                                                 │
 * │  SERVIDOR en internet (produccion):                             │
 * │    url: 'https://tu-dominio.com'                                │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * Requisito: el servidor debe estar corriendo en tu PC:
 *   bun run dev        (o)   npx next dev
 */
const config: CapacitorConfig = {
  appId: 'com.ecoaprende.app',
  appName: 'EcoAprende',
  webDir: 'out',
  server: {
    url: 'https://preview-chat-52e73370-49ec-4151-a83d-c9a5f829c700.space-z.ai/',
    cleartext: true,
  },
};

export default config;
