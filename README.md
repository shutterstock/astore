# Async-store

A store that sits on top of your DAO to save your application from making unecessary calls.

---

[![async-store](https://img.shields.io/npm/v/async-store.svg)](https://www.npmjs.com/package/async-store)
[![Node](https://img.shields.io/badge/node->%3D6.0-blue.svg)](https://nodejs.org)
[![Build Status](https://travis-ci.org/shutterstock/async-store.svg?branch=master)](https://travis-ci.org/shutterstock/async-store)
[![Dependencies Status](https://david-dm.org/shutterstock/async-store.svg)](https://david-dm.org/shutterstock/async-store)


## Install

In the intrest of keeping the process lightweight and strive for the golden **zero dependecies** standard. This module is compatible with Browsers.

`npm install async-store --save`


## Getting started

You'll need to wrap your dao object and make sure that the signature for calls include an identifier at the top level of the options paramters and in the output.

```node
const astore = require("async-store");
const usersDAO = require("../dao/users");
const usersStore = astore(usersDAO, {
  timeoutStep: 1000,
  maxTimeout: 10000,
  identifier: "id"
});

usersStore.get({ id: 123 }, "getUser")
  .then((user) => /* The user */);

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
Please note that all interactions with Shutterstock follow the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).


## Authors

[<img alt="fed135" src="https://avatars1.githubusercontent.com/u/2380281?v=4" height="120px" width="120px">](https://github.com/fed135) |
:---:|
[fed135](https://github.com/fed135)|


## License

[MIT](LICENSE) (c) 2017 Shutterstock
