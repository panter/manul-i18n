/**
available in context as i18n.

i18n.t(key, props): translate the given key (caution: only reactive in tracker-komposer)

**/
import _ from 'lodash';


class I18nClient {

  constructor({
    translationStore, // mandatory
    supportedLocales = ['en'],
    defaultLocale = 'en',
    // whether it should use fallback locale if translation is missing
    // the rule is the following: xx_XX --> xx --> defaultLocale
    useFallbackForMissing = true,

    // pass function as isEditMode that uses a reactive data-source
    // if you do so and it changes to true,
    // all of your translations will show their keys
    // also, if you click on one of your translations (via T),
    // editTranslationAction will be called
    isEditMode = () => false,
    editTranslationAction = (translationId) => {
      /* eslint no-console: 0*/
      console.log('define editTranslationAction in I18nConstructor');
      console.log('you can define a mantra-action (string)');
      console.log('or you can define a function');
      console.log(`would edit ${translationId}`);
    },
    // shouldShowKeysAsFallback defines whether it should show the keys of translation
    // if the translation is not available (can also be reactive datasource)
    // this is usefull for admins and/or in development-environement
    shouldShowKeysAsFallback = () => false,
    }) {
    this.translationStore = translationStore;
    this.isEditMode = isEditMode;
    this.shouldShowKeysAsFallback = shouldShowKeysAsFallback;
    this.editTranslationAction = editTranslationAction;
    this.useFallbackForMissing = useFallbackForMissing;
    this.supportedLocales = supportedLocales;
    this.defaultLocale = defaultLocale;
    this.changeCallbacks = [];
    this.setLocale(defaultLocale);
  }

  t(keyOrNamespace, props,
    { useFallbackForMissing = false, showKeyForMissing = false, disableEditorBypass = false } = {},
  ) {
    if (!keyOrNamespace) {
      return '! no translationId given !';
    }
    if (!disableEditorBypass && this.isEditMode()) {
      return keyOrNamespace;
    }
    let translation = this.translationStore.translate(keyOrNamespace, props);
    if (!_.isNil(translation)) {
      return translation;
    }
    const fallbackLocale = this.getFallbackLocale();
    if (
      (useFallbackForMissing || this.useFallbackForMissing) &&
      this.getLocale() !== fallbackLocale
    ) {
      translation = this.translationStore.translate(
          keyOrNamespace, { ...props, _locale: fallbackLocale },
        );
    }
      // if still nil and is editor, return key if allowed
    if (!_.isNil(translation)) {
      return translation;
    } else if (showKeyForMissing || this.shouldShowKeysAsFallback()) {
      return keyOrNamespace;
    }
    return null; // we tried :-(
  }

  /**
    translate a certain property from a document.
    It will check if the document has doc[propertyKey].de, .fr, etc.

    if propertyKey is not set, it will fetch doc.de, doc.fr, etc.
  **/
  tDoc(doc, propertyKey = null) {
    // closure helpers
    const path = locale => (propertyKey ? `${propertyKey}.${locale}` : locale);
    const t = locale => _.get(doc, path(locale));

    const translation = t(this.getLocale());
    if (!_.isNil(translation)) {
      return translation;
    }
    const fallbackLocale = this.getFallbackLocale();
    if (this.useFallbackForMissing && this.getLocale() !== fallbackLocale) {
      return t(fallbackLocale);
    }
    return null; // no key fallback at the moment
  }

  supports(locale) {
    return this.supportedLocales.indexOf(locale) !== -1;
  }

  getFallbackLocale(locale) {
    if (!locale) {
      return this.defaultLocale;
    } else if (this.supports(locale)) {
      return locale;
    }
    const [lang] = locale.split('-');
    if (this.supports(lang)) {
      return lang;
    }
    return this.defaultLocale;
  }


  setLocale(locale) {
    const fallbackLocale = this.getFallbackLocale(locale);
    this.translationStore.setLocale(fallbackLocale);
    this.changeCallbacks.forEach(callback => callback(fallbackLocale));
  }
  getLocale() {
    return this.translationStore.getLocale();
  }

  getSupportedLocales() {
    return this.supportedLocales;
  }

  onChangeLocale(callback) {
    this.changeCallbacks.push(callback);
  }

}


export default I18nClient;
