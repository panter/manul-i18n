import _ from 'lodash';
import { flow, sortBy, keyBy, mapValues } from 'lodash/fp';

import flat, { unflatten } from 'flat';


export default class {
  constructor({
    Meteor,
    Ground, // optional, enables caching via Ground https://github.com/GroundMeteor/
    ReactiveVar, // only needed on client
    collection,
    publicationName = 'translations',
    } = {}) {
    this.Ground = Ground;
    this.publicationName = publicationName;
    this.collection = collection;
    this.Meteor = Meteor;
    this.ReactiveVar = ReactiveVar;

    if (Meteor.isClient) {
      this.initClient();
    } else {
      this.initServer();
    }
  }

  getLocale() {
    if (this.Meteor.isServer) {
      console.trace('getLocale can only be called on the client, pass _locale to translate if using from server');
      throw new this.Meteor.Error('getLocale can only be called on the client');
    }
    return this.locale.get();
  }

  setLocale(locale) {
    if (this.Meteor.isServer) {
      throw new this.Meteor.Error('setLocale can only be called on the client');
    }
    this.locale.set(locale);
    this.startSubscription(locale); // restart
  }

  initClient() {
    this.locale = new this.ReactiveVar();
    this.subscriptions = {};
    if (this.Ground) {
      this.collectionGrounded = new this.Ground.Collection(`${this.collection._name}-grounded`);
      this.collectionGrounded.observeSource(this.collection.find());
    }
  }


  startSubscription(locale) {
    if (!locale || this.subscriptions[locale]) {
      return; // do not resubscribe;
    }
    // we keep all old subscription, so no stop or tracker here
    this.subscriptions[locale] = this.Meteor.subscribe(this.publicationName, locale, () => {
      if (this.collectionGrounded) {
        // reset and keep only new ones
        this.collectionGrounded.keep(this.collection.find());
      }
    });
  }

  initServer() {
    const that = this;
    this.Meteor.publish(this.publicationName, function publishTranslations(locale) {
      if (!locale) {
        this.ready();
        return null;
      }
      return that.collection.find({}, { fields: { [that.getValueKey(locale)]: true } });
    },
    );
  }


  /* eslint class-methods-use-this: 0*/
  getValueKey(locale) {
    return `value_${locale}`;
  }
  _getValue(entry, locale, params) {
    if (_.has(entry, this.getValueKey(locale))) {
      return this._replaceParamsInString(
          _.get(entry, this.getValueKey(locale)),
        params,
      );
    }
    return null;
  }

  translate(keyOrNamespace, options = {}) {
    const { _locale = this.getLocale(), ...params } = options;
    // if locale is different (e.g. fallback), subscribe to that locale as well
    // so that it will be available soon
    if (this.Meteor.isClient && _locale !== this.getLocale()) {
      this.startSubscription(_locale);
    }
    if (!keyOrNamespace) {
      return '';
    }

    const entryByKey = this._findEntryForKey(keyOrNamespace);
    if (entryByKey) {
      return this._getValue(entryByKey, _locale, params);
    } else if (this.subscriptions[_locale].ready()) {
      // try to find for namespace
      // this is expensive, so we do it only if subscription is ready
      const entries = this._findEntriesForNamespace(keyOrNamespace);
      const fullObject = unflatten(
        flow(
        sortBy(({ _id }) => _id.length),
        keyBy('_id'),
        mapValues(entry => this._getValue(entry, _locale, params)),
      )(entries), { overwrite: true });
      const objectForNamespace = _.get(fullObject, keyOrNamespace);
      if (_.isEmpty(objectForNamespace)) {
        return null;
      }
      return objectForNamespace;
    }
    return null;
  }
  getCollection() {
    return this.collectionGrounded || this.collection;
  }
  has(keyOrNamespace) {
    return this.getCollection().findOne(keyOrNamespace);
  }
  hasObject(namespace) {
    return this.findResultsForNamespace(namespace).length > 1;
  }


  /**
  returns either one or multiple results
  multiple results means that an namespace was requested
  **/
  _findEntryForKey(keyOrNamespace) {
    return this.getCollection().findOne(keyOrNamespace);
  }

  _findEntriesForNamespace(namespace) {
    // console.log('doing expensive fetch', namespace);
    return this.getCollection().find({ _id: { $regex: `^${namespace}` } }).fetch();
  }

  _replaceParamsInString(string, paramsUnflatted) {
    // flat params if not flat
    const params = flat(paramsUnflatted);
    const open = '{$';
    const close = '}';
    let replacedString = string;
    Object.keys(params).forEach((param) => {
      const substitution = _.get(params, param, '');
      replacedString = replacedString.split(open + param + close).join(substitution);
    });
    return replacedString;
  }


}
