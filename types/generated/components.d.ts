import type { Schema, Struct } from '@strapi/strapi';

export interface ScheduleOperatingHour extends Struct.ComponentSchema {
  collectionName: 'components_schedule_operating_hours';
  info: {
    displayName: 'operating_hour';
    icon: 'apps';
  };
  attributes: {
    close_time: Schema.Attribute.Time;
    is_closed: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    is_open_24h: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    open_time: Schema.Attribute.Time;
  };
}

export interface SharedOperatingHour extends Struct.ComponentSchema {
  collectionName: 'components_shared_operating_hours';
  info: {
    description: 'Opening hours for a specific day';
    displayName: 'Operating Hour';
  };
  attributes: {
    close_time: Schema.Attribute.Time;
    day_of_week: Schema.Attribute.Enumeration<
      ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    > &
      Schema.Attribute.Required;
    is_open: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    open_24h: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    open_time: Schema.Attribute.Time;
  };
}

export interface SharedSeasonalOperatingHours extends Struct.ComponentSchema {
  collectionName: 'components_shared_seasonal_operating_hours';
  info: {
    description: 'Override operating hours for a date range';
    displayName: 'Seasonal Operating Hours';
  };
  attributes: {
    end_date: Schema.Attribute.Date & Schema.Attribute.Required;
    hours: Schema.Attribute.Component<'shared.operating-hour', true> &
      Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    start_date: Schema.Attribute.Date & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'schedule.operating-hour': ScheduleOperatingHour;
      'shared.operating-hour': SharedOperatingHour;
      'shared.seasonal-operating-hours': SharedSeasonalOperatingHours;
    }
  }
}
