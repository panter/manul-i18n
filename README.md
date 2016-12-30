# manul-i18n

i18n-Solution for mantra apps (meteor + react). Brought to you by Panter's Manul-Team.
Inspired by https://github.com/vazco/meteor-universe-i18n

`npm install --save @panter/manul-i18n`

## Features

- supports yaml-files (with https://github.com/vazco/meteor-universe-i18n) and collections as store for translations
- provides `<T>`-Component for easy translations (we call it "Mr. T")
- you can manually translate strings with 
- you can translate SimpleSchemas in a hoc. This comes handy with `<AutoForm>` from https://github.com/vazco/uniforms/

## Usage

Once the service is setup (see below), you can use it like this:

### In react components

Use Mr. `<T>` in React-Components


```
import { T } from '@panter/manul-i18n`

//....

<div>
  <h1>
    <T>home.title</T>
  </h1>
  <h2>
    <T>home.subTitle</T>
  </h2>
  <p className="greeting">
    <T username={username}>home.greeting</T>
  </p>
</div>

```

`<T>` is a react-node (a span by default), but sometimes you need a string, e.g. for alt-attribute on `<img>`-tags.
In this case use this:

```
<T _id="home.content.image.alttext">{(altText) => <img alt={altText} src="..." />}</T>

```

You
### Outside React-Components



```
const errorMessage = i18n.t("errors.login.failed");
alert(errorMessage);

const greeting = i18n.t("home.greeting", {username: "macrozone"});
alert(greeting);
```






## Setup with Collection 

Provide the service in your mantra context.js. Here is an example configuration
with the collection store:

```
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
//...
import { ReactiveVar } from 'meteor/reactive-var';
import { I18n } from '@panter/manul-i18n';
import CollectionTranslationStore from '@panter/manul-i18n/stores/collection';

const translationStore = new CollectionTranslationStore({
  Meteor,
  ReactiveVar, // you have to provide this atm. because it is a meteor-package
  collection: Collections.Translations, // the Meteor.Collection that hold the translations
});

const i18n = new I18n({
  supportedLocales: ['de', 'en', 'fr', 'it'],
  defaultLocale: 'de',
  translationStore,
});
  
// ...

const context = {
  Meteor,
  LocalState,
  // ...
  i18n
}
```

The Collection should have the following schema:

```
{
  _id: {
    type: String,
  },
  value_de: {
    type: String,
    optional: true,
  },
  value_en: {
    type: String,
    optional: true,
  },
  value_fr: {
    type: String,
    optional: true,
  },
  value_it: {
    type: String,
    optional: true,
  },
}

```
