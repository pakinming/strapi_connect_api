/**
 * poi controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::poi.poi', ({ strapi }) => ({
  async find(ctx) {
    const { data, meta } = await super.find(ctx);

    console.log('############ [Controller] meta', meta);

    //get params locale
    const locale = ctx.request.query.locale;
    console.log('############ [Controller] locale', locale);
    console.log('############ [Controller] ctx', ctx);

    if (data) {
      console.log('############ [Controller] find', data.length);
      await Promise.all(
        data.map(async (item: any) => {
          console.log('############ [Controller] find',   item.categories);
          if (item.categories && typeof item.categories === 'object') {
            try {
              const category = await strapi.documents('api::category.category').findOne({
                documentId: item.categories.categoryId,
              });

              const child = await strapi.documents('api::category-child.category-child').findMany({
                filters: {
                  documentId: {
                    $in: item.categories.childIds,
                  },
                },
              });
              
              if (category) {
                item.categories = {category: category, childIds: child};
              }
            } catch (err) {
              strapi.log.error(`Error populating category for POI ${item.documentId}:`, err);
            }
          }
        })
      );
    }

    return { data, meta };
  },

  async findOne(ctx) {
    const { data, meta } = await super.findOne(ctx);

    if (data && data.categories && typeof data.categories === 'string') {
      try {
        const category = await strapi.documents('api::category.category').findOne({
          documentId: data.categories,
        });
        if (category) {
          data.categories = category;
        }
      } catch (err) {
        strapi.log.error(`Error populating category for POI ${data.documentId}:`, err);
      }
    }

    return { data, meta };
  },
}));
