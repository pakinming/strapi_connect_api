declare const strapi: any;

export default {
  async beforeCreate(event) {
    const { params } = event;
    const { data, documentId, locale } = params;

    console.log('###### SelectDefaultMultiLang beforeCreate ######');
    console.log('documentId:', documentId, 'locale:', locale);

    // Only act when creating a localization (documentId exists = localized version of existing doc)
    if (!documentId || !locale) {
      return;
    }

    // Skip if multi_langs is already provided
    if (data.multi_langs && Array.isArray(data.multi_langs) && data.multi_langs.length > 0) {
      console.log('[beforeCreate] multi_langs already provided, skipping auto-fill.');
      return;
    }

    try {
      // Find a source version with multi_langs populated
      const sourceEntries = await strapi.documents('api::select-default-multi-lang.select-default-multi-lang').findMany({
        filters: { documentId },
        populate: ['multi_langs'],
        limit: 10,
      });

      const sourceEntry = sourceEntries.find(
        (e: any) => e.locale !== locale && e.multi_langs && e.multi_langs.length > 0
      );

      if (!sourceEntry || !sourceEntry.multi_langs || sourceEntry.multi_langs.length === 0) {
        console.log('[beforeCreate] No source entry with multi_langs found.');
        return;
      }

      console.log(`[beforeCreate] Found source entry (${sourceEntry.locale}) with ${sourceEntry.multi_langs.length} relations.`);

      const newRelationIds: string[] = [];

      for (const rel of sourceEntry.multi_langs) {
        const localizedDocId = await strapi
          .service('api::select-default-multi-lang.select-default-multi-lang')
          .getLocalizedMultiLang(rel.documentId, locale);

        if (localizedDocId) {
          newRelationIds.push(localizedDocId);
        }
      }

      if (newRelationIds.length > 0) {
        console.log(`[beforeCreate] Auto-filling multi_langs for ${locale}: ${newRelationIds}`);
        // Set the data BEFORE creation so it's included in the API response
        event.params.data.multi_langs = newRelationIds;
      }
    } catch (error) {
      console.error('[beforeCreate] Error auto-filling multi_langs:', error);
    }
  },
};
