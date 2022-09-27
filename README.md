# Mongez Localization

A simple i18n localization handler.

## Installation

`yarn add @mongez/localization`

Or

`npm i @mongez/localization`

## Usage

Let's set our package configurations so we can move on with our usage.

### Configuration Setup

Create a `src/config/localization.ts` or `localization.js` of you still use Javascript and in somewhere earlier in your app, import the config file.

```ts
// src/config/localization.ts
import {
  TranslationsList,
  setLocalizationConfigurations,
} from "@mongez/localization";

const translations: TranslationsList = {
  en: {
    home: "Home Page",
    contactUs: "Contact Us",
  },
  ar: {
    home: "الصفحة الرئيسية",
  },
};

setLocalizationConfigurations({
  /**
   * Default locale code
   */
  defaultLocaleCode: "ar",
  /**
   * Fall back locale code
   */
  fallback: "en",
  /**
   * Set translations list
   */
  translations: translations,
});
```

Here we defined our current default locale code, fallback locale code and our translations list, now we're ready to use our translator.

> Don't forget to import the file in some point earlier in your project, `src/index.ts` or `/src/index.js`.

## Translating Keywords

Now we can start using our translator by calling the `trans` method.

```ts
// some-file-in-the-project.ts
import { trans } from "@mongez/localization";

// based on our previous configurations, the default locale code is ar, so translation will be taken from its object.
trans("home"); // الصفحة الرئيسية
```

## Translation fallback

As we set our fallback locale code as `en`, now whenever the keyword is not defined in our current locale code, it will be checked in the fallback locale code object instead.

```ts
// some-file-in-the-project.ts
import { trans } from "@mongez/localization";

// the `contactUs` keyword is not defined in `ar` locale code but defined in the fallback locale code `en`, so translation will be taken from `en` object
trans("contactUs"); // Contact Us
```

## Missing Translation keyword

If the keyword doesn't exist in the current locale code nor in the fallback locale code, then the keyword itself will be returned.

```ts
// some-file-in-the-project.ts
import { trans } from "@mongez/localization";

trans("unknownKeyword"); // unknownKeyword
```

## Translating from certain locale code

We can get a translation keyword from certain locale code by using `transFrom` function, the function arguments is the same as `trans` except the first argument is the locale code name.

```ts
// some-file-in-the-project.ts
import { transFrom } from "@mongez/localization";

transFrom("en", "contactUs"); // Contact Us
```

## Extending Translations

We may not define our translations list in the localization configurations, instead we can define each locale code translation in separate files and extend the translations keywords, this is done by `extend` function.

Let's create a `src/locales` directory and add `en.ts` and `ar.ts` files inside it.

```ts
// src/locales/en.ts
import { extend } from "@mongez/localization";

extend("en", {
  home: "Home Page",
  contactUs: "Contact Us",
});
```

```ts
// src/locales/ar.ts
import { extend } from "@mongez/localization";

extend("ar", {
  home: "الصفحة الرئيسية",
});
```

Now let's just import our locales file in the `src/config/localization.ts` file

```ts
// src/config/localization.ts
import "src/locales/en";
import "src/locales/ar";
import { setLocalizationConfigurations } from "@mongez/localization";

setLocalizationConfigurations({
  /**
   * Default locale code
   */
  defaultLocaleCode: "ar",
  /**
   * Fall back locale code
   */
  fallback: "en",
});
```

Our code is now much organized and easier for modification.

## Grouped Translations

Another way to set translations is to define a keyword and inside it list of translations based on the locale code using `groupedTranslations` function.

```ts
// src/locales/localization.ts
import { groupedTranslations } from "@mongez/localization";

groupedTranslations({
  home: {
    en: "Home Page",
    ar: "الصفحة الرئيسية",
  },
  contactUs: {
    en: "Contact Us",
    ar: "اتصل بنا",
  },
});
```

You can also specify a group name (`dot.notation-syntax is allowed as well`) by sending 2nd argument to the function

> Added in 1.0.19

```ts
// src/locales/localization.ts
import { groupedTranslations } from "@mongez/localization";

groupedTranslations('store', {
  orders: {
    en: "Orders",
    ar: "الطلبات",
  },
  products: {
    en: "Products",
    ar: "المنتجات",
  },
});

trans('store.orders'); // Products
```

## Translation placeholders

> Updated in v2.0

Another powerful feature is to set a placeholder that can be modified dynamically based on the given value.

```ts
// src/locales/en.ts
import { extend } from "@mongez/localization";

extend("en", {
  createItem: "Create New :item",
  minimumOrderPurchase: "Minimum purchase amount for this order is :amount USD",
});
```

Now we defined two keywords, `createItem` and `minimumOrderPurchase`, in the `createItem` keyword there is a placeholder `:item`, this placeholder means that there will be a text that replace this placeholder when calling the translation function, let's see it in action.

```ts
// somewhere in the app
import { trans } from "@mongez/localization";

trans("createItem", { item: 'Order' }); // Create New Order
trans("createItem", { item: 'Customer' }); // Create New Customer
trans("createItem", { item: "Category" }); // Create New Category
```

As easy as that!, now let's see the other keyword `minimumOrderPurchase` it contains `:amount` placeholder, that means this placeholder will be replaced with a value.

> Please note that using `:` with keywords might make conflicts if it appears to be needed remained, so pickup a different word instead for the placeholder.

```ts
// somewhere in the app
import { trans } from "@mongez/localization";

trans("minimumOrderPurchase", { amount: 12 }); // Minimum purchase amount for this order is 12 USD
```

### JSX Placeholders

> Added in V2.0

You might also specify the placeholder to be a jsx element instead of just a string or an integer, this will drive us to set a converter function in our configurations to allow jsx elements.

```ts
// src/config/localization.ts

import { jsxConverter, setLocalizationConfigurations } from "@mongez/localization";

setLocalizationConfigurations({
  /**
   * Default locale code
   */
  defaultLocaleCode: "ar",
  /**
   * Fall back locale code
   */
  fallback: "en",
  /**
   * Converter function to convert the placeholder value to jsx element
   */
  converter: jsxConverter,
});
```

You might also use your own converter function, the converter function receives the translated string and the placeholders list

```ts
// src/config/localization.ts

import { setLocalizationConfigurations } from "@mongez/localization";

setLocalizationConfigurations({
  /**
   * Default locale code
   */
  defaultLocaleCode: "ar",
  /**
   * Fall back locale code
   */
  fallback: "en",
  /**
   * Converter function to convert the placeholder value to jsx element
   */
  converter: (translatedString: string, placeholders: any) => {
    // do something with the translated string and the placeholders
    return translatedString;
  },
});
```

```tsx
import { trans } from '@mongez/localization';

export function RedComponent() {
  return (
    <>
      {trans('minimumOrderPurchase', { amount: <strong style={{color: 'red'}}>12</strong> })}
    </strong>
  )
}
```

Keep in mind that the return value for the `trans` function will be an array not a string.

### Using jsx without converter

You can use use the translation text with jsx by using `transX` function instead of `trans` this will always use the `jsxConverter` unlike the `trans` method which uses the converter from the defined configurations list.

```tsx
import { trans, transX } from '@mongez/localization';

export function RedComponent() {
  return (
    <>
      // will convert the jsx value to [object Object] if the converter is not set to jsxConverter in the configurations.
      {trans('minimumOrderPurchase', { amount: <strong style={{color: 'red'}}>12</strong> })}

      // works fine regardless configurations.
      {transX('minimumOrderPurchase', { amount: <strong style={{color: 'red'}}>12</strong> })}
    </strong>
  )
}
```

## Changing Current Locale Code

By default, The package will use the current locale code defined in the configurations list, but we can change current locale code later in the project for example when a locale code is changed to a new locale code using `setCurrentLocaleCode` function.

```ts
// somewhere in the app
import { setCurrentLocaleCode } from "@mongez/localization";

// if current locale code is ar
trans("home"); // الصفحة الرئيسية

setCurrentLocaleCode("en");

trans("home"); // Home Page
```

## Changing fallback locale code

Same applies in fallback locale code, it can be changed later from anywhere in your project using `setFallbackLocaleCode` function.

```ts
// somewhere in the app
import { setFallbackLocaleCode } from "@mongez/localization";

setFallbackLocaleCode("ar"); // Now fallback is changed to `ar`
```

## Getting Translations list

To get the entire translations list of all locale codes, use `getTranslationsList` function.

```ts
// somewhere in the app
import { getTranslationsList } from "@mongez/localization";

getTranslationsList(); // something like {en: {home: 'Home Page'}, ar: {home: 'الصفحة الرئيسية'}}
```

To Get keywords list of certain locale code, use `getKeywordsListOf` function.

```ts
// somewhere in the app
import { getKeywordsListOf } from "@mongez/localization";

getKeywordsListOf("en"); // something like {home: 'Home Page'}}
```

## Localization Events

You can be notified once a locale code is changed, or once the fallback locale code is changed as well using `localizationEvents` object.

```ts
// somewhere in the app
import { setCurrentLocaleCode, localizationEvents } from "@mongez/localization";

localizationEvents.onChange("localeCode", (newLocaleCode, oldLocaleCode) => {
  console.log(newLocaleCode, oldLocaleCode); // en ar
});

// assuming current locale code is `ar`
setCurrentLocaleCode("en"); // once calling the `setCurrentLocaleCode` the `onChange.localeCode` event will be triggered.
```

Fallback locale codes is also available to be detected once it is changed.

```ts
// somewhere in the app
import {
  setFallbackLocaleCode,
  localizationEvents,
} from "@mongez/localization";

localizationEvents.onChange("fallback", (newLocaleCode, oldLocaleCode) => {
  console.log(newLocaleCode, oldLocaleCode); // ar en
});

// assuming current fallback locale code is `en`
setFallbackLocaleCode("ar"); // once calling the `setFallbackLocaleCode` the `onChange.fallback` event will be triggered.
```

## Change Log

- 2.0.0 (27 Sept 2022)
  - Added Converters for placeholders, as translation now supports jsx for replacements.
  - Removed `sprintf-js` package.
- 1.0.19 (23 Aug 2022)
  - Now [grouped translations](#grouped-translations) accepts `groupKey`
- 1.0.17 (8 Jun 2022)
  - Added `sprintf-js` dependency.
- 1.0.12 (06 Jan 2022)
  - Added [Translations list](#getting-translations-list)

## TODO

- Add unit Tests.
