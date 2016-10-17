
import _ from 'lodash';
import flat from 'flat';
import { i18n } from 'meteor/universe:i18n';

export default ({ collection, locales = ['de', 'en', 'it', 'fr'] } = {}) => {
  const entries = new Map();

  const valueKeyForLocale = locale => `value_${locale}`;
  locales.forEach((locale) => {
    const translations = i18n._translations[locale];
    if (!_.isEmpty(translations)) {
      const translationsFlat = flat(translations);
      _.forEach(translationsFlat, (value, key) => {
        if (!entries.has(key)) {
          entries.set(key, _.zipObject(
            _.map(locales, locale => valueKeyForLocale(locale)),
            _.map(locales, locale => `${locale}: ${key}`)
          ));
        }
        entries.get(key)[valueKeyForLocale(locale)] = value;
      });
    }
  });


  for (const [key, value] of entries) {
    collection.upsert(key, { $set: value });
  }
};
