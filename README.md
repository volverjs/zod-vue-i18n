<div align="center">
  
[![volverjs](docs/static/zod-vue-i18n.svg)](https://volverjs.github.io/zod-vue-i18n)

## zod-vue-i18n

`zod` `vue3` `i18n` `vue-i18n`

<br>

#### proudly powered by

<br>

[![24/Consulting](docs/static/24consulting.svg)](https://24consulting.it)

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

This libray provides a function that permit to use the translation of [vue-i18n](https://github.com/intlify/vue-i18n-next/) with the validation error of [zod](https://github.com/colinhacks/zod).

```typescript
import { makeZodVueI18n } from 'zod-vue-i18n'
import { z } from 'zod'
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

z.setErrorMap(makeZodVueI18n(i18n))
```

## Locales

We provide a set of json files with the translation of the errors of zod. You can use them in your project.

```typescript
import { createI18n } from 'vue-i18n'
import { makeZodVueI18n } from 'zod-vue-i18n'
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

z.setErrorMap(makeZodVueI18n(i18n))
```

## Plurals

Messages using `maximum`, `minimum` or `keys` can be converted to the plural form.

```json
{
  "exact_one": "String must contain exactly {{minimum}} character",
  "exact_other": "String must contain exactly {{minimum}} characters",
}
```
```typescript
import { createI18n } from 'vue-i18n'
import { makeZodVueI18n } from 'zod-vue-i18n'
import { z } from 'zod'
import en from 'zod-vue-i18n/dist/locales/en.json'
import it from 'zod-vue-i18n/dist/locales/it.json'q

const i18n = createI18n({
  locale: 'en',
  messages: {
    en,
    it
  }
})

z.setErrorMap(makeZodVueI18n(i18n))

z.string().length(1).safeParse('123') // String must contain exactly 1 character
z.string().length(3).safeParse('1234') // String must contain exactly 3 characters
```

