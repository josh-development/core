# Using Providers

## What is a provider?

A provider is simply a layer between **Josh** and a database (or wherever data is stored). Each provider receives a payload from every method you use in your instance and returns a modified version.

## Basic Usage

Providers can be installed separately from Josh using Yarn or NPM. You can also create your own provider by extending the exported [`JoshProvider`](https://github.com/josh-development/core/blob/main/src/lib/structures/JoshProvider.ts) class.

In The example below we will use the default in-memory provider which using the native [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) class.

### CommonJS

```javascript
const { Josh, MapProvider } = require('@joshdb/core');

const josh = new Josh({
  name: 'name',
  provider: new MapProvider()
});
```

### ESM

```javascript
import { Josh, MapProvider } from '@joshdb/core';

const josh = new Josh({
  name: 'name',
  provider: new MapProvider()
});
```

### TypeScript

You can use [generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) to define what type your `Josh` instance uses.

```typescript
import { Josh, MapProvider } from '@joshdb/core';

interface User {
  name: string;

  email: string;
}

const josh = new Josh({
  name: 'name',
  provider: new MapProvider()
});
```

## Provider Options

Some providers may have options that can be passed when initiating them. These will be objects with their appropriate properties.

Below is an example of how that might look.

```javascript
const josh = new Josh({
  name: 'name',
  provider: new Provider({
    optionOne: 'optionOne',
    optionTwo: 'optionTwo'
  })
});
```
