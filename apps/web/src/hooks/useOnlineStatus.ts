import { useSyncExternalStore } from "react";

let online = typeof navigator !== "undefined" ? navigator.onLine : true;
const listeners = new Set<() => void>();

function emit() {
  online = navigator.onLine;
  for (const listener of listeners) listener();
}

if (typeof window !== "undefined") {
  window.addEventListener("online", emit);
  window.addEventListener("offline", emit);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, () => online, () => true);
}
