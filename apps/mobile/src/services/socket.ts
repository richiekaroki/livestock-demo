import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_TOKEN_KEY } from './storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api';

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
  if (!socket) {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const baseUrl = API_URL.replace(/\/api\/?$/, '');
    socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: false,
    });
  }
  return socket;
}

export async function connectSocket(): Promise<Socket> {
  const s = await getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
