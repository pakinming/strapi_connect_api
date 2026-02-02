export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
         useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:', 'https://demotiles.maplibre.org'],
          'script-src': [
            "'self'",
            "'unsafe-inline'",
            'https://*.basemaps.cartocdn.com',
          ],
          'worker-src': ['blob:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'storage.googleapis.com',
            'https://*.basemaps.cartocdn.com',
            'market-assets.strapi.io',
            'https://*.tile.openstreetmap.org',
            'https://unpkg.com/leaflet@1.9.4/dist/images/',
            'https://demotiles.maplibre.org',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'storage.googleapis.com',
            'https://*.basemaps.cartocdn.com',
            'https://tile.openstreetmap.org',
            'https://*.tile.openstreetmap.org',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];