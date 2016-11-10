

export default class {
  constructor({ universeI18n, options = {} }) {
    universeI18n.setOptions({
      hideMissing: true, ...options,
    });
    this.setLocale = universeI18n.setLocale;
    this.getLocale = universeI18n.getLocale;
    this.translate = universeI18n.createReactiveTranslator();
  }
}
