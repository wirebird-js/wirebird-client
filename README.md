# http-inspector

## Installation

```
npm install -D http-inspector
```

## Usage

### Adding to your project

First of all you should install `http-inspector` as development dependency in the project you want to inspect.

```sh
npm i -D http-inspector
```

Then you need to require the library on the top of your main script:

```js
require('http-inspector/inject');
```

It will patch the original Node.js `http` module so that all outgoing requests would be intercepted.

You can leave this code in producion, because `http-inspector` is disabled by default.

In development mode, if you want to enable logging, your process should be run with `HTTP_INSPECTOR` environment variable set to one of the following values:

-   `HTTP_HTTP_INSPECTOR=pretty` - output requests to console
-   `HTTP_HTTP_INSPECTOR=curl` - output requests as curl commands
-   `HTTP_HTTP_INSPECTOR=ui` - send requests to [http-inspector-ui](https://npmjs.com/package/http-inspector-ui) at the default address `http://localhost:4380`
-   `HTTP_HTTP_INSPECTOR=ui:http://http-inspector-ui-host:1234` - send requests to [http-inspector-ui](https://npmjs.com/package/http-inspector-ui) at the address specified

### Using `http-inspector-ui`

[Read the manual](https://npmjs.com/package/http-inspector-ui).

Install and run `http-inspector-ui`:

```sh
npm i -g http-inspector-ui

http-inspector-ui
```

Enable logging to `http-inspector-ui` by providing the following environment variable `HTTP_HTTP_INSPECTOR=ui`.
