/**
 * select-tag service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::select-tag.select-tag', ({ strapi }) => ({
  /**
   * Given a tag documentId, return the same documentId if it exists for the target locale.
   */
  async getLocalizedTag(documentId: string, locale: string) {
    const entry = await strapi.documents('api::tag.tag').findOne({
      documentId,
      locale,
    });

    return entry ? entry.documentId : null;
  },

  /**
   * Given a select-tag documentId and a target locale,
   * find the source locale's tags and map them to the target locale.
   * Returns an array of { documentId, id, tag_name, locale } objects for the localized relations.
   */
  async getLocalizedRelations(documentId: string, targetLocale: string) {
    // Find all locale versions of this document (excluding the target locale)
    const sourceEntries = await strapi.documents('api::select-tag.select-tag').findMany({
      filters: {
        documentId: documentId,
      },
      populate: ['tags'],
      limit: 10,
    });

    // Find the first source entry that has tags set
    const sourceEntry = sourceEntries.find(
      (e: any) => e.locale !== targetLocale && e.tags && e.tags.length > 0
    );

    if (!sourceEntry || !sourceEntry.tags) {
      return [];
    }

    const localizedRelations: any[] = [];

    for (const rel of sourceEntry.tags) {
      // Find the target-locale version of this tag entry
      const localizedEntry = await strapi.documents('api::tag.tag').findOne({
        documentId: rel.documentId,
        locale: targetLocale,
      });

      if (localizedEntry) {
        localizedRelations.push({
          documentId: localizedEntry.documentId,
          id: localizedEntry.id,
          tag_name: localizedEntry.tag_name,
          locale: localizedEntry.locale,
        });
      }
    }

    return localizedRelations;
  },
}));
