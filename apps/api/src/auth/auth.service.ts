import { Inject, Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthPayload, AuthResponse, RegisterRequest, UpdateProfileRequest, UserRole } from '@wam-mfugo/shared';
import { USER_REPOSITORY, type UserRepository } from './user.repository';
import { OtpService } from './otp.service';
import { SessionService } from './session.service';
import { AuditService } from './audit.service';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  private readonly otpMaxRequests: number;

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    private readonly otpService: OtpService,
    private readonly sessionService: SessionService,
    private readonly auditService: AuditService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {
    this.otpMaxRequests = parseInt(process.env.OTP_MAX_REQUESTS || '5', 10);
  }

  async requestOtp(email: string, ip?: string): Promise<{ message: string }> {
    const user = await this.userRepo.findByEmail(email);

    if (user && !user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (user && this.otpService.isLocked(user.failedOtpAttempts, user.lockedUntil)) {
      const seconds = this.otpService.getLockoutSeconds(user.lockedUntil!);
      throw new UnauthorizedException(
        `Account locked. Try again in ${Math.ceil(seconds / 60)} minutes.`,
      );
    }

    const otp = await this.otpService.createOtp(email, 'login');
    await this.emailService.sendOtpEmail(email, otp, 'login', user?.name);

    return { message: 'OTP sent to your email' };
  }

  async verifyOtp(
    email: string,
    otp: string,
    ip?: string,
    device?: string,
  ): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('No account found with this email');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (this.otpService.isLocked(user.failedOtpAttempts, user.lockedUntil)) {
      const seconds = this.otpService.getLockoutSeconds(user.lockedUntil!);
      throw new UnauthorizedException(
        `Account locked. Try again in ${Math.ceil(seconds / 60)} minutes.`,
      );
    }

    const result = await this.otpService.verifyOtp(email, otp, 'login', ip);

    if (!result.valid) {
      const { failedOtpAttempts, lockedUntil } =
        await this.otpService.incrementFailedAttempts(user.failedOtpAttempts);

      await this.userRepo.update(user.id, {
        failedOtpAttempts,
        lockedUntil: lockedUntil?.toISOString(),
      });

      if (lockedUntil) {
        await this.auditService.logEvent({
          event: 'account_locked',
          email,
          userId: user.id,
          ip,
          metadata: { lockedUntil: lockedUntil.toISOString() },
        });
      }

      throw new UnauthorizedException(result.reason);
    }

    await this.userRepo.update(user.id, { failedOtpAttempts: 0, lockedUntil: null });

    return this.issueTokens(user.id, user.email, user.role, ip, device);
  }

  async register(
    data: RegisterRequest,
    ip?: string,
  ): Promise<{ message: string }> {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = await this.userRepo.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
      role: (data.role || 'farmer') as UserRole,
      county: data.county,
      subCounty: data.subCounty,
    });

    await this.auditService.logEvent({
      event: 'account_created',
      email: data.email,
      userId: user.id,
      ip,
      metadata: { role: user.role },
    });

    const otp = await this.otpService.createOtp(data.email, 'register');
    await this.emailService.sendOtpEmail(data.email, otp, 'register', data.name);

    return { message: 'Account created. Please verify your email with the OTP sent.' };
  }

  async verifyRegistration(
    email: string,
    otp: string,
    ip?: string,
    device?: string,
  ): Promise<AuthResponse> {
    const result = await this.otpService.verifyOtp(email, otp, 'register', ip);
    if (!result.valid) {
      throw new UnauthorizedException(result.reason);
    }

    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Account not found');
    }

    return this.issueTokens(user.id, user.email, user.role, ip, device);
  }

  async refreshToken(
    refreshToken: string,
    ip?: string,
    device?: string,
  ): Promise<AuthResponse> {
    const session = await this.sessionService.findSession(refreshToken);
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date(session.expiresAt) < new Date()) {
      await this.sessionService.revokeSession(session.id);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.userRepo.findById(session.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account not found or deactivated');
    }

    const newSession = await this.sessionService.rotateSession(
      session.id,
      user.id,
      refreshToken,
      device || session.device,
      ip || session.ip,
    );

    await this.auditService.logEvent({
      event: 'token_refreshed',
      email: user.email,
      userId: user.id,
      ip,
    });

    const payload: AuthPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        county: user.county,
        subCounty: user.subCounty,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
      session: newSession,
    };
  }

  async logout(userId: number, sessionId?: number, ip?: string): Promise<void> {
    if (sessionId) {
      await this.sessionService.revokeSession(sessionId);
    } else {
      await this.sessionService.revokeAllSessions(userId);
    }

    const user = await this.userRepo.findById(userId);
    await this.auditService.logEvent({
      event: 'logout',
      email: user?.email,
      userId,
      ip,
    });
  }

  async getProfile(userId: number) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      county: user.county,
      subCounty: user.subCounty,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateProfile(userId: number, data: UpdateProfileRequest) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const updated = await this.userRepo.update(userId, {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.county !== undefined && { county: data.county }),
      ...(data.subCounty !== undefined && { subCounty: data.subCounty }),
    });

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      role: updated.role,
      county: updated.county,
      subCounty: updated.subCounty,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }

  private async issueTokens(
    userId: number,
    email: string,
    role: string,
    ip?: string,
    device?: string,
  ): Promise<AuthResponse> {
    const payload: AuthPayload = { sub: userId, email, role: role as UserRole };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { sub: userId, type: 'refresh' },
      {
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ||
          '7d') as unknown as number,
      },
    );

    const session = await this.sessionService.createSession(
      userId,
      refreshToken,
      device,
      ip,
    );

    const user = await this.userRepo.findById(userId);

    await this.auditService.logEvent({
      event: 'login_success',
      email,
      userId,
      ip,
      metadata: { role },
    });

    return {
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        phone: user!.phone,
        role: user!.role,
        county: user!.county,
        subCounty: user!.subCounty,
        isActive: user!.isActive,
        createdAt: user!.createdAt,
        updatedAt: user!.updatedAt,
      },
      accessToken,
      refreshToken,
      session,
    };
  }
}
