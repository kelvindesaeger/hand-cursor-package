// index.d.ts
import { RefObject } from 'react';

export interface HandCursorProps {
  videoRef?: RefObject<HTMLVideoElement>;
  smoothing?: number;
  scrollSensitivity?: number;
}

export function isPinching(landmarks: any[]): boolean;
export function clickAt(x: number, y: number): void;

export default function HandCursor(props: HandCursorProps): JSX.Element;
