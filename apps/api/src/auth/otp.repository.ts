export const OTP_REPOSITORY = Symbol('OTP_REPOSITORY');

export interface OtpRecord {
  id: number;
  email: string;
  code: string;
  expiresAt: Date;
  used: boolean;
  purpose: string;
  createdAt: Date;
}

export interface OtpRepository {
  create(data: {
    email: string;
    code: string;
    expiresAt: Date;
    purpose: string;
  }): Promise<OtpRecord>;
  findValid(email: string, purpose: string): Promise<OtpRecord | null>;
  markUsed(id: number): Promise<void>;
  deleteExpired(): Promise<void>;
}
