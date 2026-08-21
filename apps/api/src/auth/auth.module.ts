import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../common/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { SessionService } from './session.service';
import { AuditService } from './audit.service';
import { EmailService } from './email.service';
import { JwtStrategy } from './jwt.strategy';
import { USER_REPOSITORY } from './user.repository';
import { OTP_REPOSITORY } from './otp.repository';
import { SESSION_REPOSITORY } from './session.repository';
import { AUDIT_REPOSITORY } from './audit.repository';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaOtpRepository } from './prisma-otp.repository';
import { PrismaSessionRepository } from './prisma-session.repository';
import { PrismaAuditRepository } from './prisma-audit.repository';
import { InMemoryUserRepository } from './in-memory-user.repository';
import { InMemoryOtpRepository } from './in-memory-otp.repository';
import { InMemorySessionRepository } from './in-memory-session.repository';
import { InMemoryAuditRepository } from './in-memory-audit.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as unknown as number,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OtpService,
    SessionService,
    AuditService,
    EmailService,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return new PrismaUserRepository(new PrismaService());
        }
        return new InMemoryUserRepository();
      },
    },
    {
      provide: OTP_REPOSITORY,
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return new PrismaOtpRepository(new PrismaService());
        }
        return new InMemoryOtpRepository();
      },
    },
    {
      provide: SESSION_REPOSITORY,
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return new PrismaSessionRepository(new PrismaService());
        }
        return new InMemorySessionRepository();
      },
    },
    {
      provide: AUDIT_REPOSITORY,
      useFactory: () => {
        if (process.env.DATABASE_URL) {
          return new PrismaAuditRepository(new PrismaService());
        }
        return new InMemoryAuditRepository();
      },
    },
  ],
  exports: [
    AuthService,
    JwtModule,
    JwtStrategy,
    USER_REPOSITORY,
    SessionService,
    AuditService,
  ],
})
export class AuthModule {}
