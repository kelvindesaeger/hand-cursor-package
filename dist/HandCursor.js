"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clickAt = clickAt;
exports["default"] = HandCursor;
exports.isPinching = isPinching;
var _react = require("react");
var _tasksVision = require("@mediapipe/tasks-vision");
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/** Helpers */
function isPinching(landmarks) {
  if (!landmarks || landmarks.length < 9) return false;
  var thumb = landmarks[4];
  var index = landmarks[8];
  var dx = thumb.x - index.x;
  var dy = thumb.y - index.y;
  return Math.sqrt(dx * dx + dy * dy) < 0.04;
}
function clickAt(x, y) {
  var el = document.elementFromPoint(x, y);
  if (!el) return;
  el.dispatchEvent(new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window
  }));
}

/** React component */
function HandCursor(_ref) {
  var videoRef = _ref.videoRef,
    _ref$smoothing = _ref.smoothing,
    smoothing = _ref$smoothing === void 0 ? 0.8 : _ref$smoothing,
    _ref$scrollSensitivit = _ref.scrollSensitivity,
    scrollSensitivity = _ref$scrollSensitivit === void 0 ? 1 : _ref$scrollSensitivit;
  var defaultVideoRef = (0, _react.useRef)(null);
  var cursorRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(function () {
    var video = (videoRef === null || videoRef === void 0 ? void 0 : videoRef.current) || defaultVideoRef.current;
    var cursor = cursorRef.current;
    if (!video || !cursor) return;
    var handLandmarker,
      lastX = 0,
      lastY = 0,
      wasPinching = false,
      lastPinchY = 0;
    var scrollVelocity = 0,
      smoothedScroll = 0;
    var SCROLL_THRESHOLD = 5,
      SCROLL_SMOOTHING = 0.2;
    function init() {
      return _init.apply(this, arguments);
    }
    function _init() {
      _init = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
        var stream, vision;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.n) {
            case 0:
              _context.n = 1;
              return navigator.mediaDevices.getUserMedia({
                video: true
              });
            case 1:
              stream = _context.v;
              video.srcObject = stream;
              _context.n = 2;
              return _tasksVision.FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm");
            case 2:
              vision = _context.v;
              _context.n = 3;
              return _tasksVision.HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                  modelAssetPath: "https://storage.googleapis.com/mediapipe-assets/hand_landmarker.task",
                  delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 1
              });
            case 3:
              handLandmarker = _context.v;
              requestAnimationFrame(loop);
            case 4:
              return _context.a(2);
          }
        }, _callee);
      }));
      return _init.apply(this, arguments);
    }
    function loop() {
      return _loop.apply(this, arguments);
    }
    function _loop() {
      _loop = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
        var results, landmarks, indexTip, targetX, targetY, pinching, deltaY;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.n) {
            case 0:
              _context2.n = 1;
              return handLandmarker.detectForVideo(video, performance.now());
            case 1:
              results = _context2.v;
              if (results.landmarks.length > 0) {
                landmarks = results.landmarks[0];
                indexTip = landmarks[8];
                targetX = (1 - indexTip.x) * window.innerWidth;
                targetY = indexTip.y * window.innerHeight;
                lastX = lastX * smoothing + targetX * (1 - smoothing);
                lastY = lastY * smoothing + targetY * (1 - smoothing);
                cursor.style.transform = "translate(".concat(lastX, "px, ").concat(lastY, "px)");
                pinching = isPinching(landmarks);
                if (pinching && !wasPinching) clickAt(lastX, lastY);
                if (pinching) {
                  if (!wasPinching) lastPinchY = lastY;else {
                    deltaY = lastPinchY - lastY;
                    scrollVelocity = Math.abs(deltaY) > SCROLL_THRESHOLD ? deltaY * scrollSensitivity : 0;
                    lastPinchY = lastY;
                  }
                } else scrollVelocity = 0;
                smoothedScroll = smoothedScroll * (1 - SCROLL_SMOOTHING) + scrollVelocity * SCROLL_SMOOTHING;
                if (Math.abs(smoothedScroll) > 0.1) window.scrollBy({
                  top: smoothedScroll
                });
                wasPinching = pinching;
              }
              requestAnimationFrame(loop);
            case 2:
              return _context2.a(2);
          }
        }, _callee2);
      }));
      return _loop.apply(this, arguments);
    }
    init();
  }, [videoRef, smoothing, scrollSensitivity]);
  return /*#__PURE__*/React.createElement(React.Fragment, null, !videoRef && /*#__PURE__*/React.createElement("video", {
    ref: defaultVideoRef,
    autoPlay: true,
    playsInline: true,
    style: {
      position: "fixed",
      bottom: 10,
      right: 10,
      width: 160,
      transform: "scaleX(-1)",
      zIndex: 1000
    }
  }), /*#__PURE__*/React.createElement("div", {
    ref: cursorRef,
    style: {
      position: "fixed",
      width: 16,
      height: 16,
      background: "red",
      borderRadius: "50%",
      pointerEvents: "none",
      zIndex: 999999
    }
  }));
}