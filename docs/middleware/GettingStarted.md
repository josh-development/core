# Getting Started with Middleware

## What is middleware?

Middleware are simply a class piece that has methods to run before and after providers receive payloads from **Josh**. They make it possible to implement things like [`AutoEnsure`](https://github.com/RealShadowNova/joshdb-core/blob/main/src/middlewares/CoreAutoEnsure.ts).

## File Structure

Before creating any middleware, you should have a _main_ file, we'll make this `src/main.js`.

Below is an example of what that file could look like.

```javascript
const { Josh } = require('@joshdb/core');

const josh = new Josh({ name: 'name' });
```

You'll also need to specify your _main_ file in your projects `package.json` file. This will tell **Josh** where to look for your middleware files.

```json
{
	"name": "project",
	"version": "1.0.0",
	"main": "src/main.js"
}
```

You should now create a `middlewares` folder and a sub-folder corresponding to the name of your **Josh** instance in the `src` directory. In this case _name_.

Your final file structure should look like this below.

```
node_modules/
src/
  ├── middlewares/
  │   └── name/
  └── main.js
```
