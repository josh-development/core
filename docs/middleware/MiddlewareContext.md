# Middleware Context

## What is Middleware context?

Middleware context is information that can be used in middlewares in whatever method you want. For example it is used in [`AutoEnsure`](https://github.com/RealShadowNova/joshdb-core/blob/main/src/middlewares/CoreAutoEnsure.ts) to collect the `defaultValue`.

## Josh Options

You can add the context when initiating a new **Josh** instance in the options object under the `middlewareContextData` property object, it's keyed by middleware names.

Below we are going to give data to our middleware called `logger`.

```javascript
const josh = new Josh({
	name: 'name',
	middlewareContextData: {
		logger: {
			format: 'The method "{{method}}" has been called'
		}
	}
});
```

## Middleware Usage

Now in our middleware file we can call that context with the `getContextData` method.

**When using JavaScript**

```javascript
const { Middleware } = require('@joshdb/core');

module.exports = class extends Middleware {
	run(payload) {
		// Let's get the context data.
		const context = this.getContext();
		// Context can be undefined, so check if it exists.
		if (!context) return;
		// Use the format and log.
		console.log(format.replaceAll('{{method}}', payload.method));
	}
};
```

**When using TypeScript**

```typescript
import { Middleware, Payload } from '@joshdb/core';

export class LoggerMiddleware extends Middleware<LoggerContext> {
	public run(payload: Payload) {
		// Let's get the context data.
		const context = this.getContext();
		// Context can be undefined, so check if it exists.
		if (!context) return;
		// Use the format and log
		console.log(format.replaceAll('{{method}}', payload.method));
	}
}

export interface LoggerContext extends Middleware.Context {
	format: string;
}
```

## TypeScript Context Augmentation

To make sure your context is properly typed into the **Josh** options you'll need to use [module augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation) will be needed.

Below is an example to add context for the `LoggerMiddleware`.

```typescript
declare module '@joshdb/core' {
	interface MiddlewareContextData {
		logger: {
			format: string;
		};
	}
}
```
