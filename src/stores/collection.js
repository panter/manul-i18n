import _ from 'lodash';
import flat, { unflatten } from 'flat';


export default class {
  constructor({
    Meteor,
    ReactiveVar, // only needed on client
    collection,
    publicationName = 'translations',
    } = {}) {
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

  initClient() {
    this.locale = new this.ReactiveVar();
    this.startSubscription(this.getLocale());
  }

  startSubscription(locale) {
    // we keep all old subscription, so no stop or tracker here
    this.Meteor.subscribe(this.publicationName, locale);
  }

  initServer() {
    this.Meteor.publish(this.publicationName, locale =>
       this.collection.find({}, { fields: { [this.getValueKey(locale)]: true } }),
    );
  }

  getLocale() {
    if (this.Meteor.isServer) {
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
  /* eslint class-methods-use-this: 0*/
  getValueKey(locale) {
    return `value_${locale}`;
  }

  translate(keyOrNamespace, options = {}) {
    const { _locale = this.getLocale(), ...params } = options;
    // if locale is different (e.g. fallback), subscribe to that locale as well
    // so that it will be available soon
    if (_locale !== this.getLocale()) {
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
         _.chain(results)
         .sortBy(({ _id }) => _id.length)
         .keyBy('_id')
         .mapValues(getValue)
         .value(),
       { overwrite: true });
    const objectOrString = _.get(object, keyOrNamespace);
    if (!_.isString(objectOrString) && _.isEmpty(objectOrString)) {
      // empty object or undefined
      return null;
    }
    return objectOrString;
  }

  has(keyOrNamespace) {
    return this.collection.findOne(keyOrNamespace);
  }
  hasObject(keyOrNamespace) {
    return this.findResultsForKey(keyOrNamespace).length > 1;
  }

  findResultsForKey(keyOrNamespace) {
    const result = this.collection.findOne(keyOrNamespace);
    if (!result) {
      // a parent is requested, find all childs that start with keyOrNamespace
      // this is slow, so we do it only if there is no exact key
      return this.collection.find({ _id: { $regex: `${keyOrNamespace}/*` } }).fetch();
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
