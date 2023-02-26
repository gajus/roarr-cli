# Roarr

[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

A CLI program for processing [Roarr](https://github.com/gajus/roarr) logs.

* [Usage](#usage)
  * [Filtering logs](#filtering-logs)
  * [Formatting logs](#formatting-logs)
* [`.roarr.js`](#roarr-configuration-file)

## Usage

Install `@roarr/cli` and inspect all available options using `roarr --help`.

### Filtering logs

Use `--filter` option to filter Roarr messages, e.g.

```bash
$ echo '
{"context":{"program":"foo","package":"bar","namespace":"baz","logLevel":20},"message":"a","sequence":0,"time":1533310067405,"version":"2.0.0"}
{"context":{"program":"foo","package":"bar","namespace":"baz","logLevel":30},"message":"b","sequence":1,"time":1533310067438,"version":"2.0.0"}
{"context":{"program":"foo","package":"bar","namespace":"baz","logLevel":40},"message":"c","sequence":2,"time":1533310067439,"version":"2.0.0"}
{"context":{"program":"foo","package":"bar","namespace":"baz","logLevel":10},"message":"d","sequence":3,"time":1533310067445,"version":"2.0.0"}
{"context":{"program":"foo","package":"bar","namespace":"baz","logLevel":30},"message":"e","sequence":4,"time":1533310067459,"version":"2.0.0"}
{"context":{"program":"foo","package":"bar","namespace":"baz","logLevel":40},"message":"f","sequence":5,"time":1533310067473,"version":"2.0.0"}
' | roarr --filter 'context.logLevel:>20'
[15:27:47.438]       info  @bar %foo #baz: b
[15:27:47.439]   1ms warn  @bar %foo #baz: c
[15:27:47.459]  20ms info  @bar %foo #baz: e
[15:27:47.473]  14ms warn  @bar %foo #baz: f
```

Refer to [`Liqe`](https://github.com/gajus/liqe) documentation for query syntax.

### Formatting logs

Use `--format-output pretty` option (default) to pretty-print logs.

To format the logs, pipe the program output to `roarr` program, e.g.

```bash
$ ROARR_LOG=true node index.js | roarr pretty-print
```

Provided that the `index.js` program produced an output such as:

```json
{"context":{"program":"foo","package":"bar","namespace":"baz","logLevel":20},"message":"a","sequence":0,"time":1533310067405,"version":"2.0.0"}
{"context":{"program":"foo","package":"bar","namespace":"baz","logLevel":30},"message":"b","sequence":1,"time":1533310067438,"version":"2.0.0"}
{"context":{"program":"foo","package":"bar","namespace":"baz","logLevel":40},"message":"c","sequence":2,"time":1533310067439,"version":"2.0.0"}
{"context":{"program":"foo","package":"bar","namespace":"baz","logLevel":10},"message":"d","sequence":3,"time":1533310067445,"version":"2.0.0"}
{"context":{"program":"foo","package":"bar","namespace":"baz","logLevel":30},"message":"e","sequence":4,"time":1533310067459,"version":"2.0.0"}
{"context":{"program":"foo","package":"bar","namespace":"baz","logLevel":40},"message":"f","sequence":5,"time":1533310067473,"version":"2.0.0"}
```

`roarr` CLI program will format the output to look like this:

```yaml
[15:27:47.405]       debug @bar %foo #baz: a
[15:27:47.438]  33ms info  @bar %foo #baz: b
[15:27:47.439]   1ms warn  @bar %foo #baz: c
[15:27:47.445]   6ms trace @bar %foo #baz: d
[15:27:47.459]  14ms info  @bar %foo #baz: e
[15:27:47.473]  14ms warn  @bar %foo #baz: f
```

The "pretty" format relies on logs using the context property names suggested in the [conventions](#conventions):

* `@` prefixed value denotes the name of the `package`.
* `%` prefixed value denotes the name of the `program`.
* `#` prefixed value denotes the `namespace`.

## Roarr configuration file

Roarr will traverse upwards the current working directory searching for `.roarr.js`.

`.roarr.js` is a JavaScript file that exports an object that defines properties used to configure Roarr, e.g.

```js
/** @type {import("@roarr/cli").RoarrConfiguration} */
module.exports = {
  /**
   * Receives Roarr message object and determines if to keep the log.
   */
  filter: (message) => {
    return message.context && message.context.logLevel > 20;
  },
  /**
   * List of properties (identified using dot notation) to exclude from the log message. 
   */
  omit: ['context.namespace']
};
```