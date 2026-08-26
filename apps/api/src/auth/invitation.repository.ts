export const INVITATION_REPOSITORY = Symbol('INVITATION_REPOSITORY');

export interface PendingInvitationData {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  county: string;
  subCounty: string | null;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

export interface InvitationRepository {
  create(data: {
    email: string;
    name: string;
    phone?: string;
    county: string;
    subCounty?: string;
    token: string;
    expiresAt: Date;
  }): Promise<PendingInvitationData>;
  findByToken(token: string): Promise<PendingInvitationData | null>;
  markUsed(id: number): Promise<void>;
  deleteExpired(): Promise<void>;
}
