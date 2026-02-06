import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.customFields.register({
    name: 'my-category-field',
    plugin: 'poc-custom-field',
    type: 'json',
  });
};

export default register;
