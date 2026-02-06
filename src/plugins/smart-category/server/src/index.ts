import type { Core } from '@strapi/strapi';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.customFields.register({
      name: 'smart-category',
      plugin: 'smart-category',
      type: 'json',
    });
    console.log('[Smart Category Plugin] Registered custom field on server');
  },
  bootstrap({ strapi }: { strapi: Core.Strapi }) {},
  destroy({ strapi }: { strapi: Core.Strapi }) {},
  config: {
    default: {},
    validator() {},
  },
  controllers: {},
  routes: {},
  services: {},
  contentTypes: {},
  policies: {},
  middlewares: {},
};
