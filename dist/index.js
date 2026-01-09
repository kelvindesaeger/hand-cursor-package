"use strict";

var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "HandCursor", {
  enumerable: true,
  get: function get() {
    return _HandCursor["default"];
  }
});
Object.defineProperty(exports, "clickAt", {
  enumerable: true,
  get: function get() {
    return _HandCursor.clickAt;
  }
});
exports["default"] = void 0;
Object.defineProperty(exports, "isPinching", {
  enumerable: true,
  get: function get() {
    return _HandCursor.isPinching;
  }
});
var _HandCursor = _interopRequireWildcard(require("./HandCursor.js"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
// src/index.js
var _default = exports["default"] = _HandCursor["default"];