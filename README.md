# vehicle-history-provider-web
[![npm version](https://badge.fury.io/js/vehicle-history-provider-web.svg)](http://badge.fury.io/js/vehicle-history-provider-web)
[![Coverage Status](https://coveralls.io/repos/vehicle-history/npm-vehicle-history-provider-web/badge.svg?branch=master)](https://coveralls.io/r/vehicle-history/npm-vehicle-history-provider-web?branch=master)
[![Build Status](https://travis-ci.org/vehicle-history/npm-vehicle-history-provider-web.svg?branch=master)](https://travis-ci.org/vehicle-history/npm-vehicle-history-provider-web)

[![NPM](https://nodei.co/npm/vehicle-history-provider-web.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/vehicle-history-provider-web/)

Vehicle history web provider using car plate and vin number.

## Installation

Download node at [nodejs.org](http://nodejs.org) and install it, if you haven't already.

```sh
npm install vehicle-history-provider-web --save
```


## Tests

```sh
npm install
npm test
```

## Dependencies

- [html-entities](https://github.com/mdevils/node-html-entities): Faster HTML entities encode/decode library.
- [request](https://github.com/request/request): Simplified HTTP request client.
- [vehicle-history-model](https://github.com/vehicle-history/npm-vehicle-history-model): Vehicle history model.
- [winston](https://github.com/flatiron/winston): A multi-transport async logging library for Node.js
- [www-fields-parser](https://github.com/Zenedith/npm-www-fields-parser): Web page parser based on cheerio

## Dev Dependencies

- [config](https://github.com/lorenwest/node-config): Configuration control for production node deployments
- [chai](https://github.com/chaijs/chai): BDD/TDD assertion library for node.js and the browser. Test framework agnostic.
- [istanbul](https://github.com/gotwarlost/istanbul): Yet another JS code coverage tool that computes statement, line, function and branch coverage with module loader hooks to transparently add coverage when running tests. Supports all JS coverage use cases including unit tests, server side functional tests
- [mocha](https://github.com/mochajs/mocha): simple, flexible, fun test framework
- [rewire](https://github.com/jhnns/rewire): Easy dependency injection for node.js unit testing

## Changelog

[CHANGELOG](CHANGELOG.md)


## License
The MIT License (MIT)

Copyright (c) 2015 Zenedith

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.