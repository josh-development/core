These things are tentative. If they get posted to github, ***__DO NOT USE THEM__***

I mean, these are just me doing "docs-driven-development" by dumping the shit I wanna do in a markdown file, okay?

## Observables

Observables are objects you can *get* from the database, and edit directly without having to save them back manually.
This works through a background function that watches the value and is aware when it changed and saves it in the database.

Caveat: Observables will consume a little bit of memory on their own - many observables may consume more than you intend. Additionally, 
  observables keep the data loaded into memory, and may cause memory leaks if misused. (To be verified)

### observe
```js
const value = db.observe('myKey');
value.thing = "blah";
```

Observables should only be applied to full keys, and cannot be used on paths.

## Serializer/Deserializer

So, JOSH can't save "complex" objects to the database, right? Only simple JSON.stringify()able data. So, what if you have a class instance? 
Like, you bot users, you want to save a channel and a message and an "entire guild" in JOSH? *_WELL YOU CAN'T_*. Except you can. Because serialization is a thing. The idea behind this is : "run this function before saving to the database, and when loading from the database". 

Serializers and deserializers must be attached to your instance before writing or reading data, otherwise they will not be applied.

### addSerializer

This creates a function that runs on your value when using set() and the serializer's name. It applies directly to the value, so it works on either a full value, or the value you assign to a prop, it doesn't care. The function is *named* which means you have to call it when setting.

```js
// "whatever needs and ID"
josh.addSerializer('generic', data => data.id);

// "some guild by ID" (the same as above, really, in this case)
josh.addSerializer('guild', data => data.id);

// I know I need 2 things to fetch a message, store both.
josh.addSerializer('message', data => ({ id: data.id, channel: data.channel.id }));

// guild including some custom guild property you want to add
josh.addSerializer('customguild', data => ({
  id: data.id,
  settings: data.settings,
  helpers: data.helper.getId() // we'll see this later in Get transforms, it's a class.
}));
```

### addDeserializer

This creates a function that runs when a value is received by get(). You don't need to specify any path, since JOSH remembers what transform it used to save the data, but you do need to provide a valid function that "reverts" the set() serializer if you want your data to remain consistent.

```js
const client = require("discord.js").Client;
const generics = require("some other thing");
const settings = new Josh('guildsettings'); // probably the wrong syntax, right? 

// "whatever needs and ID"
josh.addDeserializer('generic', data => generics.get(data.id));

// "some guild by ID" (the same as above, really, in this case)
josh.addDeserializer('guild', data => client.guilds.get(data.id));

// I know I need 2 things to fetch a message, store both.
// josh will automatically await all transforms, by the way. Just sayin'. Use async functions if you want. 
josh.addDeserializer('message', async data => client.channels.get(data.channel).fetchMessage(data.id));

// guild including some custom guild property you want to add
josh.addDeserializer('customguild', data => {
  const guild = client.guilds.get(data.id);
  guild.settings = settings.get(data.id);
  guild.helpers = new Helpers(data.id); // some class instance you wouldn't be able to store yay!
  return guild;
});
```

## Using serializers

