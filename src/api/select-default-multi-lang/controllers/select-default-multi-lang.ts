/**
 * select-default-multi-lang controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::select-default-multi-lang.select-default-multi-lang', ({ strapi }) => ({
  /**
   * GET /api/select-default-multi-langs/localized-relations
   * Query params: documentId, targetLocale
   * Returns the localized multi_langs relations for the given document and target locale.
   */
  async getLocalizedRelations(ctx) {
    const { documentId, targetLocale } = ctx.query;

    if (!documentId || !targetLocale) {
      return ctx.badRequest('Missing required query params: documentId, targetLocale');
    }

    const relations = await strapi
      .service('api::select-default-multi-lang.select-default-multi-lang')
      .getLocalizedRelations(documentId as string, targetLocale as string);

    ctx.body = { data: relations };
  },
}));
