import type { OtpRepository, OtpRecord } from './otp.repository';

export class InMemoryOtpRepository implements OtpRepository {
  private otps: OtpRecord[] = [];
  private nextId = 1;

  async create(data: { email: string; code: string; expiresAt: Date; purpose: string }): Promise<OtpRecord> {
    const record: OtpRecord = {
      id: this.nextId++,
      email: data.email,
      code: data.code,
      expiresAt: data.expiresAt,
      used: false,
      purpose: data.purpose,
      createdAt: new Date(),
    };
    this.otps.push(record);
    return record;
  }

  async findValid(email: string, purpose: string): Promise<OtpRecord | null> {
    const now = new Date();
    return (
      this.otps.find(
        (o) => o.email === email && o.purpose === purpose && !o.used && o.expiresAt > now,
      ) ?? null
    );
  }

  async markUsed(id: number): Promise<void> {
    const otp = this.otps.find((o) => o.id === id);
    if (otp) otp.used = true;
  }

  async deleteExpired(): Promise<void> {
    const now = new Date();
    this.otps = this.otps.filter((o) => o.expiresAt > now);
  }
}
