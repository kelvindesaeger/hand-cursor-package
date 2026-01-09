"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clickAt = clickAt;
exports["default"] = HandCursor;
exports.isPinching = isPinching;
var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));
var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));
var _react = require("react");
var _tasksVision = require("@mediapipe/tasks-vision");
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
      _init = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee() {
        var stream, vision;
        return _regenerator["default"].wrap(function (_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 1;
              return navigator.mediaDevices.getUserMedia({
                video: true
              });
            case 1:
              stream = _context.sent;
              video.srcObject = stream;
              _context.next = 2;
              return _tasksVision.FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm");
            case 2:
              vision = _context.sent;
              _context.next = 3;
              return _tasksVision.HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                  modelAssetPath: "https://storage.googleapis.com/mediapipe-assets/hand_landmarker.task",
                  delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 1
              });
            case 3:
              handLandmarker = _context.sent;
              requestAnimationFrame(loop);
            case 4:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }));
      return _init.apply(this, arguments);
    }
    function loop() {
      return _loop.apply(this, arguments);
    }
    function _loop() {
      _loop = (0, _asyncToGenerator2["default"])(/*#__PURE__*/_regenerator["default"].mark(function _callee2() {
        var results, landmarks, indexTip, targetX, targetY, pinching, deltaY;
        return _regenerator["default"].wrap(function (_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 1;
              return handLandmarker.detectForVideo(video, performance.now());
            case 1:
              results = _context2.sent;
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
            case "end":
              return _context2.stop();
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