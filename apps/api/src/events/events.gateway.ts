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

export interface VaccinationEvent {
  type: 'created' | 'updated' | 'deleted';
  vaccination?: Record<string, unknown>;
  vaccinationId?: number;
  timestamp: string;
}

export interface OutbreakEvent {
  type: 'reported' | 'updated';
  outbreak?: Record<string, unknown>;
  outbreakId?: number;
  timestamp: string;
}

export interface HealthAlert {
  animalId: number;
  animalName: string;
  previousHealth: string;
  newHealth: string;
  county: string;
  owner: string;
  timestamp: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',').filter(Boolean) || [],
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
    void client.join('stats');
    return { event: 'subscribed', data: { channel: 'stats' } };
  }

  @SubscribeMessage('subscribe:animal-events')
  handleSubscribeAnimalEvents(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} subscribed to animal events`);
    void client.join('animal-events');
    return { event: 'subscribed', data: { channel: 'animal-events' } };
  }

  @SubscribeMessage('unsubscribe:stats')
  handleUnsubscribeStats(@ConnectedSocket() client: Socket) {
    void client.leave('stats');
    return { event: 'unsubscribed', data: { channel: 'stats' } };
  }

  @SubscribeMessage('subscribe:vaccination-events')
  handleSubscribeVaccinationEvents(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} subscribed to vaccination events`);
    void client.join('vaccination-events');
    return { event: 'subscribed', data: { channel: 'vaccination-events' } };
  }

  @SubscribeMessage('subscribe:outbreak-events')
  handleSubscribeOutbreakEvents(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} subscribed to outbreak events`);
    void client.join('outbreak-events');
    return { event: 'subscribed', data: { channel: 'outbreak-events' } };
  }

  @SubscribeMessage('subscribe:health-alerts')
  handleSubscribeHealthAlerts(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client ${client.id} subscribed to health alerts`);
    void client.join('health-alerts');
    return { event: 'subscribed', data: { channel: 'health-alerts' } };
  }

  @SubscribeMessage('unsubscribe:vaccination-events')
  handleUnsubscribeVaccinationEvents(@ConnectedSocket() client: Socket) {
    void client.leave('vaccination-events');
    return { event: 'unsubscribed', data: { channel: 'vaccination-events' } };
  }

  @SubscribeMessage('unsubscribe:outbreak-events')
  handleUnsubscribeOutbreakEvents(@ConnectedSocket() client: Socket) {
    void client.leave('outbreak-events');
    return { event: 'unsubscribed', data: { channel: 'outbreak-events' } };
  }

  @SubscribeMessage('unsubscribe:health-alerts')
  handleUnsubscribeHealthAlerts(@ConnectedSocket() client: Socket) {
    void client.leave('health-alerts');
    return { event: 'unsubscribed', data: { channel: 'health-alerts' } };
  }

  broadcastStats(stats: StatsUpdate) {
    this.server.to('stats').emit('stats:updated', stats);
  }

  broadcastAnimalEvent(event: AnimalEvent) {
    this.server.to('animal-events').emit('animal:event', event);
  }

  broadcastVaccinationEvent(
    type: VaccinationEvent['type'],
    vaccination: Record<string, unknown>,
  ) {
    this.server.to('vaccination-events').emit('vaccination:event', {
      type,
      vaccination,
      timestamp: new Date().toISOString(),
    } satisfies VaccinationEvent);
  }

  broadcastOutbreakEvent(
    type: OutbreakEvent['type'],
    outbreak: Record<string, unknown>,
  ) {
    this.server.to('outbreak-events').emit('outbreak:event', {
      type,
      outbreak,
      timestamp: new Date().toISOString(),
    } satisfies OutbreakEvent);
  }

  broadcastHealthAlert(alert: Omit<HealthAlert, 'timestamp'>) {
    this.server.to('health-alerts').emit('health:alert', {
      ...alert,
      timestamp: new Date().toISOString(),
    } satisfies HealthAlert);
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}
