const Josh = require('josh');

var db = new Josh({
  provider: '@josh-providers/sqlite',
  name: 'express-example',
});

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
// get a :key in the database.
app.get('/db/:key', (req, res) => {
  db.defer.then(async () => {
    var value = await db.get(req.params.key);
    res.status(200).json({
      message: 'Here you go.',
      key: req.params.key,
      value,
    });
    return;
  });
});

// create/overwrite a :key in the database.
app.post('/db/:key', (req, res) => {
  db.defer.then(async () => {
    if (db.has(req.params.key)) {
      var oldValue = await db.get(req.params.key);
      db.set(req.params.key, req.body.value);
      res.status(302).json({
        message: 'The key already exists, so we replaced it.',
        oldValue,
        newValue: req.body.value,
        key: req.params.key,
      });
      return;
    }
    db.set(req.params.key, req.body.value);
    res.status(202).json({
      message: 'Created the key since it didn\'t exist.',
      key: req.params.key,
      value: req.body.value,
    });
    return;
  });
});
// Delete a :key from the database.
app.delete('/db/:key', (req, res) => {
  db.defer.then(async () => {
    if (!db.has(req.params.key)) {
      res.status(404).json({
        message: 'The key does not exist! Thus we didn\'t delete it!',
      });
      return;
    }
    var value = db.get(req.params.key);
    db.delete(req.params.key);
    res.status(200).json({
      message: 'Successfully deleted.',
      key: req.params.key,
      value,
    });
    return;
  });
});

app.listen(8029, () => {
  db.defer.then(() => {
    console.log('Database ready.');
  });
  console.log('App ready.\nListening at http://localhost:8029');
});
