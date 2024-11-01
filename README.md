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
   *
   * @default en
   */
  defaultLocaleCode: "ar",
  /**
   * Fall back locale code
   *
   * @default en
   */
  fallback: "en",
  /**
   * Set translations list
   */
  translations: translations,
});
```

All configurations are optional, you can set only the configurations you need.

Here is the list of configurations:

```ts
export type LocalizationConfigurations = {
  /**
   * Default locale code
   *
   * @default en
   */
  defaultLocaleCode?: string;
  /**
   * Fall back locale code
   *
   * @default en
   */
  fallback?: string;
  /**
   * Set translations list
   */
  translations?: TranslationsList;
  /**
   * Set placeholder converter
   */
  converter?: Converter;
  /**
   * Set placeholder pattern
   *
   * @default colon
   */
  placeholderPattern?: "colon" | "doubleCurly" | RegExp;
};
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
   *
   * @default en
   */
  defaultLocaleCode: "ar",
  /**
   * Fall back locale code
   *
   * @default en
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

groupedTranslations("store", {
  orders: {
    en: "Orders",
    ar: "الطلبات",
  },
  products: {
    en: "Products",
    ar: "المنتجات",
  },
});

trans("store.orders"); // Products
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

trans("createItem", { item: "Order" }); // Create New Order
trans("createItem", { item: "Customer" }); // Create New Customer
trans("createItem", { item: "Category" }); // Create New Category
```

As easy as that!, now let's see the other keyword `minimumOrderPurchase` it contains `:amount` placeholder, that means this placeholder will be replaced with a value.

> Please note that using `:` with keywords might make conflicts if it appears to be needed remained, so pickup a different word instead for the placeholder.

```ts
// somewhere in the app
import { trans } from "@mongez/localization";

trans("minimumOrderPurchase", { amount: 12 }); // Minimum purchase amount for this order is 12 USD
```

## Nested grouped translations

> Added in V3.0.0

You can also nest grouped translations, this will allow you to group translations in a more organized way.

```ts
// src/locales/localization.ts
import { groupedTranslations } from "@mongez/localization";

groupedTranslations({
  store: {
    orders: {
      en: "Orders",
      ar: "الطلبات",
    },
    products: {
      en: "Products",
      ar: "المنتجات",
    },
});
```

## React JSX Placeholders

> Added in V2.0

You might also specify the placeholder to be a jsx element instead of just a string or an integer, this will drive us to set a converter function in our configurations to allow jsx elements.

But we need to install the converter first

`npm i @mongez/react-localization`

OR

`yarn add @mongez/react-localization`

```ts
// src/config/localization.ts

import { jsxConverter } from "@mongez/react-localization";
import { setLocalizationConfigurations } from "@mongez/localization";

setLocalizationConfigurations({
  /**
   * Default locale code
   *
   * @default en
   */
  defaultLocaleCode: "ar",
  /**
   * Fall back locale code
   *
   * @default en
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
   *
   * @default en
   */
  defaultLocaleCode: "ar",
  /**
   * Fall back locale code
   *
   * @default en
   */
  fallback: "en",
  /**
   * Converter function to convert the placeholder value to jsx element
   */
  converter: (
    translatedString: string,
    placeholders: any,
    placeholder: RegExp,
  ) => {
    // do something with the translated string and the placeholders
    return translatedString;
  },
});
```

```tsx
import { trans } from "@mongez/localization";

export function RedComponent() {
  return (
    <>
      {trans("minimumOrderPurchase", {
        amount: <strong style={{ color: "red" }}>12</strong>,
      })}
    </>
  );
}
```

Keep in mind that the return value for the `trans` function will be an array not a string.

### Using jsx without converter

You can use use the translation text with jsx by using `transX` function instead of `trans` this will always use the `jsxConverter` unlike the `trans` method which uses the converter from the defined configurations list.

```tsx
import { trans } from "@mongez/localization";
import { transX } from "@mongez/react-localization";

export function RedComponent() {
  return (
    <>
      {/* will convert the jsx value to [object Object] if the converter is not set to jsxConverter in the configurations.*/}

      {trans("minimumOrderPurchase", {
        amount: <strong style={{ color: "red" }}>12</strong>,
      })}

      {/* works fine regardless configurations. */}
      {transX("minimumOrderPurchase", {
        amount: <strong style={{ color: "red" }}>12</strong>,
      })}
    </>
  );
}
```

## Using Plain Converter

> Added in v2.0.10

You can use the plain converter directly regardless current converter using `plainTrans` function.

```ts
import { plainTrans } from "@mongez/localization";

plainTrans("minimumOrderPurchase", { amount: 12 }); // Minimum purchase amount for this order is 12 USD
```

## Placeholders pattern

> Added in v3.0

By default, the placeholder pattern is `colon`, but you can change it to `doubleCurly` or a custom regex pattern.

```ts
// src/config/localization.ts
import {
  setLocalizationConfigurations,
  extend,
  trans,
} from "@mongez/localization";

setLocalizationConfigurations({
  /**
   * Default locale code
   *
   * @default en
   */
  defaultLocaleCode: "ar",
  /**
   * Fall back locale code
   *
   * @default en
   */
  fallback: "en",
  /**
   * Set placeholder pattern
   *
   * @default colon
   */
  placeholderPattern: "doubleCurly",
});

// now the placeholder pattern is double curly
extend("en", {
  createItem: "Create New {{item}}",
  minimumOrderPurchase:
    "Minimum purchase amount for this order is {{amount}} USD",
});

trans("createItem", { item: "Order" });
```

We can also set it as a custom regex pattern.

```ts
// src/config/localization.ts
import { setLocalizationConfigurations } from "@mongez/localization";

setLocalizationConfigurations({
  /**
   * Default locale code
   *
   * @default en
   */
  defaultLocaleCode: "ar",
  /**
   * Fall back locale code
   *
   * @default en
   */
  fallback: "en",
  /**
   * Set placeholder pattern
   *
   * @default colon
   */
  placeholderPattern: /{{(.*?)}}/g,
});
```

## Translate from an object

> Added in v2.1.0

Now `trans` and `transFrom` functions can receive keyword as a `string` or an object of locale codes and their translations.

```ts
// src/locales/en.ts
import { trans, transFrom } from "@mongez/localization";

const translations = {
  home: {
    en: "Home Page",
    ar: "الصفحة الرئيسية",
  },
};

trans(translations.home); // Home Page (based on current locale code)

// Or using transFrom function
transFrom("en", translations.home); // Home Page (based on current locale code
```

If the given locale code does not exist in the given object, the `fallback` locale code will be used instead.

The main reason behind adding this feature is to allow us to use the same keyword in different files, for example, we have a file called `home.ts` that contains the translations for the home page, and we have another file called `dashboard.ts` that contains the translations for the dashboard page, and both files have a keyword called `home`, so we can use the same keyword in both files without conflicts.

```ts
// Dashboard Page
import { trans } from "@mongez/localization";
import dashboardTranslation from "./dashboard";
import frontOfficeTranslation from "./front-office";

trans(dashboardTranslation.home); // Dashboard

trans(frontOfficeTranslation.home); // Home Page
```

This can be useful as mentioned earlier, but if you registered these files using `groupedTranslations` function, the last added keyword will be used when using the dynamic string i.e `trans('home')`.

## Generate translatable object

> Added in v2.2.0

Another way to use translation by generating a translatable object, let's see an example to make it more clear.

Normal Usage:

```ts
import { trans, groupedTranslations } from "@mongez/localization";

groupedTranslations({
  home: {
    en: "Home Page",
    ar: "الصفحة الرئيسية",
  },
  dashboard: {
    en: "Dashboard",
    ar: "لوحة القيادة",
  },
});

trans("home"); // Home Page
```

Works just fine, but what if we want to make sure that the keyword is unique, and we don't want to use the same keyword in different files, also to reduce the syntax by not using `trans` function, we need then to use `transObject` instead of `groupedTranslations` function.

```ts
import { transObject } from "@mongez/localization";

export const translations = transObject({
  home: {
    en: "Home Page",
    ar: "الصفحة الرئيسية",
  },
  dashboard: {
    en: "Dashboard",
    ar: "لوحة القيادة",
  },
});

// import translation from anywhere in the application
console.log(translations.home); // Home Page
```

You see here, we used the direct access of the translation keyword directly without using `trans` function, and we can use the same keyword in different files without conflicts.

> If the keyword is not found, the `fallback` locale code will be used instead.

> If the keyword is not found in both current locale code and the fallback locale code, the keyword itself will be returned.

### Using placeholders

But, What if the keyword has placeholders, in that case, use the `translations.p` function that receives the keyword as first argument and the object of placeholders as the second argument.

```ts
import { transObject } from "@mongez/localization";

export const translations = {
  welcome: {
    en: "Hello :name",
    ar: "مرحبا :name",
  },
};

console.log(translations.p("welcome", { name: "Ahmed" })); // Hello Ahmed
```

> Kindly not the `p` property is reserved, you can not use it as a keyword.

### Using Plain converter

If for example, you're using the `jsx converter` by default, but you need to use `plain converter` for a specific keyword, you can use the `translations.plain` function, it also works with and without placeholders.

```ts
import { transObject } from "@mongez/localization";

export const translations = {
  welcome: {
    en: 'Hello :name',
    ar: 'مرحبا :name',
  }
  homePage: {
    en: 'Home Page',
    ar: 'الصفحة الرئيسية',
  }
};

console.log(translations.plain('welcome', { name: 'Ahmed' })); // Hello Ahmed
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

## Getting current locale code

You can get current locale code using `getCurrentLocaleCode` function.

```ts
// somewhere in the app
import { getCurrentLocaleCode } from "@mongez/localization";

getCurrentLocaleCode(); // ar
```

## Getting fallback locale code

You can get fallback locale code using `getFallbackLocaleCode` function.

```ts
// somewhere in the app
import { getFallbackLocaleCode } from "@mongez/localization";

getFallbackLocaleCode(); // en
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

## Get translation locale code

> Added in v3.1.0

Sometimes, we may need to get the locale code for the translation on the fly, a real world scenario is when locale code is `ar` and we want to get translation for `eg` if current selected country is `Egypt` or `sa` if current country is `Saudi Arabia`, this can be done by defining `get translationLocaleCode` in the configurations list.

```ts
// src/config/localization.ts
import {
  setLocalizationConfigurations,
  getCurrentLocaleCode,
} from "@mongez/localization";

setLocalizationConfigurations({
  /**
   * Default locale code
   *
   * @default en
   */
  defaultLocaleCode: "ar",
  /**
   * Fall back locale code
   *
   * @default en
   */
  fallback: "en",
  /**
   * Get translation locale code
   * Please note to make it as a getter function
   */
  get translationLocaleCode: () => {
    if (getCurrentLocaleCode() === "en") return "en";

  // country code from somewhere in the app
    if (countryCode === "eg") return "eg";

    if (countryCode === "sa") return "sa";

    return "ar";
  },
});
```

## Tests

To run tests, run the following command

```bash
yarn test
```

OR

```bash
npm run test
```

## Contributing

Contributions, issues and feature requests are welcome!.

If you're going to make a pull request, please make sure to follow the next steps:

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Make sure to add tests for your changes
5. Run tests (yarn test)
6. Push to the branch (git push origin feature/AmazingFeature)
7. Open a pull request

## Change Log

- 2.2.0 (12 Apr 2023)
  - Added [Translatable object function](#generate-translatable-object).
  - Renamed default `converter` to `plainConverter`.
  - Enhanced typings for `plainConverter`.
  - Added unit tests for `transObject` function.
- 2.1.1 (19 Feb 2023)
  - Enhanced translation when object is passed as a keyword.
- 2.1.0 (15 Feb 2023)
  - Now `trans` and `transFrom` function accepts `keyword` as **string** or **object**
- 2.0.11 (28 Nov 2022)
  - Added [Get fallback locale code function](#getting-fallback-locale-code)
- 2.0.10 (13 Nov 2022)
  - Added `plainTrans` function.
- 2.0.0 (27 Sept 2022)
  - Added Converters for placeholders, as translation now supports jsx for replacements.
  - Removed `sprintf-js` package.
  - Added Unit tests
- 1.0.19 (23 Aug 2022)
  - Now [grouped translations](#grouped-translations) accepts `groupKey`
- 1.0.17 (8 Jun 2022)
  - Added `sprintf-js` dependency.
- 1.0.12 (06 Jan 2022)
  - Added [Translations list](#getting-translations-list)
