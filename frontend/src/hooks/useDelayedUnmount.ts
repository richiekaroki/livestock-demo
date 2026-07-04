// src/hooks/useDelayedUnmount.ts
import { useEffect, useState } from "react";

export function useDelayedUnmount(isMounted: boolean, duration: number = 200) {
  const [shouldRender, setShouldRender] = useState(isMounted);

  useEffect(() => {
    if (isMounted) {
      setShouldRender(true);
    } else {
      const timeout = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timeout);
    }
  }, [isMounted, duration]);

  return {
    shouldRender,
    isAnimating: isMounted !== shouldRender && !isMounted,
  };
}
