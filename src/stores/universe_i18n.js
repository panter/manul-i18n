import _ from 'lodash';

export default class {
  constructor({ universeI18n, options = {} }) {
    universeI18n.setOptions({
      hideMissing: true, ...options,
    });
    this.setLocale = universeI18n.setLocale;
    this.getLocale = universeI18n.getLocale;
    this.translate = universeI18n.createReactiveTranslator();
    this.has = keyOrNamespace => _.isString(this.translate(keyOrNamespace));
    this.hasObject = keyOrNamespace => _.isObject(this.translate(keyOrNamespace));
  }
}
