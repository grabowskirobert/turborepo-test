interface ScriptingResult<T> {
  result?: T;
  frameId?: number;
}

export async function isDetectorActive(tabId: number): Promise<boolean> {
  const results = (await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () =>
      !!(window as unknown as { __IO_DETECTOR__?: unknown }).__IO_DETECTOR__,
  })) as ScriptingResult<boolean>[];

  return results[0]?.result === true;
}

export async function destroyDetector(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    world: 'MAIN',
    func: () => {
      const w = window as unknown as {
        __IO_DETECTOR__?: { destroy: () => void };
      };

      w.__IO_DETECTOR__?.destroy();
    },
  });
}
