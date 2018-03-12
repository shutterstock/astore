# Astore

A store that sits on top of your DAO to save your application from making unecessary calls.

---

[![astore](https://img.shields.io/npm/v/astore.svg)](https://www.npmjs.com/package/astore)
[![Node](https://img.shields.io/badge/node->%3D8.0-blue.svg)](https://nodejs.org)
[![Build Status](https://travis-ci.org/shutterstock/astore.svg?branch=master)](https://travis-ci.org/shutterstock/astore)
[![Dependencies Status](https://david-dm.org/shutterstock/astore.svg)](https://david-dm.org/shutterstock/astore)


## Install

This module has **zero dependecies**.

This module is compatible with Browsers.

`npm install astore --save`


## Context

When communicating with data services or databases, it is very common to include some form of caching layer in front of it. Unfortunatly, cache hit rates are not always optimal. Some resources run very hot and could even be requested multiple times concurrently.

This module is a light wrapper for your data-access object. Provided it's methods accept a single option parameter and return Promises. `astore` will make sure that no two same requests are made simultaneously.


DAO Example:

```node
function getUser(options) {
  // Make some db call
  return new Promise((resolve, reject) => {
    db.execute('SELECT * from users WHERE id = ?', [options.id], (rows) => {
      if (!rows || !rows.length) return reject();
      resolve(rows[0]);
    });
  });
}

//...
```

## Getting started

You'll need to wrap your dao object and make sure that the signature for calls include an identifier at the top level of the options parameters and in the output.

```node
const astore = require("astore");
const usersDAO = require("../dao/users");
const usersStore = astore(usersDAO, {
  timeoutStep: 1000, // Subsequent requests for the same entity will extend the caching for <timeoutStep> ms.
  maxTimeout: 10000, // This is the maximum caching period for a given entity in ms.
  identifier: "id",   // If the identifier portion of your entity is not labeled "id", you can define it here.
  storageKey: (id, opts) => `${opts.category}.${id}` // The method for assigning unique keys for store entries.
});

/**
 * Get a single entity
 * The first argument represents the arguments that you would normally pass to your DAO.
 * The second is the DOA method to call. Make sure that the reply from the DAO is a single cacheable entity.
 */
usersStore.get({ id: 123 }, "getUser")
  .then((user) => /* The user */);
  
/**
 * Get a list of entities
 * This leverages pre-flight store optimizations by running the actual DAO calls individually.
 * Otherwise, you could use the post-call caching provided with the `search` function.
 */
userStore.getList({ ids: [123, 456, 789] }, "getUser")
  .then((users) => /* The list of users */);
  
userStore.search({ ids: [123, 456, 789] }, "getList")
  .then((users) => /* The list of users */);

/**
 * Skip store features
 * For any sensitive or user-specific data, it is NOT recommended to use storing.
 * To bypass the store, you can use the `direct` method.
 */
userStore.list({ ids: [123, 456, 789] }, "getUser")
  .then((users) => /* The list of users */);

```

The promise handle as well as the response value will be cached for some time.
This is configurable via the timeoutStep value. If other queries are made for that specific identifier, the caching period is extended by the timeoutStep, up to maxTimeout.


The search method first makes the call, then caches the individual entities with the same rules as a single get. You can therefore wrap search methods or list methods alike.


## Tests

`npm test`


## Contributing

Pull requests are always welcome! Please follow a few guidelines:

Add a unit test or two to cover the proposed changes
Do as the Romans do and stick with existing whitespace and formatting conventions (i.e., spaces instead of tabs, etc)
Please note that all interactions with Shutterstock follow the [Contributor Covenant Code of Conduct](https://github.com/shutterstock/welcome/blob/master/CODE_OF_CONDUCT.md).

Make sure that you also follow the [Contributing Guidelines](https://github.com/shutterstock/welcome/blob/master/CONTRIBUTING.md).


## License

[MIT](LICENSE) (c) 2017 Shutterstock
