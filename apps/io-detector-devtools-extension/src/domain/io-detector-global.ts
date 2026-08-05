export interface IODetectorGlobal {
  destroy: () => void;
}

export interface WindowWithIODetector {
  __IO_DETECTOR__?: IODetectorGlobal;
}
