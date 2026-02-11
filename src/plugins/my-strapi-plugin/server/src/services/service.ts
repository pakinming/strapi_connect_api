import type { Core } from '@strapi/strapi';

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  getWelcomeMessage() {
    return 'Welcome to Strapi 🚀';
  },

  async createWithI18nClone(uid: string, data: any) {
    const model = strapi.contentType(uid as any);
    if (!model) {
      throw new Error(`Content type ${uid} not found`);
    }

    const isI18nEnabled = (model as any).pluginOptions?.i18n?.localized;
    if (!isI18nEnabled) {
      return strapi.documents(uid as any).create({ data });
    }

    // Check if we are creating a localization for an existing entry
    // Usually strapi sends related entity id in query or body for localization
    // But here we might just be receiving a payload.
    // If it's a new entry entirely, just create it.
    // If it's a localization, Strapi's entity service `create` handles linking if `sitemap_id` or similar is conceptually what we are doing,
    // but typically for i18n we use `localizations` relation or the `create` with `locale` and `vuid` (documentId in v5).

    // Requirement: "clone data ... same as other fields"
    // This implies we want to fill in missing localized fields from a "base" version.
    // Let's assume the user sends `data` which might have `locale`.
    
    // If we are creating a NEW entry (no documentId provided in data or no relationship),
    // and we want it to inherit "default" values? That's usually handled by the admin UI or model defaults.
    
    // The specific request: "If not config i18n, clone data".
    // This likely means: "If I create a TH locale entry, and I don't provide a value for 'title', copy 'title' from the EN locale (default)."

    /**
     * Algorithm:
     * 1. If not localized, just regular create.
     * 2. If localized:
     *    a. Identify the "source" locale/entry to clone FROM. 
     *       - If `data.localizations` is provided, use that? 
     *       - Or maybe we are creating a localization OF an existing document?
     *       
     *    Let's assume the user provides `documentId` if they are adding a locale to an existing document.
     *    Or if it's a brand new document, maybe there's nothing to clone from yet?
     *    
     *    Wait, "clone data ... same as other fields". 
     *    Non-localized fields are shared (synced) across locales in Strapi v4 (and v5 documents logic).
     *    Localized fields are unique per locale. 
     *    The user wants localized fields to AUTO-FILL from the default locale if missing.
     */

    const { locale, documentId, ...restData } = data;

    if (!locale) {
      // If no locale specified, just create (uses default)
      return strapi.documents(uid as any).create({ data });
    }

    // Try to find a base entry to clone from.
    // 1. If documentId is passed, fetch the default locale version of this document.
    let sourceEntry;
    if (documentId) {
      sourceEntry = await strapi.documents(uid as any).findOne({
        documentId,
        locale: await strapi.plugin('i18n').service('locales').getDefaultLocale(), // Fetch default locale
      });
    }

    // If no source entry (creating fresh), maybe we can't clone? 
    // Or maybe we treat the provided data as the source and this is just a create?
    if (!sourceEntry) {
       return strapi.documents(uid as any).create({ data });
    }

    // 2. Identify missing localized attributes
    const attributes = model.attributes;
    const dataToCreate = { ...data };

    for (const [key, attr] of Object.entries(attributes)) {
      if ((attr as any).pluginOptions?.i18n?.localized) {
        // It's a localized field
        if (dataToCreate[key] === undefined || dataToCreate[key] === null) {
            // Missing in payload, try to copy from source
            if (sourceEntry[key] !== undefined) {
                dataToCreate[key] = sourceEntry[key];
            }
        }
      }
    }

    // 3. Create the entry
    // In Strapi v5 (core) documents, `create` with the same `documentId` and diff `locale` creates a localization.
    return strapi.documents(uid as any).create({
        documentId, // explicit link
        locale,
        data: dataToCreate,
    } as any);
  },
});

export default service;
