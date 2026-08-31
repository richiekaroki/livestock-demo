import type {
  InvitationRepository,
  PendingInvitationData,
} from './invitation.repository';

export class InMemoryInvitationRepository implements InvitationRepository {
  private invitations: PendingInvitationData[] = [];
  private nextId = 1;

  async create(data: {
    email: string;
    name: string;
    phone?: string;
    county: string;
    subCounty?: string;
    token: string;
    expiresAt: Date;
  }): Promise<PendingInvitationData> {
    const invitation: PendingInvitationData = {
      id: this.nextId++,
      email: data.email,
      name: data.name,
      phone: data.phone ?? null,
      county: data.county,
      subCounty: data.subCounty ?? null,
      token: data.token,
      expiresAt: data.expiresAt,
      used: false,
      createdAt: new Date(),
    };
    this.invitations.push(invitation);
    return invitation;
  }

  async findByToken(token: string): Promise<PendingInvitationData | null> {
    return this.invitations.find((i) => i.token === token) ?? null;
  }

  async markUsed(id: number): Promise<void> {
    const invitation = this.invitations.find((i) => i.id === id);
    if (invitation) invitation.used = true;
  }

  async deleteExpired(): Promise<void> {
    const now = new Date();
    this.invitations = this.invitations.filter(
      (i) => !i.used && i.expiresAt > now,
    );
  }
}
