import {
  Inject,
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import type { AuthResponse, UserRole } from '@wam-mfugo/shared';
import {
  INVITATION_REPOSITORY,
  type InvitationRepository,
} from './invitation.repository';
import { USER_REPOSITORY, type UserRepository } from './user.repository';
import { EmailService } from './email.service';
import { AuditService } from './audit.service';
import { OtpService } from './otp.service';
import { SessionService } from './session.service';
import { JwtService } from '@nestjs/jwt';

const INVITATION_EXPIRY_HOURS = 24;
const WEB_BASE_URL = process.env.WEB_BASE_URL || 'http://localhost:5173';

@Injectable()
export class InvitationService {
  constructor(
    @Inject(INVITATION_REPOSITORY)
    private readonly invitationRepo: InvitationRepository,
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepository,
    private readonly emailService: EmailService,
    private readonly auditService: AuditService,
    private readonly sessionService: SessionService,
    private readonly jwtService: JwtService,
  ) {}

  async createInvitation(data: {
    email: string;
    name: string;
    phone?: string;
    county: string;
    subCounty?: string;
  }): Promise<{ message: string; inviteLink?: string }> {
    const existing = await this.userRepo.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + INVITATION_EXPIRY_HOURS);

    await this.invitationRepo.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
      county: data.county,
      subCounty: data.subCounty,
      token,
      expiresAt,
    });

    const inviteLink = `${WEB_BASE_URL}/verify-invite/${token}`;
    await this.emailService.sendInvitationEmail(
      data.email,
      data.name,
      inviteLink,
      INVITATION_EXPIRY_HOURS,
    );

    const isDemo = (process.env.EMAIL_PROVIDER || 'console') === 'console';
    return {
      message: 'Registration link sent to your email',
      ...(isDemo && { inviteLink }),
    };
  }

  async verifyInvitation(
    token: string,
    ip?: string,
    device?: string,
  ): Promise<AuthResponse> {
    const invitation = await this.invitationRepo.findByToken(token);

    if (!invitation) {
      throw new BadRequestException('Invalid or expired registration link');
    }

    if (invitation.used) {
      throw new BadRequestException(
        'This registration link has already been used',
      );
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      throw new BadRequestException('This registration link has expired');
    }

    const existing = await this.userRepo.findByEmail(invitation.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = await this.userRepo.create({
      email: invitation.email,
      name: invitation.name,
      phone: invitation.phone || '',
      role: 'farmer',
      county: invitation.county,
      subCounty: invitation.subCounty || undefined,
    });

    await this.invitationRepo.markUsed(invitation.id);

    await this.auditService.logEvent({
      event: 'account_created',
      email: invitation.email,
      userId: user.id,
      ip,
      metadata: { role: user.role, method: 'invitation' },
    });

    return this.issueTokens(user.id, user.email, user.role, ip, device);
  }

  private async issueTokens(
    userId: number,
    email: string,
    role: string,
    ip?: string,
    device?: string,
  ): Promise<AuthResponse> {
    const payload = { sub: userId, email, role: role as UserRole };
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
      metadata: { role, method: 'invitation' },
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
