/**
 * select-default-multi-lang service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::select-default-multi-lang.select-default-multi-lang', ({ strapi }) => ({
  /**
   * Given a multi-lang documentId, return the same documentId if it exists for the target locale.
   */
  async getLocalizedMultiLang(documentId: string, locale: string) {
    const entry = await strapi.documents('api::multi-lang.multi-lang').findOne({
      documentId,
      locale,
    });

    return entry ? entry.documentId : null;
  },

  /**
   * Given a select-default-multi-lang documentId and a target locale,
   * find the source locale's multi_langs and map them to the target locale.
   * Returns an array of { documentId, data, locale } objects for the localized relations.
   */
  async getLocalizedRelations(documentId: string, targetLocale: string) {
    // Find all locale versions of this document (excluding the target locale)
    const sourceEntries = await strapi.documents('api::select-default-multi-lang.select-default-multi-lang').findMany({
      filters: {
        documentId: documentId,
      },
      populate: ['multi_langs'],
      limit: 10,
    });

    // Find the first source entry that has multi_langs set
    const sourceEntry = sourceEntries.find(
      (e: any) => e.locale !== targetLocale && e.multi_langs && e.multi_langs.length > 0
    );

    if (!sourceEntry || !sourceEntry.multi_langs) {
      return [];
    }

    const localizedRelations: any[] = [];

    for (const rel of sourceEntry.multi_langs) {
      // Find the target-locale version of this multi-lang entry
      const localizedEntry = await strapi.documents('api::multi-lang.multi-lang').findOne({
        documentId: rel.documentId,
        locale: targetLocale,
      });

      if (localizedEntry) {
        localizedRelations.push({
          documentId: localizedEntry.documentId,
          id: localizedEntry.id,
          data: localizedEntry.data,
          locale: localizedEntry.locale,
        });
      }
    }

    return localizedRelations;
  },
}));