
import _ from 'lodash';
import flat from 'flat';


export default ({ override = false, translations, collection, locales = ['de', 'en', 'it', 'fr'] } = {}) => {
  const entries = new Map();

  const valueKeyForLocale = locale => `value_${locale}`;
  locales.forEach((locale) => {
    const translationsForLocale = translations[locale];
    if (!_.isEmpty(translationsForLocale)) {
      const translationsFlat = flat(translationsForLocale);
      _.forEach(translationsFlat, (value, key) => {
        if (!entries.has(key)) {
          entries.set(key, _.zipObject(
            _.map(locales, locale => valueKeyForLocale(locale)),
            _.map(locales, locale => null)
          ));
        }
        entries.get(key)[valueKeyForLocale(locale)] = value;
      });
    }
  });

  console.log('--- importing i18n into collection --');
  for (const [key, value] of entries) {
    if (collection.findOne(key)) {
      if (override) {
        collection.update(key, { $set: value });
        console.log('updated', key);
      } else {
        // console.log('skipped', key);
      }
    } else {
      collection.insert({ _id: key, ...value });
      console.log('inserted', key);
    }
  }
};
