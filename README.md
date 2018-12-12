# Roarr

[![Travis build status](http://img.shields.io/travis/gajus/roarr-cli/master.svg?style=flat-square)](https://travis-ci.org/gajus/roarr-cli)
[![Coveralls](https://img.shields.io/coveralls/gajus/roarr-cli.svg?style=flat-square)](https://coveralls.io/github/gajus/roarr-cli)
[![NPM version](http://img.shields.io/npm/v/@roarr/cli.svg?style=flat-square)](https://www.npmjs.org/package/@roarr/cli)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

Roarr CLI program provides ability to augment, filter and pretty-print [Roarr](https://github.com/gajus/roarr) logs.

* [Usage](#usage)
* [Commands](#cli-program)
  * [`augment` program](#filter-program)
  * [`filter` program](#filter-program)
  * [`pretty-print` program](#pretty-print-program)

## Usage

```bash
npm install @roarr/cli -g

```

Explore all CLI commands and options using `roarr --help`.

## Commands

### `augment` program

Roarr `augment` CLI program appends additional information to every log message prior to sending to the log aggregator, e.g.

```bash
$ echo '{"context":{"package":"raygun","namespace":"createHttpProxyServer","logLevel":40},"message":"internal SSL Server running on 0.0.0.0:59222","sequence":0,"time":1533310067405,"version":"1.0.0"}
{"context":{"package":"raygun","namespace":"createHttpProxyServer","logLevel":40},"message":"gracefully shutting down the proxy server","sequence":1,"time":1533310067438,"version":"1.0.0"}
{"context":{"package":"raygun","namespace":"createOnCloseEventHandler","logLevel":30},"message":"raygun server closed","sequence":2,"time":1533310067439,"version":"1.0.0"}
{"context":{"package":"raygun","namespace":"createOnCloseEventHandler","logLevel":30},"message":"internal SSL close","sequence":3,"time":1533310067439,"version":"1.0.0"}' | roarr augment --append-hostname true --append-instance-id true
{"context":{"package":"raygun","namespace":"createHttpProxyServer","logLevel":40,"hostname":"curiosity.local","instanceId":"01CM07A7DGAB6YV25396FD772Q"},"message":"internal SSL Server running on 0.0.0.0:59222","sequence":0,"time":1533310067405,"version":"1.0.0"}
{"context":{"package":"raygun","namespace":"createHttpProxyServer","logLevel":40,"hostname":"curiosity.local","instanceId":"01CM07A7DGAB6YV25396FD772Q"},"message":"gracefully shutting down the proxy server","sequence":1,"time":1533310067438,"version":"1.0.0"}
{"context":{"package":"raygun","namespace":"createOnCloseEventHandler","logLevel":30,"hostname":"curiosity.local","instanceId":"01CM07A7DGAB6YV25396FD772Q"},"message":"raygun server closed","sequence":2,"time":1533310067439,"version":"1.0.0"}
{"context":{"package":"raygun","namespace":"createOnCloseEventHandler","logLevel":30,"hostname":"curiosity.local","instanceId":"01CM07A7DGAB6YV25396FD772Q"},"message":"internal SSL close","sequence":3,"time":1533310067439,"version":"1.0.0"}
```

#### `augment` configuration

|Name|Description|Default|
|---|---|---|
|`append-hostname`|Includes a hostname.|`true`|
|`append-instance-id`|Generates and includes a unique instance ID.|`true`|
|`exclude-orphans`|Excludes messages that cannot be recognized as Roarr log message.|`false`|

### `filter` program

Log filtering can be done using a JSON processor such as `jq`. However, `jq` [does make it easy to ignore invalid JSON](https://github.com/stedolan/jq/issues/1547).

Roarr `filter` CLI program filters Roarr JSON messages while (optionally) passing through all the other content, e.g.

```bash
$ echo '
{"context":{"package":"raygun","namespace":"createHttpProxyServer","logLevel":40},"message":"internal SSL Server running on 0.0.0.0:59222","sequence":0,"time":1533310067405,"version":"1.0.0"}
{"context":{"package":"raygun","namespace":"createHttpProxyServer","logLevel":40},"message":"gracefully shutting down the proxy server","sequence":1,"time":1533310067438,"version":"1.0.0"}
{"context":{"package":"raygun","namespace":"createOnCloseEventHandler","logLevel":30},"message":"raygun server closed","sequence":2,"time":1533310067439,"version":"1.0.0"}
foo bar
{"foo": "bar"}
{"context":{"package":"raygun","namespace":"createOnCloseEventHandler","logLevel":30},"message":"internal SSL close","sequence":3,"time":1533310067439,"version":"1.0.0"}
' | roarr filter 'select(.context.logLevel > 30)' | roarr pretty-print
[2018-08-03T15:27:47.405Z] WARN (40) (@raygun) (#createHttpProxyServer): internal SSL Server running on 0.0.0.0:59222
[2018-08-03T15:27:47.438Z] WARN (40) (@raygun) (#createHttpProxyServer): gracefully shutting down the proxy server
foo bar
{"foo": "bar"}

```

#### `filter` configuration

|Name|Description|Default|
|---|---|---|
|`context`|Print a number of lines leading and trailing context surrounding each match.|2|
|`exclude-orphans`|Excludes messages that cannot be recognized as Roarr log message.|`false`|

### `pretty-print` program

Roarr `pretty-print` CLI program pretty-prints logs for the development purposes.

To format the logs, pipe the program output to `roarr pretty-print` program, e.g.

```bash
$ ROARR_LOG=true node index.js | roarr pretty-print

```

Provided that the `index.js` program produced an output such as:

```
{"context":{"package":"forward-proxy","namespace":"createHttpProxyServer","logLevel":30},"message":"Internal SSL Server running on localhost:62597","sequence":0,"time":1506803138704,"version":"1.0.0"}
{"context":{"package":"forward-proxy","namespace":"createRequestProcessor","logLevel":30},"message":"request start -> http://localhost:62595/","sequence":1,"time":1506803138741,"version":"1.0.0"}
{"context":{"package":"forward-proxy","namespace":"createLogInterceptor","logLevel":20,"headers":{"host":"localhost:62595","connection":"close"}},"message":"received request","sequence":2,"time":1506803138741,"version":"1.0.0"}
{"context":{"package":"forward-proxy","namespace":"createRequestProcessor","logLevel":30},"message":"request finished <- http://localhost:62595/","sequence":3,"time":1506803138749,"version":"1.0.0"}
{"context":{"package":"forward-proxy","namespace":"createLogInterceptor","logLevel":30,"method":"GET","requestHeaders":{"host":"localhost:62595","connection":"close"},"responseHeaders":{"date":"Sat, 30 Sep 2017 20:25:38 GMT","connection":"close","content-length":"7","x-forward-proxy-request-id":"2b746d92-1a8b-4f36-b3cc-5bff57dad94d","x-forward-proxy-cache-hit":"false"},"statusCode":200,"url":"http://localhost:62595/"},"message":"response","sequence":4,"time":1506803138755,"version":"1.0.0"}
{"context":{"package":"forward-proxy","namespace":"createLogInterceptor","logLevel":30,"method":"GET","requestHeaders":{"host":"localhost:62595","connection":"close"},"responseHeaders":{"date":"Sat, 30 Sep 2017 20:25:38 GMT","content-length":"7","x-forward-proxy-request-id":"2b746d92-1a8b-4f36-b3cc-5bff57dad94d","x-forward-proxy-cache-hit":"true"},"statusCode":200,"url":"http://localhost:62595/"},"message":"response","sequence":5,"time":1506803138762,"version":"1.0.0"}

```

`roarr pretty-print` CLI program will format the output to look like this:

![CLI output demo](./.README/cli-output-demo.png)

* `@` prefixed value denotes the name of the package.
* `#` prefixed value denotes the namespace.

The `roarr pretty-print` CLI program is using the context property names suggested in the [conventions](#conventions) to pretty-print the logs for the developer inspection purposes.

#### `pretty-print` configuration

|Name|Description|Default|
|---|---|---|
|`context`|Print a number of lines leading and trailing context surrounding each match.|2|
|`exclude-orphans`|Excludes messages that cannot be recognized as Roarr log message.|`false`|
|`include-context`|Includes message context payload.|`true`|
