import { useEffect, useRef } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

/** Helpers */
export function isPinching(landmarks) {
  if (!landmarks || landmarks.length < 9) return false;
  const thumb = landmarks[4];
  const index = landmarks[8];
  const dx = thumb.x - index.x;
  const dy = thumb.y - index.y;
  return Math.sqrt(dx * dx + dy * dy) < 0.04;
}

export function clickAt(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el) return;
  el.dispatchEvent(
    new MouseEvent("click", { bubbles: true, cancelable: true, view: window })
  );
}

/** React component */
export default function HandCursor({ videoRef, smoothing = 0.8, scrollSensitivity = 1 }) {
  const defaultVideoRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    const video = videoRef?.current || defaultVideoRef.current;
    const cursor = cursorRef.current;
    if (!video || !cursor) return;

    let handLandmarker, lastX = 0, lastY = 0, wasPinching = false, lastPinchY = 0;
    let scrollVelocity = 0, smoothedScroll = 0;
    const SCROLL_THRESHOLD = 5, SCROLL_SMOOTHING = 0.2;

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
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });

      requestAnimationFrame(loop);
    }

    async function loop() {
      const results = await handLandmarker.detectForVideo(video, performance.now());
      if (results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        const indexTip = landmarks[8];
        const targetX = (1 - indexTip.x) * window.innerWidth;
        const targetY = indexTip.y * window.innerHeight;

        lastX = lastX * smoothing + targetX * (1 - smoothing);
        lastY = lastY * smoothing + targetY * (1 - smoothing);
        cursor.style.transform = `translate(${lastX}px, ${lastY}px)`;

        const pinching = isPinching(landmarks);

        if (pinching && !wasPinching) clickAt(lastX, lastY);

        if (pinching) {
          if (!wasPinching) lastPinchY = lastY;
          else {
            let deltaY = lastPinchY - lastY;
            scrollVelocity =
              Math.abs(deltaY) > SCROLL_THRESHOLD ? deltaY * scrollSensitivity : 0;
            lastPinchY = lastY;
          }
        } else scrollVelocity = 0;

        smoothedScroll =
          smoothedScroll * (1 - SCROLL_SMOOTHING) +
          scrollVelocity * SCROLL_SMOOTHING;
        if (Math.abs(smoothedScroll) > 0.1) window.scrollBy({ top: smoothedScroll });

        wasPinching = pinching;
      }

      requestAnimationFrame(loop);
    }

    init();
  }, [videoRef, smoothing, scrollSensitivity]);

  return (
    <>
      {!videoRef && (
        <video
          ref={defaultVideoRef}
          autoPlay
          playsInline
          style={{
            position: "fixed",
            bottom: 10,
            right: 10,
            width: 160,
            transform: "scaleX(-1)",
            zIndex: 1000
          }}
        />
      )}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          width: 16,
          height: 16,
          background: "red",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 999999
        }}
      />
    </>
  );
}
