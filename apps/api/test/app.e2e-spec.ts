import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { ApiResponse, AuthResponse, Livestock } from '@wam-mfugo/shared';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { OtpService } from './../src/auth/otp.service';

const ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'rkabue23@gmail.com';

describe('Wam Mfugo API (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    // Create OTP directly (avoids HTTP round-trip + email sending)
    const otpService = moduleFixture.get(OtpService);
    const otp = await otpService.createOtp(ADMIN_EMAIL, 'login');

    // Verify via HTTP to exercise the full guard + JWT flow
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/verify-otp')
      .send({ email: ADMIN_EMAIL, otp });

    const body = loginRes.body as ApiResponse<AuthResponse>;
    accessToken = body.data.accessToken;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('/api/health (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.status).toBe(200);
    const body = res.body as { status: string };
    expect(body.status).toBe('ok');
  });

  it('/api/animals (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/animals')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    const body = res.body as ApiResponse<Livestock[]>;
    expect(body.success).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
  });

  it('/api/animals (POST) creates and validates', async () => {
    const valid = {
      name: 'Test Bull',
      type: 'Cattle',
      health: 'Healthy',
      county: 'Nakuru',
      owner: 'Jane Doe',
      lat: -0.28,
      lng: 36.08,
    };

    const created = await request(app.getHttpServer())
      .post('/api/animals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(valid);
    expect(created.status).toBe(201);
    const createdBody = created.body as ApiResponse<Livestock>;
    expect(createdBody.success).toBe(true);

    const invalid = await request(app.getHttpServer())
      .post('/api/animals')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...valid, name: 'A' });
    expect(invalid.status).toBe(400);
  });

  it('/api/stats (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/stats')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    const body = res.body as ApiResponse<{ totalAnimals: number }>;
    expect(body.data.totalAnimals).toBeGreaterThan(0);
  });

  it('/api/kiamis/register validates national ID', async () => {
    const base = {
      animalType: 'Cattle',
      countyCode: '012',
      subCountyCode: '01',
      wardCode: '01',
      biometricHash: 'abc',
      gpsCoordinates: { lat: -0.28, lng: 36.08 },
      timestamp: new Date().toISOString(),
    };

    const ok = await request(app.getHttpServer())
      .post('/api/kiamis/register')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...base, ownerNationalID: '1234567' });
    expect(ok.status).toBe(201);
    const okBody = ok.body as {
      success: boolean;
      animalRegistrationNumber: string;
    };
    expect(okBody.success).toBe(true);
    expect(okBody.animalRegistrationNumber).toMatch(/^KE-/);

    const bad = await request(app.getHttpServer())
      .post('/api/kiamis/register')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...base, ownerNationalID: 'ABC123' });
    expect(bad.status).toBe(400);
  });
});
