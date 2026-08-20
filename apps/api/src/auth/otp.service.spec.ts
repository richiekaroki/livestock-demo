import { OtpService } from './otp.service';
import { InMemoryOtpRepository } from './in-memory-otp.repository';
import { InMemoryAuditRepository } from './in-memory-audit.repository';

describe('OtpService', () => {
  let service: OtpService;
  let otpRepo: InMemoryOtpRepository;
  let auditRepo: InMemoryAuditRepository;

  beforeEach(() => {
    otpRepo = new InMemoryOtpRepository();
    auditRepo = new InMemoryAuditRepository();
    service = new OtpService(otpRepo as any, auditRepo as any);
  });

  it('generates a 6-digit OTP', () => {
    const otp = service.generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
    expect(otp.length).toBe(6);
  });

  it('hashes OTP with SHA-256', () => {
    const hash = service.hashOtp('123456');
    expect(hash).toHaveLength(64);
    expect(typeof hash).toBe('string');
  });

  it('creates and verifies a valid OTP', async () => {
    const otp = await service.createOtp('test@example.com', 'login');
    expect(otp).toMatch(/^\d{6}$/);

    const result = await service.verifyOtp('test@example.com', otp, 'login');
    expect(result.valid).toBe(true);
  });

  it('rejects an invalid OTP', async () => {
    await service.createOtp('test@example.com', 'login');
    const result = await service.verifyOtp('test@example.com', '000000', 'login');
    expect(result.valid).toBe(false);
    expect(result.reason).toBeDefined();
  });

  it('rejects an expired OTP', async () => {
    const otp = service.generateOtp();
    const hashedCode = service.hashOtp(otp);
    const expiresAt = new Date(Date.now() - 1000); // Already expired

    await otpRepo.create({
      email: 'test@example.com',
      code: hashedCode,
      expiresAt,
      purpose: 'login',
    });

    const result = await service.verifyOtp('test@example.com', otp, 'login');
    expect(result.valid).toBe(false);
  });

  it('prevents reuse of used OTP', async () => {
    const otp = await service.createOtp('test@example.com', 'login');
    await service.verifyOtp('test@example.com', otp, 'login');

    const result = await service.verifyOtp('test@example.com', otp, 'login');
    expect(result.valid).toBe(false);
  });

  it('detects locked accounts', () => {
    const lockedUntil = new Date(Date.now() + 60000).toISOString();
    expect(service.isLocked(5, lockedUntil)).toBe(true);
    expect(service.isLocked(0, null)).toBe(false);
    expect(service.isLocked(3, undefined)).toBe(false);
  });

  it('increments failed attempts and locks after max', async () => {
    const result1 = await service.incrementFailedAttempts(0);
    expect(result1.failedOtpAttempts).toBe(1);
    expect(result1.lockedUntil).toBeUndefined();

    const result4 = await service.incrementFailedAttempts(4);
    expect(result4.failedOtpAttempts).toBe(5);
    expect(result4.lockedUntil).toBeInstanceOf(Date);
  });
});
