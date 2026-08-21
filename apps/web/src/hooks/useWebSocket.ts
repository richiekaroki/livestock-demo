import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

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

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [stats, setStats] = useState<StatsUpdate | null>(null);
  const [lastAnimalEvent, setLastAnimalEvent] = useState<AnimalEvent | null>(null);

  useEffect(() => {
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("subscribe:stats");
      socket.emit("subscribe:animal-events");
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("stats:updated", (data: StatsUpdate) => {
      setStats(data);
    });

    socket.on("animal:event", (data: AnimalEvent) => {
      setLastAnimalEvent(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const reconnect = useCallback(() => {
    socketRef.current?.connect();
  }, []);

  return { connected, stats, lastAnimalEvent, reconnect };
}
