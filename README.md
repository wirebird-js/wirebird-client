# Wirebird Client

## What is it?

Did you ever want to see an HTTP requests log similar to the one in Chrome DevTools — but for Node.js?

Wirebird is a DevTools/Network for Node.js. It offers a simple CLI interface and a rich [web UI](https://npmjs.com/package/wirebird).

`wirebird-client` gathers detailed information about all outgoing HTTP(S) requests a Node.js process makes. It is a library agnostic tool. It plays well with plain `http` (`https`) modules as well as with Axios, Superagent, Request, whatever else.

## Usage

### Adding to your project

First of all you should install `wirebird-client` as a development dependency in the project you want to inspect.

```sh
npm i -D wirebird-client
```

Start your server with the following command:

```sh
NODE_OPTIONS='--require "wirebird-client/inject"' WIREBIRD=ui <command to start server>
```

, where `<command to start server>` is a command which you used to start your server: `npm start`, `next start`, `gatsby develop`, `node ./index.js`, `ts-node ./index.ts`, etc

It will patch the original Node.js `http` module so that all outgoing requests would be intercepted and sent to the globally installed Wirebird.

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
