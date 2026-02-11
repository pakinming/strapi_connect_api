import type { Core } from '@strapi/strapi';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('my-strapi-plugin')
      // the name of the service file & the method.
      .service('service')
      .getWelcomeMessage();
  },

  async create(ctx) {
    const { model, data } = ctx.request.body;

    if (!model || !data) {
      return ctx.badRequest('Model and data are required');
    }

    try {
      const result = await strapi
        .plugin('my-strapi-plugin')
        .service('service')
        .createWithI18nClone(model, data);
      
      ctx.body = result;
    } catch (error) {
        ctx.throw(500, error);
    }
  },
});

export default controller;
