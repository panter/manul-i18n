# manul-i18n

i18n-Solution for mantra apps (meteor + react). Brought to you by Panter's Manul-Team.
Inspired by https://github.com/vazco/meteor-universe-i18n

`npm install --save @panter/manul-i18n`

**Under development. Issues, Feedback and PR's very welcome!**

## Features

- supports yaml-files (with https://github.com/vazco/meteor-universe-i18n) and collections as store for translations
- provides `<T>`-Component for easy translations (we call it "Mr. T")
- you can manually translate strings with
- you can translate SimpleSchemas in a hoc. This comes handy with `<AutoForm>` from https://github.com/vazco/uniforms/

## Usage

First, setup the service in the context (see below),
then add the translations to your store.

### Structure of translations

You can group your translations into objects/namspaces,
no matter if you use the yaml-store or the collection-store:

```
home:
  title: "Manul"
  subTitle: "aka Pallas' cat"
  greeting: "Welcome {$username}"
  content:
    image:
      altText: "An image of a manul"

login:
  email: "Email-Adress"
  password:
    label: "Password"
register:
  firstname: "Firstname"
  lastname: "Lastname"
  gender:
    label: "Gender"
    m: "Male"
    f: "Female"
    other: "Something different"

```

You can call these translations by the path:

```
i18n.t("home.title"); // will return "Manul"
i18n.t("home.greeting", {username: "macrozone"}); // will return "Welcome macrozone"
i18n.t("home") // will return an object with the translations

// in react-components
<T>home.subTitle</T> // will render <span>aka Pallas' cat</span>

```

See below for more details.

### In react components

We provide a `<T>`-Component to add translations to react-components.
We call it "Mr. `<T>`". It's inspired by https://github.com/vazco/meteor-universe-i18n


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

Translate single key from the translation store (will render as <span>):

`<T>home.content.title</T>`

If you can't use react-node, but need a plain string, pass a function as child:

`<T _id="home.content.image.alttext">{(altText) => <img alt={altText} src="..." />}</T>`

MR. T can also pick properites from objects/documents by path.
E.g. this reads the object page.meta.title.<current locale>

`<T doc={page} >meta.title</T>`

also works with function-children:

`<T doc={page} _id="meta.title">{(altText) => <img alt={altText} src="..." />}</T>`

If you have simple object with keys as locales, e.g.

```
const myProperty = {
  de: "German",
  fr: "French",
  it: "English"
}
```

you can also use Mr. T to display the right translation (empty path)

`<T doc={myProperty} />`

#### Advanced:

If `i18n.isEditMode()` returns true (reactivly),
it will render the key instead of the translation (does not work for doc-paths currently).

You can pass property disableEditorBypass to disable this feature on a `<T>`:

`<T disableEditorBypass>path.to.key</T>`

if i18n-service provides a `editTranslationAction` and i18n isEditMode() is true
a click on `<T>` will call this function / mantra-action.
This is handy if you want to allow page-editors to **edit translations directly in the browser** (e.g. with manul-admin **coming soon!**)

If `editTranslationAction` is a string, it will invoke a (mantra-) action by this path
and pass the id of the translation to the action. E.g.:

```

editTranslationAction: "actions.admin.gotoEditTranslation"

// will call

// in admin.js actions

gotoEditTranslation({ i18n, FlowRouter }, translationId) {
  FlowRouter.go('admin.translations.edit', { _id: translationId });
}

```

It can also be a function. It then will be also called similar to the action

### Usage outside of react-components

use `i18n.t` to translate. This is a reactive data-source, so it can be used in a
Tracker.autorun-context like `createContainer` or in `composeWithTracker`

```
const errorMessage = i18n.t("errors.login.failed");
alert(errorMessage);

const greeting = i18n.t("home.greeting", {username: "macrozone"});
alert(greeting);

```
i18n also provides some more functions:

```
i18n.getLocale(); // get the current locale. This is reactive.
i18n.setLocale(newLocale); // change the locale / language. All <T> will update.
i18n.supports(locale); // true if locale is supported
i18n.getSupportedLocales(); // get all supported locales
i18n.onChangeLocale(callback); // runs callback if locale is changed
```



### Translate SimpleSchema

If you use SimpleSchema (https://github.com/aldeed/meteor-simple-schema),
and something like https://github.com/vazco/uniforms/ to generate
forms automatically from a schema, you might want to translate labels
and error-messages.

We provide a "hoc" (higher order component) for that, that can be used
in a container.

Here is an example for a login-form:


```

import { useDeps, composeWithTracker, composeAll } from 'mantra-core';
import LoginForm from '../components/LoginForm';
import { withTranslatedSchema } from "@panter/manul-i18n";

export const composer = ({context}, onData) => {
  const {LocalState, SimpleSchema} = context();
  const loginSchema = new SimpleSchema({

    email: {
      type: String,
      regEx: SimpleSchema.RegEx.Email,
    },
    password: {
      type: String
    }
  });
  onData(null, {error, loginSchema});
};

export const depsMapper = (context, actions) => ({
  login: actions.account.login,
  context: () => context
});

export default composeAll(
  // provide on object with the propnames of the schemas
  // and the namespace as the values.
  withTranslatedSchema({loginSchema: 'login'}),
  composeWithTracker(composer),
  useDeps(depsMapper)
)(LoginForm);


// LoginForm.jsx


import React from 'react';
import AutoForm from 'uniforms/AutoForm';

export default ({loginSchema, login}) => (
  <AutoForm schema={loginSchema} onSubmit={login} />  
)

```

The translation will be loaded from <namespace>.<schema-key>
In the example above these translations are used:

`login.email` and `login.password`

or `login.email.label`, `login.password.label`



#### Advanced Schema translation

You can also translate `allowedValues`, e.g. in a `<select>`-field:

```
const registerSchema = new SimpleSchema({
  firstname: {
    type: String
  },
  lastname: {
    type: String
  },
  gender: {
    type: String,
    allowedValues: ["m", "f", "other"]
  }
});

// translation store contains (example in yaml)

register:
  firstname: "Vorname"
  lastname: "Nachname"
  gender:
    label: "Geschlecht"
    m: "Männlich"
    w: "Weiblich"
    other: "Etwas anderes"

//...

withTranslatedSchema({registerSchema: "register"})

```



## Setup

### With Collection-Store

You should provide the service in your mantra context.js.
Here is an example configuration with the collection store:

```
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
//...
import { ReactiveVar } from 'meteor/reactive-var';
import { I18n } from '@panter/manul-i18n';
import CollectionTranslationStore from '@panter/manul-i18n/dist/stores/collection';

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
  //...
}

```

The _id will be used as the translation id. Use dot-notation to
group them into objects (e.g. this is needed for schema-translations).

Example:

```
// structure in yaml-notation:
home:
  title: "Manul"
  subTitle: "aka Pallas' cat"
  content:
    image:
      altText: "An image of a manul"

// should be stored like this in your collection:

[
{
  _id: "home.title",
  value_en: "Manul"
},
{
  _id: "home.subTitle",
  value_en: "aka Palla's cat"
},
{
  _id: "home.content.image.altText",
  value_en: "An image of a manul"
}
]

```

### Setup with universe-i18n

universe-i18n (https://github.com/vazco/meteor-universe-i18n)

provides an all-in-one solution for translations.
It also has a `<T>`-component, but with fewer features.

If you need these features as well as schema-translations,
you can use manul-i18n as an adapter for universe-i18n:

```
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Meteor } from 'meteor/meteor';
//...
import UniverseI18n from 'meteor/universe:i18n';
import { I18n } from '@panter/manul-i18n';
import UniverseTranslationStore from '@panter/manul-i18n/dist/stores/universe_i18n';

const translationStore = new UniverseTranslationStore({
  universeI18n: UniverseI18n,
  options: {} // options for universe-i18n
});

const i18n = new I18n({
  supportedLocales: ['de', 'en', 'fr', 'it'],
  defaultLocale: 'de',
  translationStore,
});
//...

```


### Advanced configuration


All constructor properties:

```
const i18n = new I18n({
  defaultLocale, // the default locale
  supportedLocale, // all locales that are supported
  translationStore, // the store as seen above

  // whether it should use fallback locale if translation is missing
  // the rule is the following: xx_XX --> xx --> defaultLocale
  useFallbackForMissing, // defaults to true

  // pass function as isEditMode that uses a reactive data-source
  // if you do so and it changes to true,
  // all of your translations will show their keys
  // also, if you click on one of your translations (via T),
  // editTranslationAction will be called
  isEditMode, // defaults to () => false,

  // mantra-action (string) or function
  // it gets called with the translationId whenever a user clicks on a <T>-Component
  // while isEditMode is true.
  editTranslationAction,  

  // shouldShowKeysAsFallback defines whether it should show the keys of translation
  // if the translation is not available (can also be reactive datasource)
  // this is usefull for admins and/or in development-environement
  shouldShowKeysAsFallback = () => false,
});


```


### Import yaml-translations into a collection.

This package also provides a function to import translations from an object
into a collection, e.g. to migrate from yaml to collection-store:

```

importIntoCollection({
  translations, // the translation object, e.g. loaded from a yaml file
  collection, // the collection to import into
  locales: // the locales that should be imported
  override: false, // wheter or not to override already existing keys.
});

```

### Seed translations

**It is highly recomended to seed translations initially!**

Here is an example how you could do this (on the server):

```

import { Meteor } from 'meteor/meteor';

import YAML from 'yamljs';
import importIntoCollection from '@panter/manul-i18n/dist/import_into_collection';
import { Translations } from '/lib/collections';

export default () => {
  Meteor.startup(() => {
    const localesToSeed = ['de'];
    const translations = {};
    const translationsForLocale = (locale) => {
      const translation = YAML.parse(Assets.getText(`i18n-seed/${locale}.yaml`));
      translations[locale] = translation;
    };

    localesToSeed.forEach(translationsForLocale);

    importIntoCollection({
      translations,
      collection: Translations,
      locales: localesToSeed,
      override: false,
    });
  });
};

```
