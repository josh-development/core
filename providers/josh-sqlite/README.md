# SQLite Provider for JOSH

The SQLite provider uses better-sqlite3 for persistent storage of JOSH data.

## Installation

This provider requires building better-sqlite3 from source, so you'll need to make sure your system
is ready for that. 

### Pre-Requisites

**On Windows**:

- In an ADMIN POWERSHELL WINDOW, run `npm i -g --add-python-to-path --vs2015 --production windows-build-tools`
- In the same Admin PowerShell Window, run `npm i -g node-gyp`
- Close that admin powershell, and any command prompt or powershell used in your project (including VSCode if its terminal is open)
- Open a new, regular powershell or command prompt in your project folder

**On Linux**:
- Ensure you have the build tools and python installed. 
- On Debian, build tools are `sudo apt-get install build-essential`
- To check the python is there: `python --version` , it should be 2.x or 3.x

### Running the installer

In your project folder, assuming the above pre-requisites are followed, you should be able to just install using this command: 

```
npm i @josh-providers/sqlite
** OR **
yarn add @josh-providers/sqlite
```

## Usage

Using the sqlite provider goes as such: 

```js
const Josh = require('josh');
const JoshSQlite = require('@josh-providers/sqlite');

const db = new Josh({
  name: 'testing',
  provider: JoshSQlite,
});

db.defer.then( () => {
  console.log(`Connected, there are ${db.count} rows in the database.`);
});
```
