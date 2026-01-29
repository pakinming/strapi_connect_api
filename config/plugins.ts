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
  };
};
