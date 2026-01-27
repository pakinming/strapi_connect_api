module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: '@strapi-community/strapi-provider-upload-google-cloud-storage',
      providerOptions: {
        bucketName: env('GCS_BUCKET_NAME'), // Your bucket name
        publicFiles: env.bool('GCS_PUBLIC_FILES', false), // Set to true if you want public URLs
        uniform: env.bool('GCS_UNIFORM_ACL', false), // Set to true if your bucket uses uniform bucket-level access
        basePath: env('GCS_BASE_PATH', ''), // Optional sub-folder
        serviceAccount: JSON.parse(require('fs').readFileSync(env('GCS_SERVICE_ACCOUNT_KEY_PATH'), 'utf-8')), // Your service account JSON key
      },
    },
  },
});
