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
  }

  initClient() {
    const Tracker = require('meteor/tracker').Tracker;
    const ReactiveVar = require('meteor/reactive-var').ReactiveVar;

    this.locale = new ReactiveVar();
    this.autorun = Tracker.autorun(() => {
      const locale = this.getLocale();
      if (locale) {
        this.subscription = Meteor.subscribe(this.publicationName, locale);
      }
    });
  }

  initServer() {
    Meteor.publish(this.publicationName, (locale) => {
      return this.collection.find({}, { fields: { key: true, [this.getValueKey(locale)]: true } });
    });
  }

  getLocale() {
    if (Meteor.isServer) {
      throw new Meteor.Error('getLocale can only be called on the client');
    }
    return this.locale.get();
  }

  setLocale(locale) {
    if (Meteor.isServer) {
      throw new Meteor.Error('setLocale can only be called on the client');
    }
    return this.locale.set(locale);
  }

  getValueKey(locale) {
    return `value_${locale}`;
  }

  translate(keyOrNamespace, { _locale = this.getLocale(), ...params } = {}) {
    if (Meteor.isClient && !this.subscription.ready()) {
      return '';
    }
    if (!keyOrNamespace) {
      return '';
    }

    const results = this.findResultsForKey(keyOrNamespace);

    const open = '{$';
    const close = '}';

    const getValue = (entry, locale) => {
      if (_.has(entry, this.getValueKey(locale))) {
        let value = entry[this.getValueKey(locale)];

        Object.keys(params).forEach((param) => {
          value = value.split(open + param + close).join(params[param]);
        });

        return value;
      }
      return entry._id;
    };
    const object = unflatten(
         _.chain(results)
         .sortBy(({ _id }) => _id.length)
         .keyBy('_id')
         .mapValues(entry => getValue(entry, _locale))
         .value(),
       { overwrite: true });
    const objectOrString = _.get(object, keyOrNamespace);
    if (!_.isString(objectOrString) && _.isEmpty(objectOrString)) {
      // empty object or undefined
      return keyOrNamespace;
    }
    return objectOrString;
  }

  findResultsForKey(keyOrNamespace) {
    return this.collection.find({ _id: { $regex: `${keyOrNamespace}/*` } }).fetch();
  }


}
