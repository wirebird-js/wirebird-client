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

Specify Wirebird host and port manually:

```sh
NODE_OPTIONS="-r wirebird-client/inject" \
    WIREBIRD=ui:http://<wirebird-host>:<wirebird-port> \
    node my-script.js
```

### Without Wirebird

Log HTTP requests to the terminal:

```sh
NODE_OPTIONS="-r wirebird-client/inject" \
    WIREBIRD=pretty \
    node my-script.js
```

Log HTTP requests to the terminal as curl commands:

```sh
NODE_OPTIONS="-r wirebird-client/inject" \
    WIREBIRD=curl \
    node my-script.js
```

