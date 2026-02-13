/**
 * select-tag controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::select-tag.select-tag', ({ strapi }) => ({
  /**
   * GET /api/select-tags/localized-relations
   * Query params: documentId, targetLocale
   * Returns the localized tags relations for the given document and target locale.
   */
  async getLocalizedRelations(ctx) {
    const { documentId, targetLocale } = ctx.query;

    if (!documentId || !targetLocale) {
      return ctx.badRequest('Missing required query params: documentId, targetLocale');
    }

    const relations = await strapi
      .service('api::select-tag.select-tag')
      .getLocalizedRelations(documentId as string, targetLocale as string);

    ctx.body = { data: relations };
  },
}));
