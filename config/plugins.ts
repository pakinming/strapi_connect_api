import fs from "fs";

module.exports = ({ env }) => {
  console.log("serviceAccount path", env("GCS_SERVICE_ACCOUNT_KEY_PATH"));
  return {
    upload: {
      config: {
        provider:
          "@strapi-community/strapi-provider-upload-google-cloud-storage",
        providerOptions: {
          bucketName: env("GCS_BUCKET_NAME"),
          publicFiles: env.bool("GCS_PUBLIC_FILES", false),
          uniform: env.bool("GCS_UNIFORM_ACL", false),
          serviceAccount: fs.existsSync(env("GCS_SERVICE_ACCOUNT_KEY_PATH"))
            ? JSON.parse(
                fs.readFileSync(env("GCS_SERVICE_ACCOUNT_KEY_PATH"), "utf-8"),
              )
            : undefined,
        },
      },
    },
   'address-selection': {
    enabled: true,
  },
    "maplibre-field": {
      enabled: true,
      config: {
        mapStyles: [
          {
            id: "osm",
            name: "OpenStreetMap",
            url: "https://demotiles.maplibre.org/style.json",
            isDefault: true,
          },
        ],
        defaultCenter: [100.5018, 13.7563], // Bangkok
        defaultZoom: 13,

        // Geocoding
        geocodingProvider: "nominatim",
        nominatimUrl: "https://nominatim.openstreetmap.org",

        // POI configuration (optional)
        poiDisplayEnabled: true,
        poiMinZoom: 10,
        poiMaxDisplay: 100,
        poiSearchEnabled: true,
        poiSnapRadius: 5,
        poiSources: [],
      },
    },
  };
};


// AIzaSyDHfoJgLYaWZJLDi6vjoaLim3UT3KLGhDo