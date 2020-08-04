# Express Example.

This is a basic example of using Josh alongside express, to run it, use the command:

`npm start`

This will install all the packages and start a express server on [https://localhost:8029](https://localhost:8029)

Methods you can use:

### GET - /db/:key

With :key being the key you want to get.

### POST - /db/:key

With :key being the key you want to set.

And with the body:

```json
{
  "value": 
}
```

With value being the value to set.

### DELETE - /db/:key

With :key being the key you want to delete.