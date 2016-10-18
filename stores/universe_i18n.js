

export default class {
  constructor({ universeI18n }) {
    this.setLocale = universeI18n.setLocale;
    this.getLocale = universeI18n.getLocale;
    this.translate = universeI18n.createReactiveTranslator();
  }
}
