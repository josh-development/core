# Creating Middleware

Now that you have the proper file structure and have an understanding of what a middleware is used for, let's get started!

## Basic Usage

You can make use of the **Middleware** class exported from `joshdb/core` by using `import` or `require`.

**When using JavaScript**

```javascript
const { Middleware } = require('@joshdb/core');
```

**When using TypeScript**

```typescript
import { Middleware } from '@joshdb/core';
```

Each middleware is a class that extends the base `Middleware` class from Josh. You need to extend it.

## Logger Middleware

To create a middleware you need to create a file with name of the middleware, in our case `logger.js`. The path to this file would be `src/middleware/name/logger.js`.

Below is a very simple example of a middleware class file which uses the `run` method. The `run` method runs on every **Josh** method before and after provider interaction, but _does not_ modify the payload. So even if you do modify the payload here, it will not do anything internally.

**When using JavaScript**

```javascript
const { Middleware } = require('@joshdb/core');

module.exports = class extends Middleware {
	run(payload) {
		console.log(payload);
	}
};
```

**When using TypeScript**

```typescript
import { Middleware, Payload } = from '@joshdb/core';

export default class extends Middleware {
	public run(payload: Payload) {
		console.log(payload)
	}
}
```

If everything was done correctly, you should now see the `payload` be logged to the console during every **Josh** method executions.
