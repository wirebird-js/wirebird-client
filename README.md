# Wirebird Client

Client library for [Wirebird](https://npmjs.com/package/wirebird) http inspection tool.

## Installation

```sh
npm install -D wirebird-client
```

or:

```sh
yarn add -D wirebird-client
```

## Usage

### With Wirebird

First, [install and run Wirebird](https://npmjs.com/package/wirebird) on your machine.

Default:

```sh
NODE_OPTIONS="-r wirebird-client/inject" \
    WIREBIRD=ui \
    node my-script.js
```

Using `wbenv` command:

```sh
wbenv ui node my-script.js
```

Specify Wirebird host and port manually:

```sh
NODE_OPTIONS="-r wirebird-client/inject" \
    WIREBIRD=ui:http://<wirebird-host>:<wirebird-port> \
    node my-script.js
```

Using `wbenv` command:

```sh
wbenv -h http://<wirebird-host>:<wirebird-port> ui node my-script.js
```

### Without Wirebird

Log HTTP requests to the terminal:

```sh
NODE_OPTIONS="-r wirebird-client/inject" \
    WIREBIRD=pretty \
    node my-script.js
```

Using `wbenv` command:

```sh
wbenv pretty node my-script.js
```

Log HTTP requests to the terminal as curl commands:

```sh
NODE_OPTIONS="-r wirebird-client/inject" \
    WIREBIRD=curl \
    node my-script.js
```

Using `wbenv` command:

```sh
wbenv curl node my-script.js
```

### Wbenv command reference

`wbenv` (**W**ire**b**ird **env**ironment) command is a shell wrapper
that is included with `wirebird-client` package, allowing to run a Node.js script
with `WIREBIRD` and `NODE_OPTIONS` variables set.

Syntax:

```sh
wbenv [-h wirebird_host] {ui|curl|pretty} <command>
```

Examples:

```sh
wbenv ui npm start                  #runs `npm start` logging HTTP requests with Wirebird
wbenv ui yarn add -D @types/react   #runs `yarn add -D @types/react` logging HTTP requests with Wirebird (cool, eh?)
wbenv -h http://192.168.88.1:4380 ui node app.js
                                    #runs `node app.js` logging HTTP requests with Wirebird running on http://192.168.88.1:4380
wbenv curl zapier push              #runs `zapier push` logging HTTP requests to terminal as Curl commands
```