# http-inspector

## What is it?

Did you ever want to see an HTTP requests log similar to the one in Chrome DevTools — but for Node.js?

`http-inspector` is a DevTools/Network for Node.js. It offers a simple CLI interface and a rich [web UI](https://npmjs.com/package/http-inspector-ui).

`http-inspector` allows to view detailed information about all outgoing HTTP(S) requests a Node.js process makes. It is a library agnostic tool. It plays well with plain `http` (`https`) modules as well as with Axios, Superagent, Request, whatever else.

## Usage

### Adding to your project

First of all you should install `http-inspector` as development dependency in the project you want to inspect.

```sh
npm i -D http-inspector
```

Then you need to change your project's sources in order to `require()` the library on the top of your main script:

```js
require('http-inspector/inject');
```

It will patch the original Node.js `http` module so that all outgoing requests would be intercepted.

You can leave this line of code in producion, because `http-inspector` is disabled by default.

Also, if you don't want to change the source, and you run your script using `node` command, you can change:

```sh
node my-server.js
```

to:

```sh
HTTP_INSPECTOR=ui node -r 'http-inspector/inject' my-server.js
```



In development mode, if you want to enable logging, your process should be run with `HTTP_INSPECTOR` environment variable set to one of the following values:

-   `HTTP_INSPECTOR=pretty` - output requests to console
-   `HTTP_INSPECTOR=curl` - output requests as curl commands
-   `HTTP_INSPECTOR=ui` - send requests to [http-inspector-ui](https://npmjs.com/package/http-inspector-ui) at the default address `http://localhost:4380`
-   `HTTP_INSPECTOR=ui:http://http-inspector-ui-host:1234` - send requests to [http-inspector-ui](https://npmjs.com/package/http-inspector-ui) at the address specified

### Using `http-inspector-ui`

[Read the manual](https://npmjs.com/package/http-inspector-ui).

Install and run `http-inspector-ui`:

```sh
npm i -g http-inspector-ui

http-inspector-ui
```

Enable logging to `http-inspector-ui` by providing the following environment variable `HTTP_INSPECTOR=ui`.
