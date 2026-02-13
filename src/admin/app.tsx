
import type { StrapiApp } from '@strapi/strapi/admin';
import AutoFillMultiLangs from './components/AutoFillMultiLangs';

export default {
  config: {
    locales: [
      // 'ar',
      // 'fr',
      // 'cs',
      // 'de',
      // 'dk',
      // 'es',
      // 'he',
      // 'id',
      // 'it',
      // 'ja',
      // 'ko',
      // 'ms',
      // 'nl',
      // 'no',
      // 'pl',
      // 'pt-BR',
      // 'pt',
      // 'ru',
      // 'sk',
      // 'sv',
      // 'th',
      // 'tr',
      // 'uk',
      // 'vi',
      // 'zh-Hans',
      // 'zh',
    ],
  },
  register(app: StrapiApp) {
    console.log('[App] Register', app);
  },
  bootstrap(app: StrapiApp) {
    console.log('[App] Bootstrap', app);

    // Inject AutoFillMultiLangs component globally
    app.getPlugin('content-manager')?.injectComponent('editView', 'right-links', {
      name: 'AutoFillMultiLangs',
      Component: AutoFillMultiLangs,
    });
  },
};
