import { StrapiApp } from '@strapi/strapi/admin';
import { PLUGIN_ID } from './pluginId';

import PluginIcon from './components/PluginIcon';

export default {
  register(app: StrapiApp) {
    app.customFields.register({
      name: 'smart-category',
      pluginId: PLUGIN_ID,
      type: 'json',
      icon: PluginIcon,
      intlLabel: {
        id: 'smart-category.label',
        defaultMessage: 'Smart Category',
      },
      intlDescription: {
        id: 'smart-category.description',
        defaultMessage: 'Select parent category and filter children',
      },
      
      components: {
        Input: async () => import('./components/SmartCategorySelector').then((module: any) => ({
          default: module.default,
        })),
      },
    });
    console.log('[Smart Category Plugin] Registered custom field in Admin');
  },
  bootstrap(app: StrapiApp) {},
};
