# Roarr

[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

Roarr CLI program provides ability to filter and pretty-print [Roarr](https://github.com/gajus/roarr) logs.

* [Usage](#usage)
  * [Viewing logs in browser](#viewing-logs-in-browser)
    * [Identifying Log Source](#identifying-log-source)
  * [Filtering logs](#filtering-logs)
  * [Formatting logs](#formatting-logs)
* [Roarr configuration file](#roarr-configuration-file)
  * [Supported Roarr configuration file properties](#supported-roarr-configuration-file-properties)

### Viewing logs in browser

Configure `--api-key` to stream logs to https://roarr.io.

```bash
export ROARR_API_KEY=00000000-0000-0000-0000-000000000000
```

View logs by opening `https://roarr.io?room=[YOUR API KEY]`.

By default, every time you run `roarr` it will generate a new stream ID and it will appear as a new source in roarr.io. However, you can configure a stable stream ID, e.g.

```bash
export ROARR_STREAM_ID=00000000-0000-0000-0000-000000000000
```

#### Identifying Log Source

By default, all `@roarr/cli` agents are assigned a random name.

Agent name is used to identify the source of logs in roarr.io UI.

You can override the random name using environment variables:

```bash
export ROARR_NAME=roarr-web-app
```

Additionally, you can assign (comma separated) tags:

```bash
export ROARR_TAGS=production,roarr-web-app
```

### Filtering logs

Use `--filter` option to filter Roarr messages, e.g.

```bash
$ echo '
{"context":{"package":"raygun","namespace":"createHttpProxyServer","logLevel":40},"message":"internal SSL Server running on 0.0.0.0:59222","sequence":0,"time":1533310067405,"version":"1.0.0"}
{"context":{"package":"raygun","namespace":"createHttpProxyServer","logLevel":40},"message":"gracefully shutting down the proxy server","sequence":1,"time":1533310067438,"version":"1.0.0"}
{"context":{"package":"raygun","namespace":"createOnCloseEventHandler","logLevel":30},"message":"raygun server closed","sequence":2,"time":1533310067439,"version":"1.0.0"}
{"foo": "bar"}
{"context":{"package":"raygun","namespace":"createOnCloseEventHandler","logLevel":30},"message":"internal SSL close","sequence":3,"time":1533310067439,"version":"1.0.0"}
' | roarr --filter 'context.logLevel:>30'
[2018-08-03T15:27:47.405Z] WARN (40) (@raygun) (#createHttpProxyServer): internal SSL Server running on 0.0.0.0:59222
[2018-08-03T15:27:47.438Z] WARN (40) (@raygun) (#createHttpProxyServer): gracefully shutting down the proxy server
{"foo": "bar"}
```

Refer to [`Liqe`](https://github.com/gajus/liqe) documentation for query syntax.

### Formatting logs

Use `--format-output pretty` option (default) to pretty-print logs.

To format the logs, pipe the program output to `roarr` program, e.g.

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

`roarr` CLI program will format the output to look like this:

![CLI output demo](./.README/cli-output-demo.png)

* `@` prefixed value denotes the name of the package.
* `#` prefixed value denotes the namespace.

The "pretty" format relies on logs using the context property names suggested in the [conventions](#conventions).

## Roarr configuration file

Roarr searches the current working directory for `.roarr.js` (or `.roarr.cjs`) file. If it cannot find the configuration file, it will traverse upwards the directory tree searching for a matching configuration file and give up on a first permission error.

`.roarr.js` is a JavaScript file that exports an object that defines properties used to configure Roarr, e.g.

```js
module.exports = {
  filterFunction: (message) => {
    return message.context && message.context.logLevel > 20;
  },
};
```

### Supported Roarr configuration file properties

|Property name|Description|
|---|---|
|`filterFunction`|A function that receives Roarr message object and returns a boolean property that determines if the log should be filtered out (`false`) or included (`true`).|
