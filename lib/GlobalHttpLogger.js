"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _http = _interopRequireDefault(require("http"));

var _https = _interopRequireDefault(require("https"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var matches = process.version.match(/^v(\d+)\.(\d+)\.(\d+)$/);
var nodeMajorVersion = matches ? +matches[1] : 0;

var ResponseBodyCollector =
/*#__PURE__*/
function () {
  function ResponseBodyCollector(response) {
    var _this = this;

    _classCallCheck(this, ResponseBodyCollector);

    _defineProperty(this, "buffers", void 0);

    _defineProperty(this, "bodyPromise", void 0);

    this.buffers = [];
    this.bodyPromise = new Promise(function (resolve, reject) {
      response.prependListener('data', function (chunk) {
        _this.buffers.push(chunk);
      });
      response.prependListener('end', function () {
        var body = Buffer.concat(_this.buffers);
        resolve(body);
      });
    });
  }

  _createClass(ResponseBodyCollector, [{
    key: "getBodyAsync",
    value: function getBodyAsync() {
      return this.bodyPromise;
    }
  }]);

  return ResponseBodyCollector;
}();

var waitForResponseOrError = function waitForResponseOrError(request) {
  return new Promise(function (resolve, reject) {
    request.prependOnceListener('response', function (response) {
      var responseBodyCollector = new ResponseBodyCollector(response);
      resolve({
        response: response,
        responseBodyCollector: responseBodyCollector
      });
    });
    request.prependOnceListener('error', function (error) {
      resolve({
        error: error
      });
    });
  });
};

var collectRequestBody = function collectRequestBody(request) {
  return new Promise(function (resolve, reject) {
    var requestBody = [];
    var reqWrite = request.write;

    request.write = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      /**
       * chunk can be either a string or a Buffer.
       */
      var chunk = arguments[0];

      if (Buffer.isBuffer(chunk)) {
        requestBody.push(chunk);
      } else {
        requestBody.push(Buffer.from(chunk, 'utf8'));
      }

      return reqWrite.apply(this, args);
    };

    var reqEnd = request.end;

    request.end = function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      /**
       * the first argument might be a callback or a chunk
       */
      var maybeChunk = arguments[0];

      if (Buffer.isBuffer(maybeChunk)) {
        requestBody.push(maybeChunk);
      } else if (maybeChunk && typeof maybeChunk !== 'function') {
        requestBody.push(Buffer.from(maybeChunk, 'utf8'));
      }

      return reqEnd.apply(this, args);
    };

    request.prependOnceListener('finish', function () {
      if (!requestBody.length) {
        resolve(null);
      } else {
        resolve(Buffer.concat(requestBody));
      }
    });
    request.prependOnceListener('error', function () {
      return resolve(null);
    });
  });
};

var interceptRequest =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(request, _ref) {
    var onRequestEnd, _ref3, _ref4, requestBody, _ref4$, response, responseBody, error, protocol, host, path, loggerRequest, loggerResponse, loggerError;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            onRequestEnd = _ref.onRequestEnd;
            _context2.next = 3;
            return Promise.all([collectRequestBody(request), _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee() {
              var _ref6, response, responseBodyCollector, error;

              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.next = 2;
                      return waitForResponseOrError(request);

                    case 2:
                      _ref6 = _context.sent;
                      response = _ref6.response;
                      responseBodyCollector = _ref6.responseBodyCollector;
                      error = _ref6.error;

                      if (!(response && responseBodyCollector)) {
                        _context.next = 14;
                        break;
                      }

                      _context.t0 = response;
                      _context.next = 10;
                      return responseBodyCollector.getBodyAsync();

                    case 10:
                      _context.t1 = _context.sent;
                      return _context.abrupt("return", {
                        response: _context.t0,
                        responseBody: _context.t1,
                        error: null
                      });

                    case 14:
                      if (!error) {
                        _context.next = 18;
                        break;
                      }

                      return _context.abrupt("return", {
                        response: null,
                        responseBody: null,
                        error: error
                      });

                    case 18:
                      throw new Error('No responseBodyCollector');

                    case 19:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee);
            }))()]);

          case 3:
            _ref3 = _context2.sent;
            _ref4 = _slicedToArray(_ref3, 2);
            requestBody = _ref4[0];
            _ref4$ = _ref4[1];
            response = _ref4$.response;
            responseBody = _ref4$.responseBody;
            error = _ref4$.error;
            protocol = request.agent.protocol;
            host = request.getHeader('host');
            path = request.path;
            loggerRequest = {
              url: "".concat(protocol, "//").concat(host).concat(path),
              method: request.method,
              headers: request._headers,
              body: requestBody ? requestBody : null
            };

            if (response) {
              loggerResponse = {
                status: response.statusCode,
                body: responseBody ? responseBody : null,
                headers: response.headers
              };
              onRequestEnd({
                request: loggerRequest,
                response: loggerResponse,
                error: null
              });
            } else if (error) {
              loggerError = {
                message: error.message,
                code: error.code,
                stack: error.stack || ''
              };
              onRequestEnd({
                request: loggerRequest,
                response: null,
                error: loggerError
              });
            }

          case 15:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function interceptRequest(_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}();

var GlobalHttpLogger =
/*#__PURE__*/
function () {
  function GlobalHttpLogger(_ref7) {
    var onRequestEnd = _ref7.onRequestEnd;

    _classCallCheck(this, GlobalHttpLogger);

    _defineProperty(this, "onRequestEnd", void 0);

    this.onRequestEnd = onRequestEnd;
  }

  _createClass(GlobalHttpLogger, [{
    key: "start",
    value: function start() {
      var onRequestEnd = this.onRequestEnd;

      var interceptedRequestMethod = function interceptedRequestMethod(object, func) {
        for (var _len3 = arguments.length, rest = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
          rest[_key3 - 2] = arguments[_key3];
        }

        var req = func.call.apply(func, [object].concat(rest));
        interceptRequest(req, {
          onRequestEnd: onRequestEnd
        });
        return req;
      };

      _http["default"].request = interceptedRequestMethod.bind(null, _http["default"], _http["default"].request);
      _http["default"].get = interceptedRequestMethod.bind(null, _http["default"], _http["default"].get);
      /**
       * https.request proxies to http.request for 8.x and earlier versions
       */

      if (nodeMajorVersion > 8) {
        _https["default"].get = interceptedRequestMethod.bind(null, _https["default"], _https["default"].get);
        _https["default"].request = interceptedRequestMethod.bind(null, _https["default"], _https["default"].request);
      }
    }
  }, {
    key: "stop",
    value: function stop() {}
  }]);

  return GlobalHttpLogger;
}();

exports["default"] = GlobalHttpLogger;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9HbG9iYWxIdHRwTG9nZ2VyLnRzIl0sIm5hbWVzIjpbIm1hdGNoZXMiLCJwcm9jZXNzIiwidmVyc2lvbiIsIm1hdGNoIiwibm9kZU1ham9yVmVyc2lvbiIsIlJlc3BvbnNlQm9keUNvbGxlY3RvciIsInJlc3BvbnNlIiwiYnVmZmVycyIsImJvZHlQcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJwcmVwZW5kTGlzdGVuZXIiLCJjaHVuayIsInB1c2giLCJib2R5IiwiQnVmZmVyIiwiY29uY2F0Iiwid2FpdEZvclJlc3BvbnNlT3JFcnJvciIsInJlcXVlc3QiLCJwcmVwZW5kT25jZUxpc3RlbmVyIiwicmVzcG9uc2VCb2R5Q29sbGVjdG9yIiwiZXJyb3IiLCJjb2xsZWN0UmVxdWVzdEJvZHkiLCJyZXF1ZXN0Qm9keSIsInJlcVdyaXRlIiwid3JpdGUiLCJhcmdzIiwiYXJndW1lbnRzIiwiaXNCdWZmZXIiLCJmcm9tIiwiYXBwbHkiLCJyZXFFbmQiLCJlbmQiLCJtYXliZUNodW5rIiwibGVuZ3RoIiwiaW50ZXJjZXB0UmVxdWVzdCIsIm9uUmVxdWVzdEVuZCIsImFsbCIsImdldEJvZHlBc3luYyIsInJlc3BvbnNlQm9keSIsIkVycm9yIiwicHJvdG9jb2wiLCJhZ2VudCIsImhvc3QiLCJnZXRIZWFkZXIiLCJwYXRoIiwibG9nZ2VyUmVxdWVzdCIsInVybCIsIm1ldGhvZCIsImhlYWRlcnMiLCJfaGVhZGVycyIsImxvZ2dlclJlc3BvbnNlIiwic3RhdHVzIiwic3RhdHVzQ29kZSIsImxvZ2dlckVycm9yIiwibWVzc2FnZSIsImNvZGUiLCJzdGFjayIsIkdsb2JhbEh0dHBMb2dnZXIiLCJpbnRlcmNlcHRlZFJlcXVlc3RNZXRob2QiLCJvYmplY3QiLCJmdW5jIiwicmVzdCIsInJlcSIsImNhbGwiLCJodHRwIiwiYmluZCIsImdldCIsImh0dHBzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRUE7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7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MEJBQU1sRCxPQUFOLEdBQWdCeUMsd0JBQXdCLENBQUNPLElBQXpCLENBQ1osSUFEWSxFQUVaRSxpQkFGWSxFQUdaQSxrQkFBTWxELE9BSE0sQ0FBaEI7QUFLSDtBQUNKOzs7MkJBQ00sQ0FBRSIsInNvdXJjZXNDb250ZW50IjpbIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC1CYWJlbC1TdGFydGVyXG5cbmltcG9ydCBodHRwLCB7IENsaWVudFJlcXVlc3QsIFNlcnZlclJlc3BvbnNlIH0gZnJvbSAnaHR0cCc7XG5pbXBvcnQgaHR0cHMgZnJvbSAnaHR0cHMnO1xuaW1wb3J0IHtcbiAgICBMb2dnZXJPblJlc3BvbnNlUGF5bG9hZCxcbiAgICBMb2dnZXJIZWFkZXJzLFxuICAgIExvZ2dlclJlcXVlc3QsXG4gICAgTG9nZ2VyUmVzcG9uc2UsXG4gICAgTG9nZ2VyT25SZXNwb25zZUNhbGxiYWNrXG59IGZyb20gJy4vU2hhcmVkVHlwZXMnO1xuXG5jb25zdCBtYXRjaGVzID0gcHJvY2Vzcy52ZXJzaW9uLm1hdGNoKC9edihcXGQrKVxcLihcXGQrKVxcLihcXGQrKSQvKTtcbmNvbnN0IG5vZGVNYWpvclZlcnNpb24gPSBtYXRjaGVzID8gK21hdGNoZXNbMV0gOiAwO1xuXG5pbnRlcmZhY2UgQ2xpZW50UmVxdWVzdFdpdGhVbmRvY3VtZW50ZWRNZW1iZXJzIGV4dGVuZHMgQ2xpZW50UmVxdWVzdCB7XG4gICAgYWdlbnQ6IGFueTtcbiAgICBtZXRob2Q6IHN0cmluZztcbiAgICBfaGVhZGVyczogeyBbaGVhZGVyTmFtZTogc3RyaW5nXTogc3RyaW5nIH07XG59XG5cbmludGVyZmFjZSBTZXJ2ZXJSZXNwb25zZVdpdGhVbmRvY3VtZW50ZWRNZW1iZXJzIGV4dGVuZHMgU2VydmVyUmVzcG9uc2Uge1xuICAgIGhlYWRlcnM6IHsgW2hlYWRlck5hbWU6IHN0cmluZ106IHN0cmluZyB9O1xufVxuXG5jbGFzcyBSZXNwb25zZUJvZHlDb2xsZWN0b3Ige1xuICAgIGJ1ZmZlcnM6IEFycmF5PEJ1ZmZlcj47XG5cbiAgICBib2R5UHJvbWlzZTogUHJvbWlzZTxCdWZmZXI+O1xuXG4gICAgY29uc3RydWN0b3IocmVzcG9uc2U6IFNlcnZlclJlc3BvbnNlKSB7XG4gICAgICAgIHRoaXMuYnVmZmVycyA9IFtdO1xuICAgICAgICB0aGlzLmJvZHlQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgcmVzcG9uc2UucHJlcGVuZExpc3RlbmVyKCdkYXRhJywgY2h1bmsgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVycy5wdXNoKGNodW5rKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzcG9uc2UucHJlcGVuZExpc3RlbmVyKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgYm9keSA9IEJ1ZmZlci5jb25jYXQodGhpcy5idWZmZXJzKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGJvZHkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldEJvZHlBc3luYygpOiBQcm9taXNlPEJ1ZmZlcj4ge1xuICAgICAgICByZXR1cm4gdGhpcy5ib2R5UHJvbWlzZTtcbiAgICB9XG59XG5cbmNvbnN0IHdhaXRGb3JSZXNwb25zZU9yRXJyb3IgPSAoXG4gICAgcmVxdWVzdDogQ2xpZW50UmVxdWVzdFxuKTogUHJvbWlzZTx7XG4gICAgcmVzcG9uc2U/OiBTZXJ2ZXJSZXNwb25zZTtcbiAgICByZXNwb25zZUJvZHlDb2xsZWN0b3I/OiBSZXNwb25zZUJvZHlDb2xsZWN0b3I7XG4gICAgZXJyb3I/OiBFcnJvcjtcbn0+ID0+XG4gICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICByZXF1ZXN0LnByZXBlbmRPbmNlTGlzdGVuZXIoJ3Jlc3BvbnNlJywgcmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2VCb2R5Q29sbGVjdG9yID0gbmV3IFJlc3BvbnNlQm9keUNvbGxlY3RvcihyZXNwb25zZSk7XG4gICAgICAgICAgICByZXNvbHZlKHsgcmVzcG9uc2UsIHJlc3BvbnNlQm9keUNvbGxlY3RvciB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJlcXVlc3QucHJlcGVuZE9uY2VMaXN0ZW5lcignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKHsgZXJyb3IgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG5jb25zdCBjb2xsZWN0UmVxdWVzdEJvZHkgPSAocmVxdWVzdDogQ2xpZW50UmVxdWVzdCk6IFByb21pc2U8QnVmZmVyIHwgbnVsbD4gPT5cbiAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RCb2R5OiBBcnJheTxCdWZmZXI+ID0gW107XG5cbiAgICAgICAgY29uc3QgcmVxV3JpdGUgPSByZXF1ZXN0LndyaXRlO1xuICAgICAgICByZXF1ZXN0LndyaXRlID0gZnVuY3Rpb24oLi4uYXJnczogYW55KSB7XG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIGNodW5rIGNhbiBiZSBlaXRoZXIgYSBzdHJpbmcgb3IgYSBCdWZmZXIuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IGNodW5rID0gYXJndW1lbnRzWzBdO1xuXG4gICAgICAgICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKGNodW5rKSkge1xuICAgICAgICAgICAgICAgIHJlcXVlc3RCb2R5LnB1c2goY2h1bmspO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0Qm9keS5wdXNoKEJ1ZmZlci5mcm9tKGNodW5rLCAndXRmOCcpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlcVdyaXRlLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHJlcUVuZCA9IHJlcXVlc3QuZW5kO1xuICAgICAgICByZXF1ZXN0LmVuZCA9IGZ1bmN0aW9uKC4uLmFyZ3M6IGFueSkge1xuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiB0aGUgZmlyc3QgYXJndW1lbnQgbWlnaHQgYmUgYSBjYWxsYmFjayBvciBhIGNodW5rXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnN0IG1heWJlQ2h1bmsgPSBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIobWF5YmVDaHVuaykpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0Qm9keS5wdXNoKG1heWJlQ2h1bmspO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtYXliZUNodW5rICYmIHR5cGVvZiBtYXliZUNodW5rICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgcmVxdWVzdEJvZHkucHVzaChCdWZmZXIuZnJvbShtYXliZUNodW5rLCAndXRmOCcpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlcUVuZC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXF1ZXN0LnByZXBlbmRPbmNlTGlzdGVuZXIoJ2ZpbmlzaCcsICgpID0+IHtcbiAgICAgICAgICAgIGlmICghcmVxdWVzdEJvZHkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShCdWZmZXIuY29uY2F0KHJlcXVlc3RCb2R5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlcXVlc3QucHJlcGVuZE9uY2VMaXN0ZW5lcignZXJyb3InLCAoKSA9PiByZXNvbHZlKG51bGwpKTtcbiAgICB9KTtcblxuY29uc3QgaW50ZXJjZXB0UmVxdWVzdCA9IGFzeW5jIChcbiAgICByZXF1ZXN0OiBDbGllbnRSZXF1ZXN0LFxuICAgIHtcbiAgICAgICAgb25SZXF1ZXN0RW5kXG4gICAgfTogeyBvblJlcXVlc3RFbmQ6IChwYXlsb2FkOiBMb2dnZXJPblJlc3BvbnNlUGF5bG9hZCkgPT4gdm9pZCB9XG4pID0+IHtcbiAgICBjb25zdCBbcmVxdWVzdEJvZHksIHsgcmVzcG9uc2UsIHJlc3BvbnNlQm9keSwgZXJyb3IgfV0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIGNvbGxlY3RSZXF1ZXN0Qm9keShyZXF1ZXN0KSxcbiAgICAgICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSxcbiAgICAgICAgICAgICAgICByZXNwb25zZUJvZHlDb2xsZWN0b3IsXG4gICAgICAgICAgICAgICAgZXJyb3JcbiAgICAgICAgICAgIH0gPSBhd2FpdCB3YWl0Rm9yUmVzcG9uc2VPckVycm9yKHJlcXVlc3QpO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlQm9keUNvbGxlY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLFxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZUJvZHk6IGF3YWl0IHJlc3BvbnNlQm9keUNvbGxlY3Rvci5nZXRCb2R5QXN5bmMoKSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IG51bGxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZUJvZHk6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyByZXNwb25zZUJvZHlDb2xsZWN0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkoKVxuICAgIF0pO1xuXG4gICAgY29uc3QgcHJvdG9jb2wgPSAocmVxdWVzdCBhcyBDbGllbnRSZXF1ZXN0V2l0aFVuZG9jdW1lbnRlZE1lbWJlcnMpLmFnZW50XG4gICAgICAgIC5wcm90b2NvbDtcbiAgICBjb25zdCBob3N0ID0gcmVxdWVzdC5nZXRIZWFkZXIoJ2hvc3QnKTtcbiAgICBjb25zdCBwYXRoID0gcmVxdWVzdC5wYXRoO1xuXG4gICAgY29uc3QgbG9nZ2VyUmVxdWVzdDogTG9nZ2VyUmVxdWVzdCA9IHtcbiAgICAgICAgdXJsOiBgJHtwcm90b2NvbH0vLyR7aG9zdH0ke3BhdGh9YCxcbiAgICAgICAgbWV0aG9kOiAocmVxdWVzdCBhcyBDbGllbnRSZXF1ZXN0V2l0aFVuZG9jdW1lbnRlZE1lbWJlcnMpLm1ldGhvZCxcbiAgICAgICAgaGVhZGVyczogKHJlcXVlc3QgYXMgQ2xpZW50UmVxdWVzdFdpdGhVbmRvY3VtZW50ZWRNZW1iZXJzKS5faGVhZGVycyxcbiAgICAgICAgYm9keTogcmVxdWVzdEJvZHkgPyByZXF1ZXN0Qm9keSA6IG51bGxcbiAgICB9O1xuICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICBjb25zdCBsb2dnZXJSZXNwb25zZTogTG9nZ2VyUmVzcG9uc2UgPSB7XG4gICAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1c0NvZGUsXG4gICAgICAgICAgICBib2R5OiByZXNwb25zZUJvZHkgPyByZXNwb25zZUJvZHkgOiBudWxsLFxuICAgICAgICAgICAgaGVhZGVyczogKHJlc3BvbnNlIGFzIFNlcnZlclJlc3BvbnNlV2l0aFVuZG9jdW1lbnRlZE1lbWJlcnMpXG4gICAgICAgICAgICAgICAgLmhlYWRlcnMgYXMgTG9nZ2VySGVhZGVyc1xuICAgICAgICB9O1xuICAgICAgICBvblJlcXVlc3RFbmQoe1xuICAgICAgICAgICAgcmVxdWVzdDogbG9nZ2VyUmVxdWVzdCxcbiAgICAgICAgICAgIHJlc3BvbnNlOiBsb2dnZXJSZXNwb25zZSxcbiAgICAgICAgICAgIGVycm9yOiBudWxsXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbG9nZ2VyRXJyb3IgPSB7XG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLFxuICAgICAgICAgICAgY29kZTogKGVycm9yIGFzIGFueSkuY29kZSBhcyBzdHJpbmcsXG4gICAgICAgICAgICBzdGFjazogZXJyb3Iuc3RhY2sgfHwgJydcbiAgICAgICAgfTtcbiAgICAgICAgb25SZXF1ZXN0RW5kKHtcbiAgICAgICAgICAgIHJlcXVlc3Q6IGxvZ2dlclJlcXVlc3QsXG4gICAgICAgICAgICByZXNwb25zZTogbnVsbCxcbiAgICAgICAgICAgIGVycm9yOiBsb2dnZXJFcnJvclxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHbG9iYWxIdHRwTG9nZ2VyIHtcbiAgICBvblJlcXVlc3RFbmQ6IExvZ2dlck9uUmVzcG9uc2VDYWxsYmFjaztcbiAgICBjb25zdHJ1Y3Rvcih7IG9uUmVxdWVzdEVuZCB9OiB7IG9uUmVxdWVzdEVuZDogTG9nZ2VyT25SZXNwb25zZUNhbGxiYWNrIH0pIHtcbiAgICAgICAgdGhpcy5vblJlcXVlc3RFbmQgPSBvblJlcXVlc3RFbmQ7XG4gICAgfVxuICAgIHN0YXJ0KCkge1xuICAgICAgICBjb25zdCB7IG9uUmVxdWVzdEVuZCB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgaW50ZXJjZXB0ZWRSZXF1ZXN0TWV0aG9kID0gKFxuICAgICAgICAgICAgb2JqZWN0OiBhbnksXG4gICAgICAgICAgICBmdW5jOiBhbnksXG4gICAgICAgICAgICAuLi5yZXN0OiBhbnlcbiAgICAgICAgKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByZXEgPSBmdW5jLmNhbGwob2JqZWN0LCAuLi5yZXN0KTtcbiAgICAgICAgICAgIGludGVyY2VwdFJlcXVlc3QocmVxLCB7IG9uUmVxdWVzdEVuZCB9KTtcbiAgICAgICAgICAgIHJldHVybiByZXE7XG4gICAgICAgIH07XG5cbiAgICAgICAgaHR0cC5yZXF1ZXN0ID0gaW50ZXJjZXB0ZWRSZXF1ZXN0TWV0aG9kLmJpbmQobnVsbCwgaHR0cCwgaHR0cC5yZXF1ZXN0KTtcbiAgICAgICAgaHR0cC5nZXQgPSBpbnRlcmNlcHRlZFJlcXVlc3RNZXRob2QuYmluZChudWxsLCBodHRwLCBodHRwLmdldCk7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGh0dHBzLnJlcXVlc3QgcHJveGllcyB0byBodHRwLnJlcXVlc3QgZm9yIDgueCBhbmQgZWFybGllciB2ZXJzaW9uc1xuICAgICAgICAgKi9cbiAgICAgICAgaWYgKG5vZGVNYWpvclZlcnNpb24gPiA4KSB7XG4gICAgICAgICAgICBodHRwcy5nZXQgPSBpbnRlcmNlcHRlZFJlcXVlc3RNZXRob2QuYmluZChudWxsLCBodHRwcywgaHR0cHMuZ2V0KTtcbiAgICAgICAgICAgIGh0dHBzLnJlcXVlc3QgPSBpbnRlcmNlcHRlZFJlcXVlc3RNZXRob2QuYmluZChcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIGh0dHBzLFxuICAgICAgICAgICAgICAgIGh0dHBzLnJlcXVlc3RcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RvcCgpIHt9XG59XG4iXX0=