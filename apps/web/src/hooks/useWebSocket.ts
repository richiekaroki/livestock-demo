import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { config } from "../config";

interface StatsUpdate {
  totalAnimals: number;
  healthyCount: number;
  sickCount: number;
  underTreatmentCount: number;
  recoveredCount: number;
  counties: number;
  lastUpdated: string;
}

interface AnimalEvent {
  type: "created" | "updated" | "deleted";
  animal?: Record<string, unknown>;
  animalId?: number;
  timestamp: string;
}

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState<StatsUpdate | null>(null);
  const [lastAnimalEvent, setLastAnimalEvent] = useState<AnimalEvent | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Strip /api suffix for Socket.io (expects server root URL)
    const socketUrl = config.api.baseUrl.replace(/\/api\/?$/, '') || window.location.origin;
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 10000,
      forceNew: false,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      if (!cancelled) {
        setConnected(true);
        socket.emit("subscribe:stats");
        socket.emit("subscribe:animal-events");
      }
    });

    socket.on("disconnect", () => {
      if (!cancelled) setConnected(false);
    });

    socket.on("connect_error", () => {
      // Suppress — API may not be running
    });

    socket.on("stats:updated", (data: StatsUpdate) => {
      if (!cancelled) setStats(data);
    });

    socket.on("animal:event", (data: AnimalEvent) => {
      if (!cancelled) setLastAnimalEvent(data);
    });

    return () => {
      cancelled = true;
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const reconnect = useCallback(() => {
    socketRef.current?.connect();
  }, []);

  const subscribe = useCallback(
    (event: string, handler: (...args: unknown[]) => void) => {
      socketRef.current?.on(event, handler);
      return () => {
        socketRef.current?.off(event, handler);
      };
    },
    []
  );

  return { connected, stats, lastAnimalEvent, reconnect, subscribe };
}
