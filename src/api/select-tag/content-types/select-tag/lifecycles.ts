declare const strapi: any;

export default {
  async beforeCreate(event) {
    const { params } = event;
    const { data, documentId, locale } = params;

    console.log('###### SelectTag beforeCreate ######');
    console.log('documentId:', documentId, 'locale:', locale);

    // Only act when creating a localization (documentId exists = localized version of existing doc)
    if (!documentId || !locale) {
      return;
    }

    // Skip if tags is already provided
    if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
      console.log('[beforeCreate] tags already provided, skipping auto-fill.');
      return;
    }

    try {
      // Find a source version with tags populated
      const sourceEntries = await strapi.documents('api::select-tag.select-tag').findMany({
        filters: { documentId },
        populate: ['tags'],
        limit: 10,
      });

      const sourceEntry = sourceEntries.find(
        (e: any) => e.locale !== locale && e.tags && e.tags.length > 0
      );

      if (!sourceEntry || !sourceEntry.tags || sourceEntry.tags.length === 0) {
        console.log('[beforeCreate] No source entry with tags found.');
        return;
      }

      console.log(`[beforeCreate] Found source entry (${sourceEntry.locale}) with ${sourceEntry.tags.length} relations.`);

      const newRelationIds: string[] = [];

      for (const rel of sourceEntry.tags) {
        const localizedDocId = await strapi
          .service('api::select-tag.select-tag')
          .getLocalizedTag(rel.documentId, locale);

        if (localizedDocId) {
          newRelationIds.push(localizedDocId);
        }
      }

      if (newRelationIds.length > 0) {
        console.log(`[beforeCreate] Auto-filling tags for ${locale}: ${newRelationIds}`);
        // Set the data BEFORE creation so it's included in the API response
        event.params.data.tags = newRelationIds;
      }
    } catch (error) {
      console.error('[beforeCreate] Error auto-filling tags:', error);
    }
  },
};
