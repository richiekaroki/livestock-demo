import { io, Socket } from 'socket.io-client';
import { AUTH_TOKEN_KEY, secureStorage } from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
  if (!socket) {
    const token = await secureStorage.getItem(AUTH_TOKEN_KEY);
    const baseUrl = API_URL.replace(/\/api\/?$/, '');
    socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export async function connectSocket(): Promise<Socket> {
  const s = await getSocket();
  if (!s.connected) s.connect();
  return s;
}

/**
 * Update the socket's auth token (call after token refresh).
 * If connected, disconnect and reconnect with the new token.
 */
export async function refreshSocketToken(): Promise<void> {
  if (!socket) return;
  const newToken = await secureStorage.getItem(AUTH_TOKEN_KEY);
  if (!newToken) return;
  socket.auth = { token: newToken };
  if (socket.connected) {
    socket.disconnect();
    socket.connect();
  }
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
