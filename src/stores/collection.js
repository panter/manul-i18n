import { flow, sortBy, keyBy, mapValues } from 'lodash/fp'
import _ from 'lodash'
import flat, { unflatten } from 'flat'

export default class {
  constructor({
    Meteor,
    Ground, // optional, enables caching via Ground https://github.com/GroundMeteor/
    collection,
    publicationName = 'translations',

    // set to true if you are experience high loads. Translations will no longer be reactive if true
    useMethod = false,
    Tracker
  } = {}) {
    this.Ground = Ground
    this.Tracker = Tracker
    this.publicationName = publicationName
    this.collection = collection
    this.Meteor = Meteor

    this.useMethod = useMethod
    this.subscriptions = {}
    if (this.useMethod && !Ground) {
      throw new Error('please use ground-collection if using method calls')
    }

    if (Meteor.isClient) {
      this.initClient()
    } else {
      this.initServer()
    }
  }

  initClient() {
    if (this.Ground) {
      this.collectionGrounded = new this.Ground.Collection(
        `${this.collection._name}-grounded`
      )
      if (!this.useMethod) {
        this.collectionGrounded.observeSource(this.collection.find())
      }
    }
  }

  startSubscription(locale) {
    if (this.Meteor.isServer) {
      return
    }
    if (!locale || this.subscriptions[locale]) {
      return // do not resubscribe;
    }
    if (this.useMethod) {
      this.subscriptions[locale] = true
      this.Meteor.call('_translations', locale, (error, translations) => {
        if (!error) {
          const usedIds = []
          translations.forEach(({ _id, ...translation }) => {
            try {
              this.getCollection().upsert({ _id }, { $set: translation })
              usedIds.push(_id)
            } catch (e) {
              // some upserts might throw error (if id is accidentaly an objectid)
              console.log(e)
            }
          })
          this.getCollection().remove({ _id: { $nin: usedIds } })
        }
      })
    } else {
      this.Tracker.nonreactive(() => {
        // we keep all old subscription, so no stop or tracker here
        this.subscriptions[locale] = this.Meteor.subscribe(
          this.publicationName,
          locale,
          () => {
            if (this.collectionGrounded) {
              // reset and keep only new ones
              this.collectionGrounded.keep(this.collection.find())
            }
          }
        )
      })
    }
  }

  initServer() {
    const that = this
    this.Meteor.methods({
      _translations(locale) {
        return that.collection
          .find({}, { fields: { [that.getValueKey(locale)]: true } })
          .fetch()
      }
    })
    this.Meteor.publish(this.publicationName, function publishTranslations(
      locale
    ) {
      if (!locale) {
        this.ready()
        return null
      }

      return that.collection.find(
        {},
        { fields: { [that.getValueKey(locale)]: true } }
      )
    })
  }

  /* eslint class-methods-use-this: 0*/
  getValueKey(locale) {
    return `value_${locale}`
  }
  _getValue(entry, locale, params) {
    if (_.has(entry, this.getValueKey(locale))) {
      return this._replaceParamsInString(
        _.get(entry, this.getValueKey(locale)),
        params
      )
    }
    return null
  }

  translate(locale, keyOrNamespace, params = {}) {
    // if locale is different (e.g. fallback), subscribe to that locale as well
    // so that it will be available soon
    if (this.Meteor.isClient) {
      this.startSubscription(locale)
    }
    if (!keyOrNamespace) {
      return ''
    }

    const entryByKey = this._findEntryForKey(keyOrNamespace)

    if (entryByKey) {
      return this._getValue(entryByKey, locale, params)
    } else if (
      this.useMethod ||
      this.Meteor.isServer ||
      this.Meteor.isClient
      // || this.subscriptions[locale].ready()
    ) {
      // try to find for namespace
      // this is expensive, so we do it only if subscription is ready
      const entries = this._findEntriesForNamespace(keyOrNamespace)
      const fullObject = unflatten(
        flow(
          sortBy(({ _id }) => _id.length),
          keyBy('_id'),
          mapValues(entry => this._getValue(entry, locale, params))
        )(entries),
        { overwrite: true }
      )
      const objectForNamespace = _.get(fullObject, keyOrNamespace)
      if (_.isEmpty(objectForNamespace)) {
        return null
      }
      return objectForNamespace
    }
    return null
  }
  getCollection() {
    return this.collectionGrounded || this.collection
  }
  has(keyOrNamespace) {
    return this.getCollection().findOne(keyOrNamespace)
  }
  hasObject(namespace) {
    return this.findResultsForNamespace(namespace).length > 1
  }

  /**
  returns either one or multiple results
  multiple results means that an namespace was requested
  **/
  _findEntryForKey(keyOrNamespace) {
    return this.getCollection().findOne(keyOrNamespace)
  }

  _findEntriesForNamespace(namespace) {
    // console.log('doing expensive fetch', namespace);
    return this.getCollection()
      .find({ _id: { $regex: `^${namespace}` } })
      .fetch()
  }

  _replaceParamsInString(string, paramsUnflatted) {
    // flat params if not flat
    const params = flat(paramsUnflatted)
    const open = '{$'
    const close = '}'
    let replacedString = string
    if (!replacedString) {
      return replacedString
    }
    Object.keys(params).forEach(param => {
      const substitution = _.get(params, param, '')
      replacedString = replacedString
        .split(open + param + close)
        .join(substitution)
    })
    return replacedString
  }
}
