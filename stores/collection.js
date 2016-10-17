import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
import { unflatten } from 'flat';


export default class {
  constructor({
      collection,
      publicationName = 'publicationName',
      methodLogMissingKeyName = 'translations.logMissingKey',
      } = {}) {
    this.methodLogMissingKeyName = methodLogMissingKeyName;
    this.publicationName = publicationName;

    this.collection = collection;
    if (Meteor.isClient) {
      this.initClient();
    } else {
      this.initServer();
    }

    this.initMethods();
  }
  initClient() {
    const Tracker = require('meteor/tracker').Tracker;
    const ReactiveVar = require('meteor/reactive-var').ReactiveVar;

    this.locale = new ReactiveVar();
    this.autorun = Tracker.autorun(() => {
      const locale = this.getLocale();
      Meteor.subscribe(this.publicationName, locale);
    });
  }

  initServer() {
    let value = null;
    this.locale = {
      get() {
        return value;
      },
      set(newValue) {
        value = newValue;
      },
    };
    Meteor.publish(this.publicationName, (locale) => {
      return this.collection.find({}, { fields: { key: true, [`value_${locale}`]: true } });
    });
  }

  getLocale() {
    return this.locale.get();
  }

  setLocale(locale) {
    return this.locale.set(locale);
  }


  translate(keyOrNamespace, { _locale = this.getLocale(), ...params } = {}) {
    if (!keyOrNamespace) {
      return '';
    }

    const results = this.findResultsForKey(keyOrNamespace);

    const open = '{$';
    const close = '}';
    const getValueKey = locale => `value_${locale}`;
    const getValue = (entry, locale) => {
      if (_.has(entry, getValueKey(locale))) {
        let value = entry[getValueKey(locale)];

        Object.keys(params).forEach((param) => {
          value = value.split(open + param + close).join(params[param]);
        });

        return value;
      }
      return entry.key;
    };
    const object = unflatten(
         _.chain(results)
         .sortBy(({ key }) => key.length)
         .keyBy('key')
         .mapValues(entry => getValue(entry, _locale))
         .value(),
       { overwrite: true });
    console.log(keyOrNamespace, object);
    return _.get(object, keyOrNamespace);
  }

  findResultsForKey(keyOrNamespace) {
    return this.collection.find({ key: { $regex: `${keyOrNamespace}/*` } }).fetch();
  }

  initMethods() {
    const store = this;
    Meteor.methods({
      [this.methodLogMissingKeyName](key, locale) {
        console.log('missing property', key);
        const results = store.findResultsForKey(key);
        // also check on the server if really empty
        if (results.length === 0) {
          store.collection.upsert({ key }, { $set: { [`value_${locale}`]: `${locale}: ${key}` } });
        }
      },
    });
  }


}
