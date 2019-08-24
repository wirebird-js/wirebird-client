# http-inspector

## Installation

```
npm install -D http-inspector
```

## Usage

### Logging to console

Require the library in your `server.js`:

```js
require('http-inspector/inject');
```

`http-inspector` is controlled by the following environment variables:

-   `HTTP_INSPECTOR` (default = `"0"`) - enable inspect mode
-   `HTTP_INSPECTOR_FORMAT` (default = `"pretty"`) - chose format (available options are `"pretty"` and `"curl"`)

### Logging to Monitor

TODO

### Programmatic API

TODO