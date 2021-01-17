<a name="Josh"></a>

## Josh
**Kind**: global class  

* [Josh](#Josh)
    * [new Josh([options])](#new-josh-options)
    * _instance_
        * [.keys](#Josh+keys) ⇒ <code>Promise.&lt;Array.String&gt;</code>
        * [.values](#Josh+values) ⇒ <code>Promise.&lt;Array&gt;</code>
        * [.size](#Josh+size) ⇒ <code>Promise.&lt;number&gt;</code>
        * [.get(keyOrPath)](#Josh+get) ⇒ <code>Promise.&lt;\*&gt;</code>
        * [.getMany(keys)](#Josh+getMany) ⇒ <code>Promise.&lt;Object&gt;</code>
        * [.random(count)](#Josh+random) ⇒ <code>Promise.&lt;Object&gt;</code>
        * [.randomKey(count)](#Josh+randomKey) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
        * [.has(keyOrPath)](#Josh+has) ⇒ <code>Promise.&lt;boolean&gt;</code>
        * [.set(keyOrPath, value)](#Josh+set) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
        * [.setMany(data, overwrite)](#Josh+setMany) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
        * [.update(keyOrPath, input)](#Josh+update) ⇒ <code>Promise.&lt;Object&gt;</code>
        * [.ensure(keyOrPath, defaultValue)](#Josh+ensure) ⇒ <code>Promise.&lt;\*&gt;</code>
        * [.delete(keyOrPath)](#Josh+delete) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
        * [.push(keyOrPath, value, allowDupes)](#Josh+push) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
        * [.remove(keyOrPath, value)](#Josh+remove) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
        * [.inc(keyOrPath)](#Josh+inc) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
        * [.dec(keyOrPath)](#Josh+dec) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
        * [.find(pathOrFn, predicate)](#Josh+find) ⇒ <code>Promise.&lt;Object&gt;</code>
        * [.filter(pathOrFn, predicate)](#Josh+filter) ⇒ <code>Promise.&lt;Object&gt;</code>
        * [.map(pathOrFn)](#Josh+map) ⇒ <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code>
        * [.includes(keyOrPath, value)](#Josh+includes) ⇒ <code>boolean</code>
        * [.some(pathOrFn, value)](#Josh+some) ⇒ <code>boolean</code>
        * [.every(pathOrFn, value)](#Josh+every) ⇒ <code>boolean</code>
        * [.math(keyOrPath, operation, operand, path)](#Josh+math) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
        * [.autoId()](#Josh+autoId) ⇒ <code>Promise.&lt;string&gt;</code>
        * [.import(data, overwrite, clear)](#Josh+import) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
        * [.export()](#Josh+export) ⇒ <code>Promise.&lt;string&gt;</code>
    * _static_
        * [.multi(names, options)](#Josh.multi) ⇒ <code>Array.&lt;Map&gt;</code>

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
const Josh = require("@joshdb/core");
const provider = require("@joshdb/sqlite");

// sqlite-based database, with default options
const sqliteDB = new Josh({
  name: 'mydatabase',
  provider,
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

### josh.size ⇒ <code>Promise.&lt;number&gt;</code>
Get the amount of rows inside the database.

**Kind**: instance property of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;number&gt;</code> - An integer equal to the amount of stored key/value pairs.  
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

### josh.getMany(keys) ⇒ <code>Promise.&lt;Object&gt;</code>
Retrieve many values from the database.
If you provide `josh.all` as a value (josh being your variable for the database), the entire data set is returned.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - An object with one or many key/value pairs where the property name is the key and the property value is the database value.  

| Param | Type | Description |
| --- | --- | --- |
| keys | <code>Array.&lt;string&gt;</code> \| <code>symbol</code> | An array of keys to return, or `db.all` to retrieve them all. |

<a name="Josh+random"></a>

### josh.random(count) ⇒ <code>Promise.&lt;Object&gt;</code>
Returns one or more random values from the database.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - An array of key/value pairs each in their own array.
The array of values should never contain duplicates. If the requested count is higher than the number
of rows in the database, only the available number of rows will be returned, in randomized order.
Each array element is comprised of the key and value: // TODO : FIX [['a', 1], ['b', 2], ['c', 3]]  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>number</code> | Defaults to 1. The number of random key/value pairs to get. |

<a name="Josh+randomKey"></a>

### josh.randomKey(count) ⇒ <code>Promise.&lt;Array.&lt;string&gt;&gt;</code>
Returns one or more random keys from the database.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;Array.&lt;string&gt;&gt;</code> - An array of string keys in a randomized order.
The array of keys should never contain duplicates. If the requested count is higher than the number
of rows in the database, only the available number of rows will be returned.  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>number</code> | Defaults to 1. The number of random key/value pairs to get. |

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

<a name="Josh+setMany"></a>

### josh.setMany(data, overwrite) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
Store many values at once in the database. DOES NOT SUPPORT PATHS. Or autoId.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: [<code>Promise.&lt;Josh&gt;</code>](#Josh) - This database wrapper, useful if you want to chain more instructions for Josh.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | The data to insert. Must be an object as key/value pairs. |
| overwrite | <code>boolean</code> | Whether to overwrite existing keys. Since this method does not support paths, existin data will be lost. |

**Example**  
```js
josh.setMany({
  "thinga": "majig",
  "foo": "bar",
  "isCool": true
});
```
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
josh.update('thing', {
  a: 'one',
  d: 4
});
// value is now {a: 'one', b: 2, c: 3, d: 4}

josh.update('thing', (previousValue) => {
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
| keyOrPath | <code>string</code> \| <code>symbol</code> \| <code>Array.&lt;string&gt;</code> | Either a key, or full path, of the value you want to delete. If providing a path, only the value located at the path is deleted. If providing an array, will delete all keys in that array (does not support paths) Alternatively: josh.delete(josh.all) will clear the database of all data. |

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

<a name="Josh+find"></a>

### josh.find(pathOrFn, predicate) ⇒ <code>Promise.&lt;Object&gt;</code>
Finds a value within the database, either through an exact value match, or a function.
Useful for Objects and Array values, will not work on "simple" values like strings.
Returns the first found match - if you need more than one result, use filter() instead.
Either a function OR a value **must** be provided.
Note that using functions here currently is very inefficient, so it's suggested to use paths whenever necesary.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Returns an array composed of the full value (NOT the one at the path!), and the key.  

| Param | Type | Description |
| --- | --- | --- |
| pathOrFn | <code>function</code> \| <code>string</code> | Mandatory. Either a function, or the path in which to find the value. If using a function: it will run on either the stored value, OR the value at the path given if it's provided. - The function receives the value (or value at the path) as well the the key currently being checked. - The function must return a boolean or truthy/falsey value! Oh and the function can be async, too ;) If using a path: - A "value" predicate is mandatory when checking by path. - The value must be simple: string, boolean, integer. It cannot be an object or array. |
| predicate | <code>string</code> | Optional on functions, Mandatory on path finds. If provided, the function or value acts on what's at that path. |

**Example**  
```js
// Assuming:
josh.set("john.shmidt", {
  fullName: "John Jacob Jingleheimer Schmidt",
  id: 12345,
  user: {
    username: "john.shmidt",
    firstName: "john",
    lastName: "shmidt",
    password: "somerandombcryptstringthingy",
    lastAccess: -22063545000,
    isActive: false,
    avatar: null,
  }
});

// Regular string find:
josh.find("user.firstName", "john")

// Simple function find:
josh.find(value => value.user.firstName === "john");

// Function find with a path:
josh.find(value => value === "john", "user.firstName");

// The return of all the above if the same:
{
  "john.shmidt": {
    fullName: "John Jacob Jingleheimer Schmidt",
    id: 12345,
    user: {
      username: "john.shmidt",
      firstName: "john",
      lastName: "shmidt",
      password: "somerandombcryptstringthingy",
      lastAccess: -22063545000,
      isActive: false,
      avatar: null,
    }
  }
}
```
<a name="Josh+filter"></a>

### josh.filter(pathOrFn, predicate) ⇒ <code>Promise.&lt;Object&gt;</code>
Filters for values within the database, either through an exact value match, or a function.
Useful for Objects and Array values, will not work on "simple" values like strings.
Returns all matches found - if you need a single value, use find() instead.
Either a function OR a value **must** be provided.
Note that using functions here currently is very inefficient, so it's suggested to use paths whenever necesary.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - Returns an array of key/value pair(s) that successfully passes the provided function.  

| Param | Type | Description |
| --- | --- | --- |
| pathOrFn | <code>function</code> \| <code>string</code> | Mandatory. Either a function, or the path in which to find the value. If using a function: it will run on either the stored value, OR the value at the path given if it's provided. - The function receives the value (or value at the path) as well the the key currently being checked. - The function must return a boolean or truthy/falsey value! Oh and the function can be async, too ;) If using a path: - A "value" predicate is mandatory when checking by path. - The value must be simple: string, boolean, integer. It cannot be an object or array. |
| predicate | <code>string</code> | Optional on functions, Mandatory on path finds. If provided, the function or value acts on what's at that path. |

<a name="Josh+map"></a>

### josh.map(pathOrFn) ⇒ <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code>
Maps data from each value in your data. Works similarly to Array.map(), but can use both async functions, as well as paths.
Note that using functions here currently is very inefficient, so it's suggested to use paths whenever necesary.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;Array.&lt;\*&gt;&gt;</code> - An array of values mapped from the data.  

| Param | Type | Description |
| --- | --- | --- |
| pathOrFn | <code>function</code> \| <code>string</code> | Mandatory. Either a function, or the path where to get the value from. If using a path, the value at the path will be returned, or null. If using a function, the function is run on the entire value (no path is used). The function is given the `key` and `value` as arguments, and the value returned will be accessible in the return array. |

<a name="Josh+includes"></a>

### josh.includes(keyOrPath, value) ⇒ <code>boolean</code>
Performs Array.includes() on a certain value. Works similarly to
[Array.includes()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes).

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>boolean</code> - Whether the value is included in the array.  

| Param | Type | Description |
| --- | --- | --- |
| keyOrPath | <code>string</code> | Either a key, or full path, to the array you want to check for the value. The value must be an array. |
| value | <code>\*</code> | Either the value to check in the array, or a function to determine the presence of the value. If using a value, note that this won't work if the value you're checking for is an array or object - use a function for that. If using a function, the function takes in the value and index, and must return a boolean true when the value is the one you want. |

**Example**  
```js
josh.set('arr', ['a', 'b', 1, 2, { foo: "bar"}]);

josh.includes('arr', 'a'); // true
josh.includes('arr', 1) // true
josh.includes('arr', val => val.foo === 'bar'); // true
```
<a name="Josh+some"></a>

### josh.some(pathOrFn, value) ⇒ <code>boolean</code>
Checks whether *at least one key* contains the expected value. The loop stops once the value is found.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>boolean</code> - Whether the value was found or not (if one of the rows in the database match the value at path, or the function has returned true)  

| Param | Type | Description |
| --- | --- | --- |
| pathOrFn | <code>string</code> | Either a function, or the full path to the value to check against the provided value. If using a path, the value at he path will be compared to the value provided as a second argument. If using a function, the function is given the *full* value for each key, along with the key itself, for each row in the database. It should return `true` if your match is found. |
| value | <code>string</code> \| <code>number</code> \| <code>boolean</code> \| <code>null</code> | The value to be checked at each path. Cannot be an object or array (use a function for those). Ignored if a function is provided. |

<a name="Josh+every"></a>

### josh.every(pathOrFn, value) ⇒ <code>boolean</code>
Checks whether *every single key* contains the expected value. Identical to josh.some() except all must match except just one.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>boolean</code> - Whether the value was found or not, on ever single row.  

| Param | Type | Description |
| --- | --- | --- |
| pathOrFn | <code>\*</code> | Either a function, or the full path to the value to check against the provided value. If using a path, the value at he path will be compared to the value provided as a second argument. If using a function, the function is given the *full* value for each key, along with the key itself, for each row in the database. It should return `true` if your match is found. |
| value | <code>string</code> \| <code>number</code> \| <code>boolean</code> \| <code>null</code> | The value to be checked at each path. Cannot be an object or array (use a function for those). |

<a name="Josh+math"></a>

### josh.math(keyOrPath, operation, operand, path) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
Executes a mathematical operation on a value and saves the result in the database.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: [<code>Promise.&lt;Josh&gt;</code>](#Josh) - This database wrapper, useful if you want to chain more instructions for Josh.  

| Param | Type | Description |
| --- | --- | --- |
| keyOrPath | <code>string</code> | Either a key, or full path, to the numerical value you want to exceute math on. Must be an Number value. |
| operation | <code>string</code> | Which mathematical operation to execute. Supports most math ops: =, -, *, /, %, ^, and english spelling of those operations. |
| operand | <code>number</code> | The right operand of the operation. |
| path | <code>string</code> | Optional. The property path to execute the operation on, if the value is an object or array. |

**Example**  
```js
// Assuming
josh.set("number", 42);
josh.set("numberInObject", {sub: { anInt: 5 }});

josh.math("number", "/", 2); // 21
josh.math("number", "add", 5); // 26
josh.math("number", "modulo", 3); // 2
josh.math("numberInObject.sub.anInt", "+", 10); // 15
```
<a name="Josh+autoId"></a>

### josh.autoId() ⇒ <code>Promise.&lt;string&gt;</code>
Get an automatic ID for insertion of a new record.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;string&gt;</code> - A unique ID to insert data.  
**Example**  
```js
const Josh = require("@joshdb/core");
const provider = require("@joshdb/sqlite");


const sqliteDB = new Josh({
  name: 'mydatabase',
  provider,
});
(async() => {
  const newId = await sqliteDB.autoId();
  console.log("Inserting new row with ID: ", newID);
  sqliteDB.set(newId, "This is a new test value");
})();
```
<a name="Josh+import"></a>

### josh.import(data, overwrite, clear) ⇒ [<code>Promise.&lt;Josh&gt;</code>](#Josh)
Import an existing json export from josh or enmap. This data must have been exported from josh or enmap,
and must be from a version that's equivalent or lower than where you're importing it.

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: [<code>Promise.&lt;Josh&gt;</code>](#Josh) - This database wrapper, useful if you want to chain more instructions for Josh.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>string</code> |  | The data to import to Josh. Must contain all the required fields provided by export() |
| overwrite | <code>boolean</code> | <code>true</code> | Defaults to `true`. Whether to overwrite existing key/value data with incoming imported data |
| clear | <code>boolean</code> | <code>false</code> | Defaults to `false`. Whether to clear the enmap of all data before importing (**__WARNING__**: Any exiting data will be lost! This cannot be undone.) |

<a name="Josh+export"></a>

### josh.export() ⇒ <code>Promise.&lt;string&gt;</code>
Exports your entire database in JSON format. Useable as import data for both Josh and Enmap.
***WARNING: This currently requires loading the entire database in memory to write to JSON and might fail on large datasets (more than 1Gb)***

**Kind**: instance method of [<code>Josh</code>](#josh)  
**Returns**: <code>Promise.&lt;string&gt;</code> - A JSON string that can be saved wherever you need it.  
**Example**  
```js
const fs = require("fs");
josh.export().then(data => fs.writeFileSync("./export.json"), data));
```
<a name="Josh.multi"></a>

### Josh.multi(names, options) ⇒ <code>Array.&lt;Map&gt;</code>
Initialize multiple Josh instances easily. Used to simplify the creation of many tables

**Kind**: static method of [<code>Josh</code>](#josh)  
**Returns**: <code>Array.&lt;Map&gt;</code> - An array of initialized Josh instances.  

| Param | Type | Description |
| --- | --- | --- |
| names | <code>Array.&lt;string&gt;</code> | Array of strings. Each array entry will create a separate josh with that name. |
| options | <code>Object</code> | Options object to pass to each josh, excluding the name.. |

**Example**  
```js
// Using local variables.
const Josh = require('josh');
const provider = require("@joshdb/sqlite");
const { settings, tags, blacklist } = Josh.multi(['settings', 'tags', 'blacklist'], { provider });

// Attaching to an existing object (for instance some API's client)
const Josh = require("@joshdb/core");
const provider = require("@joshdb/sqlite");
Object.assign(client, Josh.multi(["settings", "tags", "blacklist"], { provider }));
```
