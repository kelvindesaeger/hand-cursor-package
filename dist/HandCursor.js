import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import _regeneratorRuntime from "@babel/runtime/regenerator";
import { useEffect, useRef } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

/* =========================================================
   Gesture helpers
   ========================================================= */

/**
 * Pinch = thumb tip close to index tip
 * Used ONLY for clicking
 */
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
export function isPinching(landmarks) {
  if (!landmarks || landmarks.length < 9) return false;
  var thumb = landmarks[4];
  var index = landmarks[8];
  var dx = thumb.x - index.x;
  var dy = thumb.y - index.y;
  return Math.sqrt(dx * dx + dy * dy) < 0.06;
}

/**
 * Fist = all fingers curled
 * Used ONLY for scrolling
 */
export function isFist(landmarks) {
  if (!landmarks || landmarks.length < 21) return false;

  // Check all fingers (including thumb)
  var fingers = [
  // { tip: 4, base: 2 },   // thumb
  {
    tip: 8,
    base: 5
  },
  // index
  {
    tip: 12,
    base: 9
  },
  // middle
  {
    tip: 16,
    base: 13
  },
  // ring
  {
    tip: 20,
    base: 17
  } // pinky
  ];
  var curledCount = 0;
  for (var _i = 0, _fingers = fingers; _i < _fingers.length; _i++) {
    var _fingers$_i = _fingers[_i],
      tip = _fingers$_i.tip,
      base = _fingers$_i.base;
    var dx = landmarks[tip].x - landmarks[base].x;
    var dy = landmarks[tip].y - landmarks[base].y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    // The threshold is a bit larger to account for real fist positions
    if (distance < 0.12) curledCount++;
  }

  // Consider it a fist if 4 or more fingers (including thumb) are curled
  return curledCount >= 4;
}

/**
 * Dispatch a real DOM click
 */
export function clickAt(x, y) {
  var el = document.elementFromPoint(x, y);
  if (!el) return;
  el.dispatchEvent(new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window
  }));
}

/* =========================================================
   HandCursor Component
   ========================================================= */

export default function HandCursor(_ref) {
  var videoRef = _ref.videoRef,
    _ref$smoothing = _ref.smoothing,
    smoothing = _ref$smoothing === void 0 ? 0.85 : _ref$smoothing,
    _ref$scrollSensitivit = _ref.scrollSensitivity,
    scrollSensitivity = _ref$scrollSensitivit === void 0 ? 1 : _ref$scrollSensitivit,
    _ref$idleColor = _ref.idleColor,
    idleColor = _ref$idleColor === void 0 ? "cyan" : _ref$idleColor,
    _ref$pinchColor = _ref.pinchColor,
    pinchColor = _ref$pinchColor === void 0 ? "yellow" : _ref$pinchColor,
    _ref$scrollColor = _ref.scrollColor,
    scrollColor = _ref$scrollColor === void 0 ? "lime" : _ref$scrollColor;
  var defaultVideoRef = useRef(null);
  var cursorRef = useRef(null);
  useEffect(function () {
    var video = (videoRef === null || videoRef === void 0 ? void 0 : videoRef.current) || defaultVideoRef.current;
    var cursor = cursorRef.current;
    if (!video || !cursor) return;
    var handLandmarker;
    var lastX = 0;
    var lastY = 0;
    var wasPinching = false;
    var wasFist = false;
    var lastScrollY = 0;
    var scrollVelocity = 0;
    var smoothedScroll = 0;
    var lastCursorState = "idle"; // "idle" | "pinch" | "fist"

    var SCROLL_THRESHOLD = 6;
    var SCROLL_SMOOTHING = 0.2;
    function init() {
      return _init.apply(this, arguments);
    }
    function _init() {
      _init = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        var stream, vision;
        return _regeneratorRuntime.wrap(function (_context) {
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
              return FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm");
            case 2:
              vision = _context.sent;
              _context.next = 3;
              return HandLandmarker.createFromOptions(vision, {
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
      _loop = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime.mark(function _callee2() {
        var now, results, landmarks, indexTip, targetX, targetY, pinching, fist, currentState, deltaY;
        return _regeneratorRuntime.wrap(function (_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              now = performance.now();
              _context2.next = 1;
              return handLandmarker.detectForVideo(video, now);
            case 1:
              results = _context2.sent;
              if (results.landmarks.length > 0) {
                landmarks = results.landmarks[0];
                indexTip = landmarks[8];
                /* ---------------- CURSOR MOVE ---------------- */
                targetX = (1 - indexTip.x) * window.innerWidth;
                targetY = indexTip.y * window.innerHeight;
                lastX = lastX * smoothing + targetX * (1 - smoothing);
                lastY = lastY * smoothing + targetY * (1 - smoothing);
                cursor.style.transform = "translate(".concat(lastX, "px, ").concat(lastY, "px)");

                /* ---------------- GESTURES ---------------- */
                pinching = isPinching(landmarks);
                fist = !pinching && isFist(landmarks); // Cursor state priority: fist > pinch > idle
                currentState = "idle";
                if (fist) currentState = "fist";else if (pinching) currentState = "pinch";
                if (currentState !== lastCursorState) {
                  if (currentState === "fist") cursor.style.backgroundColor = scrollColor;else if (currentState === "pinch") cursor.style.backgroundColor = pinchColor;else cursor.style.backgroundColor = idleColor;
                  lastCursorState = currentState;
                }

                /* ---------------- SCROLL (FIST) ---------------- */
                if (fist) {
                  if (!wasFist) lastScrollY = lastY;else {
                    deltaY = lastScrollY - lastY;
                    scrollVelocity = Math.abs(deltaY) > SCROLL_THRESHOLD ? deltaY * scrollSensitivity : 0;
                    lastScrollY = lastY;
                  }
                } else scrollVelocity = 0;
                smoothedScroll = smoothedScroll * (1 - SCROLL_SMOOTHING) + scrollVelocity * SCROLL_SMOOTHING;
                if (Math.abs(smoothedScroll) > 0.2) window.scrollBy({
                  top: smoothedScroll
                });

                /* ---------------- CLICK (PINCH) ---------------- */
                if (pinching && !wasPinching) clickAt(lastX, lastY);
                wasFist = fist;
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
  }, [videoRef, smoothing, scrollSensitivity, idleColor, pinchColor, scrollColor]);
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [!videoRef && /*#__PURE__*/_jsx("video", {
      ref: defaultVideoRef,
      autoPlay: true,
      playsInline: true,
      muted: true,
      style: {
        position: "fixed",
        bottom: 12,
        right: 12,
        width: 160,
        transform: "scaleX(-1)",
        zIndex: 1000,
        borderRadius: 8,
        opacity: 0.85
      }
    }), /*#__PURE__*/_jsx("div", {
      ref: cursorRef,
      style: {
        position: "fixed",
        width: 16,
        height: 16,
        background: idleColor,
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 999999,
        mixBlendMode: "difference"
      }
    })]
  });
}