# Getting Started with `@joshdb/core`

## Installing [`@joshdb/core`](https://github.com/josh-development/core/tree/build)

**When using `NPM`**

```sh
npm i @joshdb/core@next
```

**When using `Yarn`**

```sh
yarn add @joshdb/core@next
```

Note: Josh requires you to have Node.js v16.0.0 or higher.

## Basic Usage

You can make use of the **Josh** class exported from `@joshdb/core` by using `import` or `require`.

**When using JavaScript**

```javascript
const { Josh } = require('@joshdb/core');
```

**When using TypeScript**

```typescript
import { Josh } from '@joshdb/core';
```

You can initiate an instance very simply. Below will create an in-memory storage using the [`MapProvider`](https://github.com/josh-development/core/blob/main/src/lib/structures/defaultProvider/MapProvider.ts)

```javascript
const josh = new Josh({ name: 'name' });
```
