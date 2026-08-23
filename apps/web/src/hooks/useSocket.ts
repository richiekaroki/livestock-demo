import { useEffect, useRef, useState } from "react";
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

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const subscribe = (event: string, handler: (...args: unknown[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => {
      socketRef.current?.off(event, handler);
    };
  };

  const joinRoom = (room: string) => {
    socketRef.current?.emit(`subscribe:${room}`);
  };

  const leaveRoom = (room: string) => {
    socketRef.current?.emit(`unsubscribe:${room}`);
  };

  return { connected, subscribe, joinRoom, leaveRoom };
}

export type { StatsUpdate, AnimalEvent };
