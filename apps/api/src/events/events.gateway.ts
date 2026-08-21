import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface StatsUpdate {
  totalAnimals: number;
  healthyCount: number;
  sickCount: number;
  underTreatmentCount: number;
  recoveredCount: number;
  counties: number;
  lastUpdated: string;
}

export interface AnimalEvent {
  type: 'created' | 'updated' | 'deleted';
  animal?: Record<string, unknown>;
  animalId?: number;
  timestamp: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  namespace: '/',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private connectedClients = new Set<string>();

  handleConnection(client: Socket) {
    this.connectedClients.add(client.id);
    this.logger.log(
      `Client connected: ${client.id} (total: ${this.connectedClients.size})`,
    );
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(
      `Client disconnected: ${client.id} (total: ${this.connectedClients.size})`,
    );
  }

  @SubscribeMessage('subscribe:stats')
  handleSubscribeStats(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} subscribed to stats`);
    client.join('stats');
    return { event: 'subscribed', data: { channel: 'stats' } };
  }

  @SubscribeMessage('subscribe:animal-events')
  handleSubscribeAnimalEvents(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} subscribed to animal events`);
    client.join('animal-events');
    return { event: 'subscribed', data: { channel: 'animal-events' } };
  }

  @SubscribeMessage('unsubscribe:stats')
  handleUnsubscribeStats(@ConnectedSocket() client: Socket) {
    client.leave('stats');
    return { event: 'unsubscribed', data: { channel: 'stats' } };
  }

  broadcastStats(stats: StatsUpdate) {
    this.server.to('stats').emit('stats:updated', stats);
  }

  broadcastAnimalEvent(event: AnimalEvent) {
    this.server.to('animal-events').emit('animal:event', event);
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}
