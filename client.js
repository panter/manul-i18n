/**
available in context as i18n.

i18n.t(key, props): translate the given key (caution: only reactive in tracker-komposer)

i18n.translateSchema(simpleSchema): adds translation to the simpleSchema

**/
import _ from 'lodash';
import evalSimpleSchemaRegexKeys from './eval_simpleschema_regex_keys';

class I18nClient {

  constructor({
      SimpleSchema,
      FlowRouter,
      translationStore,
      supportedLocales,
      defaultLocale = 'en',
      editModeHighlighting = () => false,
      editRoute,
      isEditor = () => false,
    }) {
    this.FlowRouter = FlowRouter;
    this.SimpleSchema = SimpleSchema;
    this.translationStore = translationStore;
    this.editModeHighlighting = () => editModeHighlighting() && isEditor();
    this.isEditor = isEditor;
    this.editRoute = editRoute;

    this.supportedLocales = supportedLocales;
    this.defaultLocale = defaultLocale;

    this.changeCallbacks = [];
    this.setLocale(defaultLocale);
  }

  t(keyOrNamespace, props, { disableEditorBypass = false } = {}) {
    if (!disableEditorBypass && this.editModeHighlighting()) {
      return keyOrNamespace;
    }
    return this.translationStore.translate(keyOrNamespace, props);
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

  LocaleRoutes(baseRoutes = this.FlowRouter) {
    const setLocaleByRoute = ({ params: { locale } }, redirect, stop) => {
      if (this.supports(locale)) {
        this.setLocale(locale);
      } else {
        this.FlowRouter.setParams({ locale: this.getFallbackLocale(locale) });
        stop();
      }
    };
    return baseRoutes.group({
      prefix: '/:locale?',
      triggersEnter: [setLocaleByRoute],
    });
  }

  translateSchema(schema, namespace) {
    // translate all the labels
    const translations = this.t(namespace);
    const translatedDef = {};
    const _addSubSchemaTranslations = (parentFieldFullName = null, parentTranslation = {}) => {
      schema.objectKeys(parentFieldFullName).forEach((field) => {
        const fullFieldName = parentFieldFullName ? `${parentFieldFullName}.${field}` : field;
        const fieldTranslation = parentTranslation[field];
        const fieldDefinition = schema.getDefinition(fullFieldName);
        const defaultTransform = value => (fieldTranslation && fieldTranslation[value]) || value;
        let label = null;
        let hintText = null;
        let hintTitle = null;
        let listAdd = null;
        let listDel = null;
        if (fieldTranslation) {
          if (_.isString(fieldTranslation)) {
            label = fieldTranslation;
          } else {
            label = fieldTranslation.label;
            hintText = fieldTranslation.hintText;
            hintTitle = fieldTranslation.hintTitle;
            listAdd = fieldTranslation.listAdd;
            listDel = fieldTranslation.listDel;
          }
        }
        // recursivly add subfields as well, but flat
        if (schema.objectKeys(fullFieldName).length > 0) {
          _addSubSchemaTranslations(fullFieldName, fieldTranslation);
        }
        translatedDef[fullFieldName] = {
          label: label || `${namespace}.${fullFieldName}`,
          uniforms: {
            transform: defaultTransform,
            hintText,
            hintTitle,
            listAdd,
            listDel,
            ...fieldDefinition.uniforms, // can override default transform
          },
        };
      });
    };

    _addSubSchemaTranslations(null, translations);
    const translatedScheme = new this.SimpleSchema([schema, translatedDef]);
    const simpleSchemaMessages = evalSimpleSchemaRegexKeys(
      this.t('simpleSchema')
    );
    translatedScheme.messages(simpleSchemaMessages);

    return translatedScheme;
  }


  getSupportedLocales() {
    return this.supportedLocales;
  }

  onChangeLocale(callback) {
    this.changeCallbacks.push(callback);
  }

}


export default I18nClient;
