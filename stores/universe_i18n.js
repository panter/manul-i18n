import { i18n as universeI18n } from 'meteor/universe:i18n';

export default class {
  constructor() {
    this.setLocale = universeI18n.setLocale;
    this.getLocale = universeI18n.getLocale;
    this.translate = universeI18n.createReactiveTranslator();
  }
}
