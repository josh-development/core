# Getting Started with `@joshdb/core`

## Installing [`@joshdb/core`](https://github.com/josh-development/core/tree/build)

```sh
# Using NPM
npm i @joshdb/core@next
# Or using Yarn
yarn add @joshdb/core@next
```

Note: Josh requires you to have Node.js v16.0.0 or higher.

## Basic Usage

You can make use of the **Josh** class exported from `@joshdb/core` by using `import` or `require`. You can then initiate an instance very simply. Below will create an in-memory storage using the [`MapProvider`](https://github.com/josh-development/core/blob/main/src/lib/structures/defaultProvider/MapProvider.ts)

### CommonJS

```javascript
const { Josh } = require('@joshdb/core');

const josh = new Josh({ name: 'name' });
```

### ESM

```javascript
import { Josh } from '@joshdb/core';

const josh = new Josh({ name: 'name' });
```

### TypeScript

You can use [generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) to define what type your `Josh` instance uses.

```typescript
import { Josh } from '@joshdb/core';

interface User {
  name: string;

  email: string;
}

const josh = new Josh<User>({ name: 'name' });
```
