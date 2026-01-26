import type { Schema, Struct } from '@strapi/strapi';

export interface BkkPoi extends Struct.ComponentSchema {
  collectionName: 'components_bkk_pois';
  info: {
    displayName: 'poi';
    icon: 'database';
  };
  attributes: {};
}

export interface DName extends Struct.ComponentSchema {
  collectionName: 'components_d_names';
  info: {
    displayName: 'name';
    icon: 'alien';
  };
  attributes: {};
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'bkk.poi': BkkPoi;
      'd.name': DName;
    }
  }
}
