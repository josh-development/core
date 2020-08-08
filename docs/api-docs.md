<a name="Josh"></a>

## Josh
**Kind**: global class  

* [Josh](#Josh)
    * [new Josh([options])](#new-josh-options)
    * [.keys](#josh-keys-promise-less-than-array-string-greater-than) ⇒ <code>Promise.&lt;Array.String&gt;</code>
    * [.values](#josh-values-promise-less-than-array-greater-than) ⇒ <code>Promise.&lt;Array&gt;</code>
    * [.size](#josh-size-promise-less-than-integer-greater-than) ⇒ <code>Promise.&lt;integer&gt;</code>
    * [.get(keyOrPath)](#josh-get-keyorpath-promise-less-than-greater-than) ⇒ <code>Promise.&lt;\*&gt;</code>
    * [.getMany(keysOrPaths)](#josh-getmany-keysorpaths-promise-less-than-array-less-than-array-greater-than-greater-than) ⇒ <code>Promise.&lt;Array.&lt;Array&gt;&gt;</code>
    * [.random(count)](#josh-random-count-promise-less-than-array-less-than-array-greater-than-greater-than) ⇒ <code>Promise.&lt;Array.&lt;Array&gt;&gt;</code>
    * [.randomKey(count)](#josh-randomkey-count-promise-less-than-array-less-than-string-greater-than-greater-than) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
    * [.has(keyOrPath)](#josh-has-keyorpath-promise-less-than-boolean-greater-than) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.set(keyOrPath, value)](#josh-set-keyorpath-value-promise-less-than-josh-greater-than) ⇒ [<code>Promise.&lt;Josh&gt;</code>]
    * [.update(keyOrPath, input)](#josh-update-keyorpath-input-promise-less-than-object-greater-than) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [.ensure(keyOrPath, defaultValue)](#josh-ensure-keyorpath-defaultvalue-promise-less-than-greater-than) ⇒ <code>Promise.&lt;\*&gt;</code>
    * [.delete(keyOrPath)](#josh-delete-keyorpath-promise-less-than-josh-greater-than) ⇒ [<code>Promise.&lt;Josh&gt;</code>]
    * [.push(keyOrPath, value, allowDupes)](#josh-push-keyorpath-value-allowdupes-promise-less-than-josh-greater-than) ⇒ [<code>Promise.&lt;Josh&gt;</code>]
    * [.remove(keyOrPath, value)](#josh-remove-keyorpath-value-promise-less-than-josh-greater-than) ⇒ [<code>Promise.&lt;Josh&gt;</code>]
    * [.inc(keyOrPath)](#josh-inc-keyorpath-promise-less-than-josh-greater-than) ⇒ [<code>Promise.&lt;Josh&gt;</code>]
    * [.dec(keyOrPath)](#josh-dec-keyorpath-promise-less-than-josh-greater-than) ⇒ [<code>Promise.&lt;Josh&gt;</code>]

<a name="new_Josh_new"></a>

### new Josh([options])
Initializes a new Josh, with options.


| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Additional options an configurations. |
| [options.name] | <code>string</code> | Required. The name of the table in which to save the data. |
| [options.provider] | <code>string</code> | Required. A string with the name of the provider to use. Should not be already required, as Josh takes care of doing that for you. *Must* be a valid provider that complies with the Provider API. The provider needs to be installed separately with yarn or npm. See https://josh.evie.dev/providers for details. |
| [options.ensureProps] | <code>boolean</code> | defaults to `true`. If enabled and an inserted value is an object, using ensure() will also ensure that every property present in the default object will be added to the value, if it's absent. |
| [options.autoEnsure] | <code>\*</code> | default is disabled. When provided a value, essentially runs ensure(key, autoEnsure) automatically so you don't have to. This is especially useful on get(), but will also apply on set(), and any array and object methods that interact with the database. |
| [options.serializer] | <code>function</code> | Optional. If a function is provided, it will execute on the data when it is written to the database. This is generally used to convert the value into a format that can be saved in the database, such as converting a complete class instance to just its ID. This function may return the value to be saved, or a promise that resolves to that value (in other words, can be an async function). |
| [options.deserializer] | <code>function</code> | Optional. If a function is provided, it will execute on the data when it is read from the database. This is generally used to convert the value from a stored ID into a more complex object. This function may return a value, or a promise that resolves to that value (in other words, can be an async function). |

**Example**  
```js
const Josh = require("josh");

// sqlite-based database, with default options
const sqliteDB = new Josh({
  name: 'mydatabase',
  provider: '@josh-providers/sqlite',
});
```
<a name="Josh+keys"></a>

### josh.keys ⇒ <code>Promise.&lt;Array.String&gt;</code>
Get all the keys in the database.

**Kind**: instance property of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;Array.String&gt;</code> - An array of all the keys as string values.  
<a name="Josh+values"></a>

### josh.values ⇒ <code>Promise.&lt;Array&gt;</code>
Get all the values in the database.

**Kind**: instance property of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;Array&gt;</code> - An array of all the values stored in the database.  
<a name="Josh+size"></a>

### josh.size ⇒ <code>Promise.&lt;integer&gt;</code>
Get the amount of rows inside the database.

**Kind**: instance property of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;integer&gt;</code> - An integer equal to the amount of stored key/value pairs.  
<a name="Josh+get"></a>

### josh.get(keyOrPath) ⇒ <code>Promise.&lt;\*&gt;</code>
Retrieves (fetches) a value from the database. If a simple key is provided, returns the value.
If a path is provided, will only return the value at that path, if it exists.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;\*&gt;</code> - Returns the value for the key or the value found at the specified path.  

| Param | Type | Description |
| --- | --- | --- |
| keyOrPath | <code>string</code> | Either a key, or full path, of the value you want to get. For more information on how path works, see https://josh.evie.dev/path |

<a name="Josh+getMany"></a>

### josh.getMany(keysOrPaths) ⇒ <code>Promise.&lt;Array.&lt;Array&gt;&gt;</code>
Retrieve many values from the database.
If you provide `josh.all` as a value (josh being your variable for the database), the entire data set is returned.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;Array.&lt;Array&gt;&gt;</code> - An array of key/value pairs each in their own arrays.
Each array element is comprised of the key and value: [['a', 1], ['b', 2], ['c', 3]]
If paths are provided, the "key" is the full path.  

| Param | Type | Description |
| --- | --- | --- |
| keysOrPaths | <code>\*</code> | An array of keys or paths to return, or `db.all` to retrieve them all. |

<a name="Josh+random"></a>

### josh.random(count) ⇒ <code>Promise.&lt;Array.&lt;Array&gt;&gt;</code>
Returns one or more random values from the database.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;Array.&lt;Array&gt;&gt;</code> - An array of key/value pairs each in their own array.
The array of values should never contain duplicates. If the requested count is higher than the number
of rows in the database, only the available number of rows will be returned, in randomized order.
Each array element is comprised of the key and value: [['a', 1], ['b', 2], ['c', 3]]  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>integer</code> | Defaults to 1. The number of random key/value pairs to get. |

<a name="Josh+randomKey"></a>

### josh.randomKey(count) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Returns one or more random keys from the database.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - An array of string keys in a randomized order.
The array of keys should never contain duplicates. If the requested count is higher than the number
of rows in the database, only the available number of rows will be returned.  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>integer</code> | Defaults to 1. The number of random key/value pairs to get. |

<a name="Josh+has"></a>

### josh.has(keyOrPath) ⇒ <code>Promise.&lt;boolean&gt;</code>
Verifies whether a key, or a specific property of an object, exists at all.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Whether the key, or property specified in the path, exists.  

| Param | Type | Description |
| --- | --- | --- |
| keyOrPath | <code>string</code> | Either a key, or full path, of the value you want to get. For more information on how path works, see https://josh.evie.dev/path |

<a name="Josh+set"></a>

### josh.set(keyOrPath, value) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
Store a value in the database. If a simple key is provided, creates or overwrites the entire value with the new one provide.
If a path is provided, and the stored value is an object, only the value at the path will be overwritten.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: [<code>Promise.&lt;Josh&gt;</code>](#Josh) - This database wrapper, useful if you want to chain more instructions for Josh.  

| Param | Type | Description |
| --- | --- | --- |
| keyOrPath | <code>string</code> | Either a key, or a full path, where you want to store the value. For more information on how path works, see https://josh.evie.dev/path |
| value | <code>\*</code> | The value to store for the key, or in the path, specified. All values MUST be "simple" javascript values: Numbers, Booleans, Strings, Arrays, Objects. If you want to store a "complex" thing such as an instance of a class, please use a Serializer to convert it to a storable value. |

<a name="Josh+update"></a>

### josh.update(keyOrPath, input) ⇒ <code>Promise.&lt;Object&gt;</code>
Update an object in the database with modified values. Similar to set() except it does not overwrite the entire object.
Instead, the data is *merged* with the existing object. Object properties not included in your data are not touched.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - The merged object that will be stored in the database.  

| Param | Type | Description |
| --- | --- | --- |
| keyOrPath | <code>string</code> | Either a key, or full path, of the value you want to update. |
| input | <code>Object</code> \| <code>function</code> | Either the object, or a function. If a function is provided, it will receive the *current* value as an argument. You are expected to return a modified object that will be stored in the database. |

**Example**  
```js
josh.set('thing', {
  a: 1,
  b: 2,
  c: 3
});
josh.merge('thing', {
  a: 'one',
  d: 4
});
// value is now {a: 'one', b: 2, c: 3, d: 4}

josh.merge('thing', (previousValue) => {
  ...previousValue,
  b: 'two',
  e: 5,
});
// value is now {a: 'one', b: 'two', c: 3, d: 4, e: 5}
```
<a name="Josh+ensure"></a>

### josh.ensure(keyOrPath, defaultValue) ⇒ <code>Promise.&lt;\*&gt;</code>
Returns the key's value, or the default given, ensuring that the data is there.
This is a shortcut to "if josh doesn't have key, set it, then get it" which is a very common pattern.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;\*&gt;</code> - The value from the database for the key, or the default value provided for a new key.  

| Param | Type | Description |
| --- | --- | --- |
| keyOrPath | <code>string</code> | Either a key, or full path, of the value you want to ensure. |
| defaultValue | <code>\*</code> | Required. The value you want to save in the database and return as default. |

**Example**  
```js
// Simply ensure the data exists (for using property methods):
josh.ensure("mykey", {some: "value", here: "as an example"});
josh.has("mykey"); // always returns true
josh.get("mykey", "here") // returns "as an example";

// Get the default value back in a variable:
const settings = mySettings.ensure("1234567890", defaultSettings);
console.log(settings) // josh's value for "1234567890" if it exists, otherwise the defaultSettings value.
```
<a name="Josh+delete"></a>

### josh.delete(keyOrPath) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
Remove a key/value pair, or the property and value at a specific path, or clear the database.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: [<code>Promise.&lt;Josh&gt;</code>](#Josh) - This database wrapper, useful if you want to chain more instructions for Josh.  

| Param | Type | Description |
| --- | --- | --- |
| keyOrPath | <code>string</code> | Either a key, or full path, of the value you want to delete. If providing a path, only the value located at the path is deleted. Alternatively: josh.delete(josh.all) will clear the database of all data. |

<a name="Josh+push"></a>

### josh.push(keyOrPath, value, allowDupes) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
Add a new value to an array.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: [<code>Promise.&lt;Josh&gt;</code>](#Josh) - This database wrapper, useful if you want to chain more instructions for Josh.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| keyOrPath | <code>string</code> |  | Either a key, or full path, where the array where you want to add a value. |
| value | <code>\*</code> |  | The value to add to the array. |
| allowDupes | <code>boolean</code> | <code>true</code> | Whether to allow duplicate values to be added. Note that if you're pushing objects or arrays, duplicates can occur no matter what, as detecting duplicate objects is CPU-intensive. |

<a name="Josh+remove"></a>

### josh.remove(keyOrPath, value) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
Remove a value from an array, by value (simple values like strings and numbers) or function (complex values like arrays or objects).

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: [<code>Promise.&lt;Josh&gt;</code>](#Josh) - This database wrapper, useful if you want to chain more instructions for Josh.  

| Param | Type | Description |
| --- | --- | --- |
| keyOrPath | <code>\*</code> | Either a key, or full path, where the array where you want to remove from, is stored. |
| value | <code>\*</code> \| <code>function</code> | Required. The value to remove from the array. OR a function to match a value stored in the array. If using a function, the function provides the value and must return a boolean that's true for the value you want to remove. |

**Example**  
```js
// Assuming
josh.set('array', [1, 2, 3])
josh.set('objectarray', [{ a: 1, b: 2, c: 3 }, { d: 4, e: 5, f: 6 }])

josh.remove('array', 1); // value is now [2, 3]
josh.remove('objectarray', (value) => value.e === 5); // value is now [{ a: 1, b: 2, c: 3 }]
```
<a name="Josh+inc"></a>

### josh.inc(keyOrPath) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
Increments (adds 1 to the number) the stored value.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: [<code>Promise.&lt;Josh&gt;</code>](#Josh) - This database wrapper, useful if you want to chain more instructions for Josh.  

| Param | Type | Description |
| --- | --- | --- |
| keyOrPath | <code>\*</code> | Either a key, or full path, to the value you want to increment. The value must be a number. |

<a name="Josh+dec"></a>

### josh.dec(keyOrPath) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
Decrements (remove 1 from the number) the stored value.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: [<code>Promise.&lt;Josh&gt;</code>](#Josh) - This database wrapper, useful if you want to chain more instructions for Josh.  

| Param | Type | Description |
| --- | --- | --- |
| keyOrPath | <code>\*</code> | Either a key, or full path, to the value you want to decrement. The value must be a number. |

