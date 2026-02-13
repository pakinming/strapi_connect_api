/**
 * Custom route for getting localized relations.
 * This is a separate route file so Strapi registers it alongside the core routes.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/select-tags/localized-relations',
      handler: 'select-tag.getLocalizedRelations',
      config: {
        auth: false, // Admin panel will call this via the fetchClient which adds auth automatically
        policies: [],
        middlewares: [],
      },
    },
  ],
};
