import _ from "lodash";
import flat from "flat";

/* eslint no-shadow: 0 */
/* eslint-disable no-console */
export default ({
  override = false,
  translations,
  collection,
  locales = ["de", "en", "it", "fr"],
  verbose = true
} = {}) => {
  const entries = new Map();

  const valueKeyForLocale = locale => `value_${locale}`;
  locales.forEach(locale => {
    const translationsForLocale = translations[locale];
    if (!_.isEmpty(translationsForLocale)) {
      const translationsFlat = flat(translationsForLocale);
      _.forEach(translationsFlat, (value, key) => {
        if (!entries.has(key)) {
          entries.set(
            key,
            _.zipObject(
              _.map(locales, locale => valueKeyForLocale(locale)),
              _.map(locales, () => null)
            )
          );
        }
        entries.get(key)[valueKeyForLocale(locale)] = value;
      });
    }
  });

  console.log("--- importing i18n into collection --");
  /* eslint no-restricted-syntax: 0*/
  for (const [key, value] of entries) {
    if (collection.findOne(key)) {
      if (override) {
        collection.update(key, { $set: value });
        if (verbose) {
          console.log("updated", key);
        }
      } else if (verbose) {
        console.log("skipped", key);
      }
    } else {
      collection.insert({ _id: key, ...value });
      if (verbose) {
        console.log("inserted", key);
      }
    }
  }
};
