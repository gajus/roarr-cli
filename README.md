# Roarr

[![Travis build status](http://img.shields.io/travis/gajus/roarr-cli/master.svg?style=flat-square)](https://travis-ci.org/gajus/roarr-cli)
[![Coveralls](https://img.shields.io/coveralls/gajus/roarr-cli.svg?style=flat-square)](https://coveralls.io/github/gajus/roarr-cli)
[![NPM version](http://img.shields.io/npm/v/@roarr/cli.svg?style=flat-square)](https://www.npmjs.org/package/@roarr/cli)
[![Canonical Code Style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)
[![Twitter Follow](https://img.shields.io/twitter/follow/kuizinas.svg?style=social&label=Follow)](https://twitter.com/kuizinas)

Roarr CLI program provides ability to filter and pretty-print [Roarr](https://github.com/gajus/roarr) logs.

* [Usage](#usage)
  * [Filtering logs](#filtering-logs)
  * [Formatting logs](#formatting-logs)

## Usage

```bash
$ npm install @roarr/cli -g
$ roarr --help
Options:
  --version                  Show version number                       [boolean]
  --exclude-alien            Excludes messages that cannot be recognized as
                             Roarr log message.       [boolean] [default: false]
  --filter-expression, --fe  Roarr message filter expression.
  --head                     When filtering, print a number of lines leading the
                             match.                        [number] [default: 2]
  --lag                      When filtering, print a number of lines trailing
                             the match.                    [number] [default: 2]
  --output-format                [choices: "pretty", "json"] [default: "pretty"]
  --use-colors               Toggle use of colors in the output.
                                                       [boolean] [default: true]
  --help                     Show help                                 [boolean]

```

### Filtering logs

Use `--filter-expression` option to filter Roarr messages, e.g.

```bash
$ echo '
{"context":{"package":"raygun","namespace":"createHttpProxyServer","logLevel":40},"message":"internal SSL Server running on 0.0.0.0:59222","sequence":0,"time":1533310067405,"version":"1.0.0"}
{"context":{"package":"raygun","namespace":"createHttpProxyServer","logLevel":40},"message":"gracefully shutting down the proxy server","sequence":1,"time":1533310067438,"version":"1.0.0"}
{"context":{"package":"raygun","namespace":"createOnCloseEventHandler","logLevel":30},"message":"raygun server closed","sequence":2,"time":1533310067439,"version":"1.0.0"}
{"foo": "bar"}
{"context":{"package":"raygun","namespace":"createOnCloseEventHandler","logLevel":30},"message":"internal SSL close","sequence":3,"time":1533310067439,"version":"1.0.0"}
' | roarr --filter-expression '{"context.logLevel":{gt:30}}'
[2018-08-03T15:27:47.405Z] WARN (40) (@raygun) (#createHttpProxyServer): internal SSL Server running on 0.0.0.0:59222
[2018-08-03T15:27:47.438Z] WARN (40) (@raygun) (#createHttpProxyServer): gracefully shutting down the proxy server
{"foo": "bar"}

```

Refer to [`searchjs`](https://github.com/deitch/searchjs) for search API documentation.

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
