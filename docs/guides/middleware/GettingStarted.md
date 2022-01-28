# Getting Started with Middleware

## What is middleware?

Middleware are simply a class that has methods to run before and after providers receive payloads from **Josh**. They make it possible to implement things like [`AutoEnsure`](https://github.com/josh-development/core/blob/main/src/middlewares/CoreAutoEnsure.ts).

## File Structure

Before creating any middleware, you should have a _main_ file, we'll make this `src/main.js`.

Below is an example of what that file could look like.

```javascript
const { Josh } = require('@joshdb/core');

const josh = new Josh({ name: 'name' });
```

## Using middleware

To start taking advantage of middlewares you can simply utilize the `Josh#use()` method. This method takes a single parameter being your middleware class. Below is an example.

```javascript
josh.use(new MyMiddleware());
```
