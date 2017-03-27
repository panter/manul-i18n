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

    const results = this.findResultsForKey(keyOrNamespace);

    const getValue = (entry) => {
      if (_.has(entry, this.getValueKey(_locale))) {
        return this._replaceParamsInString(
            _.get(entry, this.getValueKey(_locale)),
          params,
        );
      }
      return null;
    };
    const object = unflatten(
      flow(
      sortBy(({ _id }) => _id.length),
      keyBy('_id'),
      mapValues(getValue),
    )(results), { overwrite: true });
    const objectOrString = _.get(object, keyOrNamespace);
    if (!_.isString(objectOrString) && _.isEmpty(objectOrString)) {
      // empty object or undefined
      return null;
    }
    return objectOrString;
  }
  getCollection() {
    return this.collectionGrounded || this.collection;
  }
  has(keyOrNamespace) {
    return this.getCollection().findOne(keyOrNamespace);
  }
  hasObject(keyOrNamespace) {
    return this.findResultsForKey(keyOrNamespace).length > 1;
  }

  findResultsForKey(keyOrNamespace) {
    const result = this.getCollection().findOne(keyOrNamespace);
    if (!result) {
      // a parent is requested, find all childs that start with keyOrNamespace
      // this is slow, so we do it only if there is no exact key
      return this.getCollection().find({ _id: { $regex: `${keyOrNamespace}/*` } }).fetch();
    }
    return [result];
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
