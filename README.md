# Wirebird Client

## What is it?

Did you ever want to see an HTTP requests log similar to the one in Chrome DevTools — but for Node.js?

Wirebird is a DevTools/Network for Node.js. It offers a simple CLI interface and a rich [web UI](https://npmjs.com/package/wirebird).

`wirebird-client` gathers detailed information about all outgoing HTTP(S) requests a Node.js process makes. It is a library agnostic tool. It plays well with plain `http` (`https`) modules as well as with Axios, Superagent, Request, whatever else.

## Usage

### Adding to your project

First of all you should install `wirebird-client` as dependency in the project you want to inspect.

```sh
npm i -D wirebird-client
```

Then you need to change your project's sources in order to `require()` the library on the top of your main script:

```js
require('wirebird-client/inject');
```

It will patch the original Node.js `http` module so that all outgoing requests would be intercepted.

You can leave this line of code in producion, because `wirebird-client` is disabled by default.

Also, if you don't want to change the source, and you run your script using `node` command, you can change:

```sh
node my-server.js
```

to:

```sh
WIREBIRD=ui node -r 'wirebird-client/inject' my-server.js
```


In development mode, if you want to enable logging, your process should be run with `WIREBIRD` environment variable set to one of the following values:

-   `WIREBIRD=pretty` - output requests to console
-   `WIREBIRD=curl` - output requests as curl commands
-   `WIREBIRD=ui` - send requests to [Wirebird](https://npmjs.com/package/wirebird) at the default address `http://localhost:4380`
-   `WIREBIRD=ui:http://wirebird-host:1234` - send requests to [Wirebird](https://npmjs.com/package/wirebird) at the address specified

### Using `wirebird`

[Read the manual](https://npmjs.com/package/wirebird).

Install and run `wirebird`:

```sh
npm i -g wirebird

wirebird
```

Enable logging to `wirebird` by providing the following environment variable `WIREBIRD=ui`.

## Supported environments

- **Node.js** - v8.x and newer.
