<div align="center">
  
[![volverjs](docs/static/zod-vue-i18n.svg)](https://volverjs.github.io/zod-vue-i18n)

# zod-vue-i18n

`zod` `vue3` `i18n` `vue-i18n`
  
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=volverjs_zod-vue-i18n&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=volverjs_zod-vue-i18n) [![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=volverjs_zod-vue-i18n&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=volverjs_zod-vue-i18n) [![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=volverjs_zod-vue-i18n&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=volverjs_zod-vue-i18n) [![Depfu](https://badges.depfu.com/badges/0fc5114253837ef87562eb64d185a853/status.svg)](https://depfu.com) [![Depfu](https://badges.depfu.com/badges/0fc5114253837ef87562eb64d185a853/overview.svg)](https://depfu.com/github/volverjs/zod-vue-i18n?project_id=38573)

<br>

maintained with ❤️ by

<br>

[![8 Wave](docs/static/8wave.svg)](https://8wave.it)

<br>

</div>

## Install

```bash
# pnpm
pnpm add zod-vue-i18n

# yarn
yarn add zod-vue-i18n

# npm
npm install zod-vue-i18n --save
```

## Usage

This library is used to translate [Zod](https://github.com/colinhacks/zod)'s default error messages with [vue-i18n](https://github.com/intlify/vue-i18n-next/).

```typescript
import { z } from 'zod'
import { makeZodI18nMap } from 'zod-vue-i18n'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      errors: {
        //...
      }
    },
    it: {
      errors: {
        //...
      }
    }
  }
})

z.setErrorMap(makeZodI18nMap(i18n))
```

## Plurals

Messages using `maximum`, `minimum` or `keys` can be converted to the plural form.

```json
{
  "exact_one": "String must contain exactly {{minimum}} character",
  "exact_other": "String must contain exactly {{minimum}} characters"
}
```

```typescript
import { createI18n } from 'vue-i18n'
import { makeZodI18nMap } from 'zod-vue-i18n'
import { z } from 'zod'
import en from 'zod-vue-i18n/dist/locales/en.json'
import it from 'zod-vue-i18n/dist/locales/it.json'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en,
    it
  }
})

z.setErrorMap(makeZodI18nMap(i18n))

z.string().length(1).safeParse('123') // String must contain exactly 1 character
z.string().length(3).safeParse('1234') // String must contain exactly 3 characters
```

## Locales

We provide a set of json files with the translation of the errors of `zod`. You can use them in your project.

```typescript
import { z } from 'zod'
import { createI18n } from 'vue-i18n'
import { makeZodI18nMap } from 'zod-vue-i18n'
import en from 'zod-vue-i18n/dist/locales/en.json'
import it from 'zod-vue-i18n/dist/locales/it.json'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en,
    it
  }
})

z.setErrorMap(makeZodI18nMap(i18n))
```

if you want to add a set of error labels in your `vue-i18n` instance, you can use two different ways:

### 1. Merge the messages when you create the instance

```typescript
import { z } from 'zod'
import { createI18n } from 'vue-i18n'
import { makeZodI18nMap } from 'zod-vue-i18n'
import en from 'zod-vue-i18n/dist/locales/en.json'
import it from 'zod-vue-i18n/dist/locales/it.json'
import myProjectMessages from './i18n'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      ...en,
      ...myProjectMessages.en
    },
    it: {
      ...it,
      ...myProjectMessages.it
    }
  }
})

z.setErrorMap(makeZodI18nMap(i18n))
```

### 2. Add the messages when you need

```typescript
import { z } from 'zod'
import { createI18n } from 'vue-i18n'
import { makeZodI18nMap } from 'zod-vue-i18n'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      //...
    },
    it: {
      //...
    }
  }
})

z.setErrorMap(makeZodI18nMap(i18n))

// add the messages in any file you want
import en from 'zod-vue-i18n/dist/locales/en.json'

i18n.global.mergeLocaleMessage(
  'en', // the locale you want to add
  en // the error messages you want to add
)
```

## Custom error messages

You can use custom error messages with the `params` property of the `refine` function.

```typescript
import { z } from 'zod'
import { createI18n } from 'vue-i18n'
import { makeZodI18nMap } from 'zod-vue-i18n'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      my_custom_key: 'This is not a string'
    }
  }
})

z.setErrorMap(makeZodI18nMap(i18n))

z.string()
  .refine(() => false, { params: { i18n: 'my_custom_key' } })
  .safeParse(123) // This is not a string
```

> **Note**
> To use this functionality you need to add the `i18n` key to the `params` object.

## Use `WithPath` to validate zod schema

When you use `z.object` to create a schema, you can handle the object key to customize the error message.

```typescript
import { z } from 'zod'
import { createI18n } from 'vue-i18n'
import { makeZodI18nMap } from 'zod-vue-i18n'

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      errors: {
        invalidType: 'Expected {expected}, received {received}',
        invalitTypeWithPath:
          'The {path} property expected {expected}, received {received}'
      }
    }
  }
})

z.setErrorMap(makeZodI18nMap(i18n))

z.string().parse(1) // => Expected string, received number

z.object({
  name: z.string()
}).parse({ name: 1 }) // => The name property expected string, received number
```

If `WithPath` is suffixed to the key of the message, that message will be adopted in the case of an object type schema.
If there is no message key with \WithPath, fall back to the normal error message.

## Acknoledgements

`zod-vue-i18n` is inspired by [`zod-i18n-map`](https://github.com/aiji42/zod-i18n).

## License

[MIT](http://opensource.org/licenses/MIT)
