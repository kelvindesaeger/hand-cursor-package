# HandCursor

React hand gesture cursor component using MediaPipe.

## Features

- Hand cursor follows your index finger.
- Pinch to simulate clicks.
- Smooth scrolling with pinch gestures.
- Default video included, or use your own video element.

## Installation

**Locally / private use:**

```bash
npm link
```

**Or local install:**

```bash
npm npm install /path/to/hand-cursor-package
```

## Usage

```jsx
import { HandCursor } from "hand-cursor";

function App() {
  return <HandCursor smoothing={0.85} scrollSensitivity={1.2} />;
}
```

### Using custom video

```jsx
import { useRef } from "react";
import { HandCursor } from "hand-cursor";

function App() {
  const videoRef = useRef();
  return (
    <>
      <video ref={videoRef} style={{ display: "none" }} />
      <HandCursor videoRef={videoRef} />
    </>
  );
}
```

### Helpers

```js
import { isPinching, clickAt } from "hand-cursor";
```
