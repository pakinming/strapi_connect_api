import { errors } from '@strapi/utils';

const { ValidationError } = errors;

export default {
  beforeCreate(event) {
    const { data } = event.params;
    validateLanguage(data);
  },
  beforeUpdate(event) {
    const { data } = event.params;
    validateLanguage(data);
  },
};

function validateLanguage(data) {
  const locale = data.locale;
  // If locale is missing, we can't perform language-specific validation
  if (!locale) return;

  const fieldsToValidate = ['title', 'descrition', 'stories_deatail'];
  const thaiRegex = /[\u0E00-\u0E7F]/;

  for (const field of fieldsToValidate) {
    const value = data[field];
    
    // Skip if value is empty or not a string
    if (!value || typeof value !== 'string') continue;

    if (locale.startsWith('th')) {
      // For Thai locale: Must contain at least one Thai character
      if (!thaiRegex.test(value)) {
        throw new ValidationError(`ข้อมูลฟิลด์ "${field}" ต้องมีตัวอักษรภาษาไทย (Locale: ${locale})`);
      }
    } else if (locale.startsWith('en')) {
      // For English locale: Must NOT contain any Thai characters
      if (thaiRegex.test(value)) {
        throw new ValidationError(`Field "${field}" must not contain Thai characters for English locale (Locale: ${locale})`);
      }
    }
  }
}
