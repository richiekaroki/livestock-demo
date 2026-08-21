import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiResponse } from '@wam-mfugo/shared';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SessionService } from './session.service';

const REFRESH_COOKIE = 'wam_refresh_token';
const isProd = process.env.NODE_ENV === 'production';

function setRefreshCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
    expires: expiresAt,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    path: '/',
  });
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('request-otp')
  async requestOtp(
    @Body() dto: RequestOtpDto,
    @Req() req: { ip?: string },
  ): Promise<ApiResponse<{ message: string }>> {
    const result = await this.authService.requestOtp(dto.email, req.ip);
    return { success: true, data: result };
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: { ip?: string; headers: Record<string, string> },
    @Res() res: Response,
  ): Promise<void> {
    const device = req.headers['user-agent'];
    const data = await this.authService.verifyOtp(
      dto.email,
      dto.otp,
      req.ip,
      device,
    );

    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 7);
    setRefreshCookie(res, data.refreshToken, refreshExpires);

    res.json({
      success: true,
      data: {
        ...data,
        refreshToken: undefined,
      },
    });
  }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: { ip?: string },
  ): Promise<ApiResponse<{ message: string }>> {
    const result = await this.authService.register(dto, req.ip);
    return { success: true, data: result };
  }

  @Post('verify-registration')
  async verifyRegistration(
    @Body() dto: VerifyOtpDto,
    @Req() req: { ip?: string; headers: Record<string, string> },
    @Res() res: Response,
  ): Promise<void> {
    const device = req.headers['user-agent'];
    const data = await this.authService.verifyRegistration(
      dto.email,
      dto.otp,
      req.ip,
      device,
    );

    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 7);
    setRefreshCookie(res, data.refreshToken, refreshExpires);

    res.json({
      success: true,
      data: {
        ...data,
        refreshToken: undefined,
      },
    });
  }

  @Post('refresh')
  async refresh(
    @Req() req: { ip?: string; headers: Record<string, string>; cookies?: Record<string, string> },
    @Res() res: Response,
  ): Promise<void> {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      });
      return;
    }

    const device = req.headers['user-agent'];
    const data = await this.authService.refreshToken(
      refreshToken,
      req.ip,
      device,
    );

    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 7);
    setRefreshCookie(res, data.refreshToken, refreshExpires);

    res.json({
      success: true,
      data: {
        ...data,
        refreshToken: undefined,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(
    @Req()
    req: {
      user: { sub: number };
      ip?: string;
      body: { sessionId?: number };
    },
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.logout(req.user.sub, req.body?.sessionId, req.ip);
    clearRefreshCookie(res);
    res.json({ success: true, data: { message: 'Logged out' } });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: { user: { sub: number } }) {
    const data = await this.authService.getProfile(req.user.sub);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @Req() req: { user: { sub: number } },
    @Body() dto: UpdateProfileDto,
  ) {
    const data = await this.authService.updateProfile(req.user.sub, dto);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  async getSessions(@Req() req: { user: { sub: number } }) {
    const data = await this.sessionService.listSessions(req.user.sub);
    return { success: true, data };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  async revokeSession(
    @Req() req: { user: { sub: number }; params: { id: string } },
  ): Promise<ApiResponse<{ message: string }>> {
    await this.sessionService.revokeSession(parseInt(req.params.id, 10));
    return { success: true, data: { message: 'Session revoked' } };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions')
  async revokeAllSessions(
    @Req() req: { user: { sub: number } },
  ): Promise<ApiResponse<{ message: string }>> {
    await this.sessionService.revokeAllSessions(req.user.sub);
    return { success: true, data: { message: 'All sessions revoked' } };
  }
}
