import { useEffect, useRef } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

/* =========================================================
   Gesture helpers
   ========================================================= */

/**
 * Pinch = thumb tip close to index tip
 * Used ONLY for clicking
 */
export function isPinching(landmarks) {
  if (!landmarks || landmarks.length < 9) return false;
  const thumb = landmarks[4];
  const index = landmarks[8];
  const dx = thumb.x - index.x;
  const dy = thumb.y - index.y;
  return Math.sqrt(dx * dx + dy * dy) < 0.06;
}

/**
 * Fist = all fingers curled
 * Used ONLY for scrolling
 */
export function isFist(landmarks) {
  if (!landmarks || landmarks.length < 21) return false;

  // Check all fingers (including thumb)
  const fingers = [
    // { tip: 4, base: 2 },   // thumb
    { tip: 8, base: 5 },   // index
    { tip: 12, base: 9 },  // middle
    { tip: 16, base: 13 }, // ring
    { tip: 20, base: 17 }, // pinky
  ];

  let curledCount = 0;

  for (const { tip, base } of fingers) {
    const dx = landmarks[tip].x - landmarks[base].x;
    const dy = landmarks[tip].y - landmarks[base].y;
    const distance = Math.sqrt(dx * dx + dy * dy);

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
  const el = document.elementFromPoint(x, y);
  if (!el) return;
  el.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );
}

/* =========================================================
   HandCursor Component
   ========================================================= */

export default function HandCursor({
  videoRef,
  smoothing = 0.85,
  scrollSensitivity = 1,
  idleColor = "cyan",
  pinchColor = "yellow",
  scrollColor = "lime",
}) {
  const defaultVideoRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    const video = videoRef?.current || defaultVideoRef.current;
    const cursor = cursorRef.current;
    if (!video || !cursor) return;

    let handLandmarker;
    let lastX = 0;
    let lastY = 0;
    let wasPinching = false;
    let wasFist = false;
    let lastScrollY = 0;
    let scrollVelocity = 0;
    let smoothedScroll = 0;
    let lastCursorState = "idle"; // "idle" | "pinch" | "fist"

    const SCROLL_THRESHOLD = 6;
    const SCROLL_SMOOTHING = 0.2;

    async function init() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
      );

      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-assets/hand_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numHands: 1,
      });

      requestAnimationFrame(loop);
    }

    async function loop() {
      const now = performance.now();
      const results = await handLandmarker.detectForVideo(video, now);

      if (results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        const indexTip = landmarks[8];

        /* ---------------- CURSOR MOVE ---------------- */
        const targetX = (1 - indexTip.x) * window.innerWidth;
        const targetY = indexTip.y * window.innerHeight;
        lastX = lastX * smoothing + targetX * (1 - smoothing);
        lastY = lastY * smoothing + targetY * (1 - smoothing);
        cursor.style.transform = `translate(${lastX}px, ${lastY}px)`;

        /* ---------------- GESTURES ---------------- */
        const pinching = isPinching(landmarks);
        const fist = !pinching && isFist(landmarks);

        // Cursor state priority: fist > pinch > idle
        let currentState = "idle";
        if (fist) currentState = "fist";
        else if (pinching) currentState = "pinch";

        if (currentState !== lastCursorState) {
          if (currentState === "fist") cursor.style.backgroundColor = scrollColor;
          else if (currentState === "pinch") cursor.style.backgroundColor = pinchColor;
          else cursor.style.backgroundColor = idleColor;
          lastCursorState = currentState;
        }

        /* ---------------- SCROLL (FIST) ---------------- */
        if (fist) {
          if (!wasFist) lastScrollY = lastY;
          else {
            const deltaY = lastScrollY - lastY;
            scrollVelocity =
              Math.abs(deltaY) > SCROLL_THRESHOLD ? deltaY * scrollSensitivity : 0;
            lastScrollY = lastY;
          }
        } else scrollVelocity = 0;

        smoothedScroll =
          smoothedScroll * (1 - SCROLL_SMOOTHING) +
          scrollVelocity * SCROLL_SMOOTHING;

        if (Math.abs(smoothedScroll) > 0.2) window.scrollBy({ top: smoothedScroll });

        /* ---------------- CLICK (PINCH) ---------------- */
        if (pinching && !wasPinching) clickAt(lastX, lastY);

        wasFist = fist;
        wasPinching = pinching;
      }

      requestAnimationFrame(loop);
    }

    init();
  }, [videoRef, smoothing, scrollSensitivity, idleColor, pinchColor, scrollColor]);

  return (
    <>
      {/* Default camera preview (optional) */}
      {!videoRef && (
        <video
          ref={defaultVideoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: "fixed",
            bottom: 12,
            right: 12,
            width: 160,
            transform: "scaleX(-1)",
            zIndex: 1000,
            borderRadius: 8,
            opacity: 0.85,
          }}
        />
      )}

      {/* Virtual cursor */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          width: 16,
          height: 16,
          background: idleColor,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 999999,
          mixBlendMode: "difference",
        }}
      />
    </>
  );
}
